import { Subscription } from '@/types/subscription'
import { getActiveDate } from './renewal'
import { parseISO, addDays } from 'date-fns'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function toIcsDate(dateStr: string): string {
  const d = parseISO(dateStr)
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
}

function escapeIcs(str: string): string {
  return str.replace(/[\\;,]/g, (c) => '\\' + c).replace(/\n/g, '\\n')
}

export function generateIcs(sub: Subscription, reminderDays = 7): string {
  const date = getActiveDate(sub)
  if (!date) return ''

  const dtstart = toIcsDate(date)
  const dtend = toIcsDate(
    addDays(parseISO(date), 1).toISOString().slice(0, 10)
  )
  const now = new Date()
  const dtstamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}T${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}Z`
  const uid = `${sub.id}-renewal@saas-tracker`
  const label = sub.is_trial ? 'Trial ends' : 'Renews'
  const summary = escapeIcs(`${sub.name} — ${label}`)
  const description = escapeIcs(
    [
      sub.url ? `URL: ${sub.url}` : '',
      sub.email ? `Account: ${sub.email}` : '',
      sub.comment ? `Note: ${sub.comment}` : '',
    ]
      .filter(Boolean)
      .join('\\n')
  )

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SaaS Tracker//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;VALUE=DATE:${dtstart}`,
    `DTEND;VALUE=DATE:${dtend}`,
    `SUMMARY:${summary}`,
    description ? `DESCRIPTION:${description}` : '',
    `BEGIN:VALARM`,
    `TRIGGER:-P${reminderDays}D`,
    `ACTION:DISPLAY`,
    `DESCRIPTION:${summary} in ${reminderDays} days`,
    `END:VALARM`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n')
}

export function downloadIcs(sub: Subscription) {
  const content = generateIcs(sub)
  if (!content) return
  const blob = new Blob([content], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${sub.name.replace(/\s+/g, '-').toLowerCase()}-renewal.ics`
  a.click()
  URL.revokeObjectURL(url)
}
