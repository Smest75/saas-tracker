export type BillingCycle = 'monthly' | 'yearly' | 'quarterly' | 'one-time'
export type SubscriptionStatus = 'active' | 'cancelled'

export interface Subscription {
  id: string
  name: string
  url: string | null
  price: number
  currency: string
  billing_cycle: BillingCycle
  next_renewal: string // YYYY-MM-DD, null for one-time
  email: string | null
  is_trial: boolean
  trial_end_date: string | null
  comment: string
  status: SubscriptionStatus
  created_at: string
}

export interface ImportedSubscription {
  name: string
  url: string | null
  price: number
  currency: string
  billing_cycle: BillingCycle
  next_renewal: string | null
  email: string | null
  is_trial: boolean
  trial_end_date: string | null
  comment: string
}
