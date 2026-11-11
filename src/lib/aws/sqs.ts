import {
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs'

export const sqsClient = new SQSClient({
  region: process.env.AWS_REGION ?? 'us-east-1',
})

const QUEUE_URL = process.env.SQS_QUEUE_URL!

export type QueueEventType =
  | 'new_ticket'
  | 'escalation'
  | 'ticket_response'
  | 'ticket_resolved'
  | 'new_announcement'
  | 'send_email'

export interface QueueEvent {
  type: QueueEventType
  payload: Record<string, unknown>
  timestamp: string
}

export async function enqueue(event: Omit<QueueEvent, 'timestamp'>) {
  const body: QueueEvent = { ...event, timestamp: new Date().toISOString() }
  return sqsClient.send(new SendMessageCommand({
    QueueUrl: QUEUE_URL,
    MessageBody: JSON.stringify(body),
    MessageGroupId: event.type,
  }))
}

export async function receiveMessages(maxMessages = 10) {
  return sqsClient.send(new ReceiveMessageCommand({
    QueueUrl: QUEUE_URL,
    MaxNumberOfMessages: maxMessages,
    WaitTimeSeconds: 20,
  }))
}

export async function deleteMessage(receiptHandle: string) {
  return sqsClient.send(new DeleteMessageCommand({
    QueueUrl: QUEUE_URL,
    ReceiptHandle: receiptHandle,
  }))
}
