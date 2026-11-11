import {
  SESClient,
  SendEmailCommand,
  type SendEmailCommandInput,
} from '@aws-sdk/client-ses'

export const sesClient = new SESClient({
  region: process.env.AWS_REGION ?? 'us-east-1',
})

const FROM = `${process.env.SES_FROM_NAME ?? 'Light App'} <${process.env.SES_FROM_ADDRESS}>`

export async function sendEmail(to: string | string[], subject: string, html: string, text?: string) {
  const toList = Array.isArray(to) ? to : [to]
  const input: SendEmailCommandInput = {
    Source: FROM,
    Destination: { ToAddresses: toList },
    Message: {
      Subject: { Data: subject, Charset: 'UTF-8' },
      Body: {
        Html: { Data: html, Charset: 'UTF-8' },
        ...(text ? { Text: { Data: text, Charset: 'UTF-8' } } : {}),
      },
    },
  }
  return sesClient.send(new SendEmailCommand(input))
}

export function escalationEmailHtml(params: {
  ticketTitle: string
  escalationLevel: string
  parentName: string
  studentName: string
  ticketUrl: string
}): string {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#1e40af">Ticket Escalated — ${params.escalationLevel}</h2>
      <p>The following ticket has been escalated:</p>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:8px;font-weight:bold">Ticket</td><td style="padding:8px">${params.ticketTitle}</td></tr>
        <tr><td style="padding:8px;font-weight:bold">Parent</td><td style="padding:8px">${params.parentName}</td></tr>
        <tr><td style="padding:8px;font-weight:bold">Student</td><td style="padding:8px">${params.studentName}</td></tr>
      </table>
      <a href="${params.ticketUrl}" style="display:inline-block;margin-top:16px;padding:10px 20px;background:#1e40af;color:#fff;text-decoration:none;border-radius:6px">View Ticket</a>
    </div>
  `
}
