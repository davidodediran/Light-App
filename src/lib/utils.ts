import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { createHash } from 'crypto'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date))
}

export function getDeadline(hoursFromNow = 24): Date {
  return new Date(Date.now() + hoursFromNow * 60 * 60 * 1000)
}

export function isOverdue(deadlineAt: string | Date): boolean {
  return new Date(deadlineAt) < new Date()
}

export function generateStudentCode(): string {
  return 'STU-' + Math.random().toString(36).substring(2, 8).toUpperCase()
}

export function generateThreadId(parentId: string, teacherId: string, studentId: string): string {
  return createHash('sha256')
    .update([parentId, teacherId, studentId].sort().join(':'))
    .digest('hex')
    .substring(0, 32)
}

export function getEscalationLabel(status: string): string {
  const labels: Record<string, string> = {
    open:                 'Open',
    attempt_1:            'Attempt 1',
    attempt_2:            'Attempt 2',
    attempt_3:            'Attempt 3',
    escalated_class:      'Escalated to Class Teacher',
    escalated_principal:  'Escalated to Principal',
    escalated_director:   'Escalated to Director',
    escalated_owner:      'Escalated to Owner',
    resolved:             'Resolved',
    closed:               'Closed',
  }
  return labels[status] ?? status
}
