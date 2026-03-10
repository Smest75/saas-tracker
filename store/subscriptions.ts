import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Subscription, ImportedSubscription } from '@/types/subscription'
function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

interface SubscriptionStore {
  subscriptions: Subscription[]
  add: (sub: ImportedSubscription) => void
  update: (id: string, sub: Partial<Subscription>) => void
  remove: (id: string) => void
  cancel: (id: string) => void
}

export const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set) => ({
      subscriptions: [],
      add: (sub) =>
        set((state) => ({
          subscriptions: [
            ...state.subscriptions,
            {
              ...sub,
              id: generateId(),
              status: 'active',
              created_at: new Date().toISOString(),
              url: sub.url ?? null,
              email: sub.email ?? null,
              trial_end_date: sub.trial_end_date ?? null,
              next_renewal: sub.next_renewal ?? '',
            },
          ],
        })),
      update: (id, updated) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((s) =>
            s.id === id ? { ...s, ...updated } : s
          ),
        })),
      remove: (id) =>
        set((state) => ({
          subscriptions: state.subscriptions.filter((s) => s.id !== id),
        })),
      cancel: (id) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((s) =>
            s.id === id ? { ...s, status: 'cancelled' } : s
          ),
        })),
    }),
    { name: 'saas-tracker-subscriptions' }
  )
)
