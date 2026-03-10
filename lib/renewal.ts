import { differenceInDays, parseISO, isValid } from 'date-fns'
import { Subscription, BillingCycle } from '@/types/subscription'
import { toNOK } from './currency'

export function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  const date = parseISO(dateStr)
  if (!isValid(date)) return null
  return differenceInDays(date, new Date())
}

export function urgencyColor(days: number | null): string {
  if (days === null) return 'text-gray-400'
  if (days < 0) return 'text-gray-400'
  if (days <= 7) return 'text-red-500'
  if (days <= 30) return 'text-amber-500'
  return 'text-green-600'
}

export function urgencyBg(days: number | null): string {
  if (days === null) return ''
  if (days < 0) return ''
  if (days <= 7) return 'bg-red-50 border-red-200'
  if (days <= 30) return 'bg-amber-50 border-amber-200'
  return ''
}

// Monthly equivalent cost in original currency
export function monthlyEquivalent(price: number, cycle: BillingCycle): number {
  switch (cycle) {
    case 'monthly': return price
    case 'yearly': return price / 12
    case 'quarterly': return price / 3
    case 'one-time': return 0
  }
}

export function yearlyEquivalent(price: number, cycle: BillingCycle): number {
  switch (cycle) {
    case 'monthly': return price * 12
    case 'yearly': return price
    case 'quarterly': return price * 4
    case 'one-time': return 0
  }
}

export function computeTotals(
  subscriptions: Subscription[],
  rates: Record<string, number>
): { monthly: number; yearly: number } {
  const active = subscriptions.filter((s) => s.status === 'active')
  let monthly = 0
  let yearly = 0
  for (const s of active) {
    const inNOK = toNOK(s.price, s.currency, rates)
    monthly += monthlyEquivalent(inNOK, s.billing_cycle)
    yearly += yearlyEquivalent(inNOK, s.billing_cycle)
  }
  return { monthly, yearly }
}

export function getActiveDate(sub: Subscription): string | null {
  if (sub.is_trial && sub.trial_end_date) return sub.trial_end_date
  return sub.next_renewal || null
}
