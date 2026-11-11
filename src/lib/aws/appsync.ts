export const APPSYNC_CONFIG = {
  url:    process.env.NEXT_PUBLIC_APPSYNC_URL ?? '',
  apiKey: process.env.NEXT_PUBLIC_APPSYNC_API_KEY ?? '',
}

export async function appSyncMutation(query: string, variables: Record<string, unknown>) {
  const res = await fetch(process.env.APPSYNC_API_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.APPSYNC_API_KEY!,
    },
    body: JSON.stringify({ query, variables }),
  })
  return res.json()
}

export async function publishNotification(userId: string, notification: {
  type: string
  title: string
  body: string
  ticketId?: string
}) {
  return appSyncMutation(`
    mutation PublishNotification($userId: ID!, $notification: NotificationInput!) {
      publishNotification(userId: $userId, notification: $notification) {
        id type title body ticketId createdAt
      }
    }
  `, { userId, notification })
}

export async function publishTicketMessage(ticketId: string, message: {
  id: string
  senderId: string
  senderRole: string
  content?: string
  messageType: string
}) {
  return appSyncMutation(`
    mutation PublishMessage($ticketId: ID!, $message: MessageInput!) {
      publishMessage(ticketId: $ticketId, message: $message) {
        id senderId senderRole content messageType createdAt
      }
    }
  `, { ticketId, message })
}

export async function publishIncomingCall(parentId: string, call: {
  callId: string
  ticketId: string
  callerName: string
  meetingId: string
}) {
  return appSyncMutation(`
    mutation PublishIncomingCall($parentId: ID!, $call: IncomingCallInput!) {
      publishIncomingCall(parentId: $parentId, call: $call) {
        callId ticketId callerName meetingId
      }
    }
  `, { parentId, call })
}
