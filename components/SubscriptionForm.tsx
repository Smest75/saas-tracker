'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Subscription, BillingCycle, ImportedSubscription } from '@/types/subscription'
import { useSubscriptionStore } from '@/store/subscriptions'

interface Props {
  existing?: Subscription
  onClose: () => void
}

const CURRENCIES = ['NOK', 'USD', 'EUR', 'GBP', 'SEK', 'DKK', 'CHF', 'JPY', 'CAD', 'AUD']
const CYCLES: { value: BillingCycle; label: string }[] = [
  { value: 'monthly', label: 'Månedlig' },
  { value: 'yearly', label: 'Årlig' },
  { value: 'quarterly', label: 'Kvartalsvis' },
  { value: 'one-time', label: 'Engangs' },
]

export default function SubscriptionForm({ existing, onClose }: Props) {
  const { add, update } = useSubscriptionStore()

  const [form, setForm] = useState({
    name: existing?.name ?? '',
    url: existing?.url ?? '',
    price: existing?.price?.toString() ?? '',
    currency: existing?.currency ?? 'USD',
    billing_cycle: existing?.billing_cycle ?? 'monthly' as BillingCycle,
    next_renewal: existing?.next_renewal ?? '',
    email: existing?.email ?? '',
    is_trial: existing?.is_trial ?? false,
    trial_end_date: existing?.trial_end_date ?? '',
    comment: existing?.comment ?? '',
  })

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const data: ImportedSubscription = {
      name: form.name.trim(),
      url: form.url.trim() || null,
      price: parseFloat(form.price),
      currency: form.currency,
      billing_cycle: form.billing_cycle,
      next_renewal: form.next_renewal || null,
      email: form.email.trim() || null,
      is_trial: form.is_trial,
      trial_end_date: form.is_trial && form.trial_end_date ? form.trial_end_date : null,
      comment: form.comment.trim(),
    }
    if (existing) {
      update(existing.id, {
        ...data,
        next_renewal: data.next_renewal ?? '',
      })
    } else {
      add(data)
    }
    onClose()
  }

  const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
  const labelClass = 'block text-xs font-medium text-gray-600 mb-1'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {existing ? 'Rediger abonnement' : 'Nytt abonnement'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className={labelClass}>Navn *</label>
            <input
              required
              className={inputClass}
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="GitHub Copilot"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Pris *</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                placeholder="10"
              />
            </div>
            <div>
              <label className={labelClass}>Valuta</label>
              <select
                className={inputClass}
                value={form.currency}
                onChange={(e) => set('currency', e.target.value)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Fakturering</label>
              <select
                className={inputClass}
                value={form.billing_cycle}
                onChange={(e) => set('billing_cycle', e.target.value as BillingCycle)}
              >
                {CYCLES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Neste fornyelse</label>
              <input
                type="date"
                className={inputClass}
                value={form.next_renewal}
                onChange={(e) => set('next_renewal', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>E-post / brukernavn</label>
            <input
              className={inputClass}
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="meg@example.com"
            />
          </div>

          <div>
            <label className={labelClass}>URL</label>
            <input
              type="url"
              className={inputClass}
              value={form.url}
              onChange={(e) => set('url', e.target.value)}
              placeholder="https://github.com"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_trial"
              checked={form.is_trial}
              onChange={(e) => set('is_trial', e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="is_trial" className="text-sm text-gray-700">Gratis prøveperiode</label>
          </div>

          {form.is_trial && (
            <div>
              <label className={labelClass}>Prøveperiode slutter</label>
              <input
                type="date"
                className={inputClass}
                value={form.trial_end_date}
                onChange={(e) => set('trial_end_date', e.target.value)}
              />
            </div>
          )}

          <div>
            <label className={labelClass}>Kommentar</label>
            <textarea
              className={`${inputClass} h-20 resize-none`}
              value={form.comment}
              onChange={(e) => set('comment', e.target.value)}
              placeholder="Hva bruker du dette til?"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-lg text-sm"
            >
              Avbryt
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm"
            >
              {existing ? 'Lagre endringer' : 'Legg til'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
