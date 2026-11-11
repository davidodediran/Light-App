import {
  ChimeSDKMeetingsClient,
  CreateMeetingCommand,
  CreateAttendeeCommand,
  DeleteMeetingCommand,
  GetMeetingCommand,
} from '@aws-sdk/client-chime-sdk-meetings'
import { randomUUID } from 'crypto'

export const chimeClient = new ChimeSDKMeetingsClient({
  region: process.env.CHIME_REGION ?? 'us-east-1',
})

export async function createMeeting(ticketId: string) {
  const cmd = new CreateMeetingCommand({
    ClientRequestToken: randomUUID(),
    MediaRegion: process.env.CHIME_REGION ?? 'us-east-1',
    ExternalMeetingId: ticketId,
  })
  const res = await chimeClient.send(cmd)
  return res.Meeting!
}

export async function createAttendee(meetingId: string, userId: string) {
  const cmd = new CreateAttendeeCommand({
    MeetingId: meetingId,
    ExternalUserId: userId,
  })
  const res = await chimeClient.send(cmd)
  return res.Attendee!
}

export async function deleteMeeting(meetingId: string) {
  return chimeClient.send(new DeleteMeetingCommand({ MeetingId: meetingId }))
}

export async function getMeeting(meetingId: string) {
  const res = await chimeClient.send(new GetMeetingCommand({ MeetingId: meetingId }))
  return res.Meeting
}
