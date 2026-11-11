import { NextRequest, NextResponse } from 'next/server'
import { getMeeting, createAttendee } from '@/lib/aws/chime'

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id')!
  const { meetingId } = await req.json()

  try {
    const meeting = await getMeeting(meetingId)
    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found or ended' }, { status: 404 })
    }

    const attendee = await createAttendee(meetingId, userId)
    return NextResponse.json({ meeting, attendee })
  } catch (err) {
    console.error('Chime join error:', err)
    return NextResponse.json({ error: 'Failed to join call' }, { status: 500 })
  }
}
