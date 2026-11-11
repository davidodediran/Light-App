import { RDSDataClient, ExecuteStatementCommand } from '@aws-sdk/client-rds-data'
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs'

const rds = new RDSDataClient({ region: process.env.AWS_REGION })
const sqs = new SQSClient({ region: process.env.AWS_REGION })

const ESCALATION_CHAIN = {
  open:                'escalated_class',
  attempt_1:           'escalated_class',
  attempt_2:           'escalated_class',
  attempt_3:           'escalated_class',
  escalated_class:     'escalated_principal',
  escalated_principal: 'escalated_director',
  escalated_director:  'escalated_owner',
}

const NEXT_DEADLINE_HOURS = {
  escalated_class:      48,
  escalated_principal:  72,
  escalated_director:   96,
  escalated_owner:      null,
}

export const handler = async () => {
  console.log('Escalation engine running at', new Date().toISOString())

  const now = new Date()

  const result = await rds.send(new ExecuteStatementCommand({
    resourceArn: process.env.AURORA_CLUSTER_ARN,
    secretArn:   process.env.AURORA_SECRET_ARN,
    database:    process.env.AURORA_DATABASE_NAME,
    sql: `
      SELECT id, status, institution_id, parent_id, student_id, assigned_teacher_id,
             class_teacher_id, principal_id, title
      FROM tickets
      WHERE escalation_deadline_at < :now
        AND status NOT IN ('resolved', 'closed', 'escalated_owner')
    `,
    parameters: [{ name: 'now', value: { stringValue: now.toISOString() } }],
  }))

  const tickets = result.records ?? []
  console.log(`Found ${tickets.length} overdue tickets`)

  for (const row of tickets) {
    const [idCol, statusCol, instCol, parentCol, , , , , titleCol] = row
    const id            = idCol.stringValue
    const status        = statusCol.stringValue
    const institutionId = instCol.stringValue
    const parentId      = parentCol.stringValue
    const title         = titleCol.stringValue

    const nextStatus = ESCALATION_CHAIN[status]
    if (!nextStatus) continue

    const nextHours   = NEXT_DEADLINE_HOURS[nextStatus]
    const nextDeadline = nextHours
      ? new Date(now.getTime() + nextHours * 3600000).toISOString()
      : null

    await rds.send(new ExecuteStatementCommand({
      resourceArn: process.env.AURORA_CLUSTER_ARN,
      secretArn:   process.env.AURORA_SECRET_ARN,
      database:    process.env.AURORA_DATABASE_NAME,
      sql: `
        UPDATE tickets
        SET status = :status,
            escalation_deadline_at = :deadline,
            updated_at = NOW()
        WHERE id = :id
      `,
      parameters: [
        { name: 'status',   value: { stringValue: nextStatus } },
        { name: 'deadline', value: nextDeadline ? { stringValue: nextDeadline } : { isNull: true } },
        { name: 'id',       value: { stringValue: id } },
      ],
    }))

    await rds.send(new ExecuteStatementCommand({
      resourceArn: process.env.AURORA_CLUSTER_ARN,
      secretArn:   process.env.AURORA_SECRET_ARN,
      database:    process.env.AURORA_DATABASE_NAME,
      sql: `
        INSERT INTO ticket_messages (id, ticket_id, sender_id, sender_role, content, message_type, created_at)
        VALUES (gen_random_uuid(), :ticketId, 'system', 'system', :content, 'system', NOW())
      `,
      parameters: [
        { name: 'ticketId', value: { stringValue: id } },
        { name: 'content',  value: { stringValue: `Ticket automatically escalated to ${nextStatus.replace(/_/g, ' ')} due to no response within the deadline.` } },
      ],
    }))

    await sqs.send(new SendMessageCommand({
      QueueUrl: process.env.SQS_QUEUE_URL,
      MessageBody: JSON.stringify({
        type: 'escalation',
        payload: { ticketId: id, institutionId, parentId, title, newStatus: nextStatus },
        timestamp: now.toISOString(),
      }),
    }))

    if (nextStatus === 'escalated_principal') {
      await sqs.send(new SendMessageCommand({
        QueueUrl: process.env.SQS_QUEUE_URL,
        MessageBody: JSON.stringify({
          type: 'generate_ai_summary',
          payload: { ticketId: id },
          timestamp: now.toISOString(),
        }),
      }))
    }

    console.log(`Escalated ticket ${id}: ${status} → ${nextStatus}`)
  }

  return { escalated: tickets.length }
}
