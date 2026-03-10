'use client'

import { useState } from 'react'
import { ExternalLink, Pencil, Trash2, CalendarPlus, XCircle, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
import { Subscription } from '@/types/subscription'
import { daysUntil, urgencyColor, urgencyBg, monthlyEquivalent, yearlyEquivalent, getActiveDate } from '@/lib/renewal'
import { toNOK, formatNOK } from '@/lib/currency'
import { downloadIcs } from '@/lib/ics'
import { useSubscriptionStore } from '@/store/subscriptions'
import { format, parseISO, isValid } from 'date-fns'
import { nb } from 'date-fns/locale'
import SubscriptionForm from './SubscriptionForm'

interface Props {
  sub: Subscription
  rates: Record<string, number>
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  const d = parseISO(dateStr)
  return isValid(d) ? format(d, 'd. MMM yyyy', { locale: nb }) : dateStr
}

const CYCLE_LABEL: Record<string, string> = {
  monthly: 'månedlig',
  yearly: 'årlig',
  quarterly: 'kvartalsvis',
  'one-time': 'engangs',
}

export default function SubscriptionCard({ sub, rates }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const { remove, cancel, update } = useSubscriptionStore()

  const activeDate = getActiveDate(sub)
  const days = daysUntil(activeDate)
  const isCancelled = sub.status === 'cancelled'

  const nokInBase = toNOK(sub.price, sub.currency, rates)
  const nokPerMonth = formatNOK(monthlyEquivalent(nokInBase, sub.billing_cycle))
  const nokPerYear = formatNOK(yearlyEquivalent(nokInBase, sub.billing_cycle))

  function daysLabel(): string {
    if (days === null) return ''
    if (days < 0) return 'Forfalt'
    if (days === 0) return 'I dag'
    if (days === 1) return 'I morgen'
    return `Om ${days} dager`
  }

  return (
    <>
      <div
        className={`bg-white rounded-xl border ${isCancelled ? 'border-gray-100 opacity-60' : urgencyBg(days) || 'border-gray-200'} transition-all`}
      >
        <div
          className="flex items-center gap-4 p-4 cursor-pointer select-none"
          onClick={() => setExpanded((v) => !v)}
        >
          {/* Name + badges */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 truncate">{sub.name}</span>
              {sub.is_trial && (
                <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium">Prøve</span>
              )}
              {isCancelled && (
                <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">Kansellert</span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{CYCLE_LABEL[sub.billing_cycle]}</p>
          </div>

          {/* Renewal date */}
          <div className="text-right shrink-0">
            {activeDate && (
              <>
                <p className="text-sm text-gray-600">{formatDate(activeDate)}</p>
                {!isCancelled && days !== null && (
                  <p className={`text-xs font-medium ${urgencyColor(days)}`}>{daysLabel()}</p>
                )}
              </>
            )}
          </div>

          {/* Cost */}
          <div className="text-right shrink-0 min-w-[80px]">
            <p className="text-sm font-semibold text-gray-900">
              {sub.price} {sub.currency}
            </p>
            {sub.billing_cycle !== 'one-time' && (
              <p className="text-xs text-gray-400">
                {sub.currency !== 'NOK' ? `${nokPerYear}/år` : `${nokPerYear}/år`}
              </p>
            )}
          </div>

          <span className="text-gray-400 shrink-0">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="border-t border-gray-100 px-4 py-3 space-y-3">
            {/* Info rows */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
              {sub.email && (
                <>
                  <span className="text-gray-400">E-post</span>
                  <span className="text-gray-700">{sub.email}</span>
                </>
              )}
              {sub.url && (
                <>
                  <span className="text-gray-400">URL</span>
                  <a
                    href={sub.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {sub.url.replace(/^https?:\/\//, '')}
                    <ExternalLink size={11} />
                  </a>
                </>
              )}
              {sub.is_trial && sub.trial_end_date && (
                <>
                  <span className="text-gray-400">Prøveperiode slutter</span>
                  <span className="text-gray-700">{formatDate(sub.trial_end_date)}</span>
                </>
              )}
              {sub.comment && (
                <>
                  <span className="text-gray-400">Kommentar</span>
                  <span className="text-gray-700">{sub.comment}</span>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <button
                onClick={(e) => { e.stopPropagation(); setEditing(true) }}
                className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-md px-2.5 py-1.5 hover:bg-gray-50"
              >
                <Pencil size={12} /> Rediger
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); downloadIcs(sub) }}
                className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-md px-2.5 py-1.5 hover:bg-gray-50"
              >
                <CalendarPlus size={12} /> Legg til kalender
              </button>
              {!isCancelled ? (
                <button
                  onClick={(e) => { e.stopPropagation(); cancel(sub.id) }}
                  className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-800 border border-amber-200 rounded-md px-2.5 py-1.5 hover:bg-amber-50"
                >
                  <XCircle size={12} /> Kanseller
                </button>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); update(sub.id, { status: 'active' }) }}
                  className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-800 border border-green-200 rounded-md px-2.5 py-1.5 hover:bg-green-50"
                >
                  <RotateCcw size={12} /> Gjenaktiver
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm(`Slette ${sub.name}?`)) remove(sub.id)
                }}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 border border-red-200 rounded-md px-2.5 py-1.5 hover:bg-red-50 ml-auto"
              >
                <Trash2 size={12} /> Slett
              </button>
            </div>
          </div>
        )}
      </div>

      {editing && <SubscriptionForm existing={sub} onClose={() => setEditing(false)} />}
    </>
  )
}
