import { NextRequest, NextResponse } from 'next/server'
import { createMeeting, createAttendee } from '@/lib/aws/chime'
import { publishIncomingCall } from '@/lib/aws/appsync'
import { canInitiateCall } from '@/types'
import type { UserRole } from '@/types'

export async function POST(req: NextRequest) {
  const role = req.headers.get('x-user-role') as UserRole
  const callerId = req.headers.get('x-user-id')!

  if (!canInitiateCall(role)) {
    return NextResponse.json({ error: 'Only teachers and principals can initiate calls' }, { status: 403 })
  }

  const { ticketId, parentId, callerName } = await req.json()

  try {
    const meeting = await createMeeting(ticketId)
    const callerAttendee = await createAttendee(meeting.MeetingId!, callerId)
    const parentAttendee = await createAttendee(meeting.MeetingId!, parentId)

    await publishIncomingCall(parentId, {
      callId: meeting.MeetingId!,
      ticketId,
      callerName,
      meetingId: meeting.MeetingId!,
    })

    return NextResponse.json({
      meeting,
      attendee: callerAttendee,
      parentAttendeeId: parentAttendee.AttendeeId,
    })
  } catch (err) {
    console.error('Chime create meeting error:', err)
    return NextResponse.json({ error: 'Failed to create call' }, { status: 500 })
  }
}
