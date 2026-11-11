// ── Roles ──────────────────────────────────────────────────────────────────
export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'principal'
  | 'class_teacher'
  | 'subject_teacher'
  | 'parent'
  | 'student'

// ── Ticket ─────────────────────────────────────────────────────────────────
export type TicketStatus =
  | 'open'
  | 'attempt_1'
  | 'attempt_2'
  | 'attempt_3'
  | 'escalated_class'
  | 'escalated_principal'
  | 'escalated_director'
  | 'escalated_owner'
  | 'resolved'
  | 'closed'

export type EscalationLevel =
  | 'class_teacher'
  | 'principal'
  | 'director'
  | 'owner'

export type MessageType = 'text' | 'audio' | 'system' | 'call_note' | 'ai_summary'

export type Satisfaction = 'very_satisfied' | 'satisfied' | 'neutral' | 'dissatisfied' | 'very_dissatisfied'

export type CallStatus = 'ringing' | 'active' | 'ended' | 'declined' | 'missed'

// ── Announcement ───────────────────────────────────────────────────────────
export type AnnouncementAudience = 'all' | 'parents' | 'teachers' | 'students' | 'class'

// ── Notification ───────────────────────────────────────────────────────────
export type NotificationType =
  | 'new_ticket'
  | 'escalation'
  | 'response'
  | 'resolved'
  | 'announcement'
  | 'incoming_call'
  | 'direct_message'

// ── AI Provider ────────────────────────────────────────────────────────────
export type AIProvider = 'bedrock' | 'openai' | 'anthropic' | 'gemini'

// ── Data models ────────────────────────────────────────────────────────────
export interface Institution {
  id: string
  name: string
  slug: string
  logoUrl?: string
  createdAt: string
  aiConfig?: AIConfig
}

export interface User {
  id: string
  institutionId: string
  cognitoId: string
  email: string
  fullName: string
  role: UserRole
  avatarUrl?: string
  phoneNumber?: string
  createdAt: string
}

export interface Student {
  id: string
  institutionId: string
  fullName: string
  studentCode: string
  classId: string
  parentId: string
  dateOfBirth?: string
  createdAt: string
}

export interface Class {
  id: string
  institutionId: string
  name: string
  year: number
  classTeacherId?: string
}

export interface Subject {
  id: string
  institutionId: string
  name: string
  classId: string
  teacherId: string
}

export interface Ticket {
  id: string
  institutionId: string
  parentId: string
  studentId: string
  classId: string
  subjectId?: string
  title: string
  description: string
  status: TicketStatus
  escalationLevel?: EscalationLevel
  assignedTeacherId?: string
  classTeacherId?: string
  principalId?: string
  deadlineAt: string
  escalationDeadlineAt?: string
  chimeMeetingId?: string
  aiSummaryAt?: string
  satisfaction?: Satisfaction
  resolvedAt?: string
  closedAt?: string
  createdAt: string
  updatedAt: string
}

export interface TicketMessage {
  id: string
  ticketId: string
  senderId: string
  senderRole: UserRole
  content?: string
  audioUrl?: string
  messageType: MessageType
  readAt?: string
  createdAt: string
}

export interface DirectMessage {
  id: string
  institutionId: string
  threadId: string
  senderId: string
  senderRole: 'parent' | 'class_teacher' | 'subject_teacher'
  content?: string
  audioUrl?: string
  messageType: 'text' | 'audio'
  readAt?: string
  createdAt: string
}

export interface DirectMessageThread {
  id: string
  institutionId: string
  parentId: string
  teacherId: string
  studentId: string
  lastMessageAt?: string
  parent?: User
  teacher?: User
  student?: Student
}

export interface Announcement {
  id: string
  institutionId: string
  authorId: string
  title: string
  body: string
  audience: AnnouncementAudience
  classId?: string
  pinned: boolean
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  institutionId: string
  type: NotificationType
  title: string
  body: string
  ticketId?: string
  read: boolean
  emailSentAt?: string
  createdAt: string
}

export interface CallLog {
  id: string
  institutionId: string
  ticketId?: string
  chimeMeetingId: string
  initiatedBy: string
  parentId: string
  startedAt?: string
  endedAt?: string
  durationSeconds?: number
  status: CallStatus
}

export interface AIConfig {
  institutionId: string
  provider: AIProvider
  model: string
  enabled: boolean
}

// ── Escalation deadline map ────────────────────────────────────────────────
export const ESCALATION_HOURS: Record<string, number | null> = {
  open:                 24,
  attempt_1:            24,
  attempt_2:            24,
  attempt_3:            24,
  escalated_class:      48,
  escalated_principal:  72,
  escalated_director:   96,
  escalated_owner:      null,
}

export const ESCALATION_CHAIN: Partial<Record<TicketStatus, TicketStatus>> = {
  open:                'escalated_class',
  attempt_1:           'escalated_class',
  attempt_2:           'escalated_class',
  attempt_3:           'escalated_class',
  escalated_class:     'escalated_principal',
  escalated_principal: 'escalated_director',
  escalated_director:  'escalated_owner',
}

// ── Helpers ────────────────────────────────────────────────────────────────
export function getRoleDashboard(role: UserRole): string {
  const map: Record<UserRole, string> = {
    super_admin:     '/dashboard/super-admin',
    admin:           '/dashboard/admin',
    principal:       '/dashboard/principal',
    class_teacher:   '/dashboard/teacher',
    subject_teacher: '/dashboard/teacher',
    parent:          '/dashboard/parent',
    student:         '/dashboard/student',
  }
  return map[role]
}

export function canInitiateCall(role: UserRole): boolean {
  return ['class_teacher', 'subject_teacher', 'principal'].includes(role)
}
