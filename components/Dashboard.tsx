'use client'

import { useState, useEffect } from 'react'
import { Plus, Wand2, BookOpen, ClipboardCopy, Check, ArchiveRestore } from 'lucide-react'
import { useSubscriptionStore } from '@/store/subscriptions'
import { getRates } from '@/lib/currency'
import { computeTotals, daysUntil, getActiveDate } from '@/lib/renewal'
import CostSummary from './CostSummary'
import SubscriptionCard from './SubscriptionCard'
import SubscriptionForm from './SubscriptionForm'
import ImportModal from './ImportModal'
import PromptModal from './PromptModal'
import RestoreModal from './RestoreModal'

type Filter = 'all' | 'active' | 'cancelled'

export default function Dashboard() {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions)
  const [rates, setRates] = useState<Record<string, number>>({ NOK: 1 })
  const [filter, setFilter] = useState<Filter>('active')
  const [showForm, setShowForm] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showRestore, setShowRestore] = useState(false)

  async function copyBackup() {
    await navigator.clipboard.writeText(JSON.stringify(subscriptions, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    getRates().then(setRates)
  }, [])

  const active = subscriptions.filter((s) => s.status === 'active')
  const totals = computeTotals(subscriptions, rates)

  const filtered = subscriptions
    .filter((s) => {
      if (filter === 'active') return s.status === 'active'
      if (filter === 'cancelled') return s.status === 'cancelled'
      return true
    })
    .sort((a, b) => {
      const da = daysUntil(getActiveDate(a)) ?? 9999
      const db = daysUntil(getActiveDate(b)) ?? 9999
      return da - db
    })

  const upcoming = active
    .filter((s) => {
      const d = daysUntil(getActiveDate(s))
      return d !== null && d >= 0 && d <= 30
    })
    .sort((a, b) => (daysUntil(getActiveDate(a)) ?? 0) - (daysUntil(getActiveDate(b)) ?? 0))

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Smests abbo-tracker</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRestore(true)}
              title="Gjenopprett fra backup"
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50"
            >
              <ArchiveRestore size={15} />
              <span className="hidden sm:inline">Gjenopprett</span>
            </button>
            {subscriptions.length > 0 && (
              <button
                onClick={copyBackup}
                title="Kopier backup til utklippstavle"
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50"
              >
                {copied ? <Check size={15} className="text-green-600" /> : <ClipboardCopy size={15} />}
                <span className="hidden sm:inline">{copied ? 'Kopiert!' : 'Backup'}</span>
              </button>
            )}
            <button
              onClick={() => setShowPrompt(true)}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50"
            >
              <Wand2 size={15} />
              <span className="hidden sm:inline">Importer via LLM</span>
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 font-medium"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Legg til</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {subscriptions.length === 0 ? (
          <EmptyState onImport={() => setShowPrompt(true)} onManual={() => setShowForm(true)} />
        ) : (
          <>
            <CostSummary
              monthly={totals.monthly}
              yearly={totals.yearly}
              activeCount={active.length}
            />

            {upcoming.length > 0 && (
              <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-amber-800 mb-2">
                  Fornyelser neste 30 dager ({upcoming.length})
                </p>
                <ul className="space-y-1">
                  {upcoming.map((s) => {
                    const d = daysUntil(getActiveDate(s))
                    return (
                      <li key={s.id} className="text-sm text-amber-700 flex justify-between">
                        <span>{s.name}</span>
                        <span className="font-medium">
                          {d === 0 ? 'I dag' : d === 1 ? 'I morgen' : `Om ${d} dager`}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            {/* Filter tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-4 w-fit">
              {(['active', 'cancelled', 'all'] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    filter === f
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {f === 'active' ? 'Aktive' : f === 'cancelled' ? 'Kansellerte' : 'Alle'}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {filtered.length === 0 ? (
                <p className="text-sm text-gray-400 py-8 text-center">Ingen abonnementer her</p>
              ) : (
                filtered.map((sub) => (
                  <SubscriptionCard key={sub.id} sub={sub} rates={rates} />
                ))
              )}
            </div>
          </>
        )}
      </main>

      {showForm && <SubscriptionForm onClose={() => setShowForm(false)} />}
      {showPrompt && (
        <PromptModal
          onClose={() => {
            setShowPrompt(false)
            setShowImport(true)
          }}
        />
      )}
      {showRestore && <RestoreModal onClose={() => setShowRestore(false)} />}
      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onShowPrompt={() => {
            setShowImport(false)
            setShowPrompt(true)
          }}
        />
      )}
    </div>
  )
}

function EmptyState({ onImport, onManual }: { onImport: () => void; onManual: () => void }) {
  return (
    <div className="text-center py-24 space-y-4">
      <BookOpen size={40} className="text-gray-300 mx-auto" />
      <h2 className="text-xl font-semibold text-gray-700">Ingen abonnementer enda</h2>
      <p className="text-sm text-gray-400 max-w-sm mx-auto">
        Bruk LLM-importen for å legge inn kjøpsbekreftelser raskt, eller legg til manuelt.
      </p>
      <div className="flex gap-3 justify-center pt-2">
        <button
          onClick={onImport}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium"
        >
          <Wand2 size={15} /> Importer via LLM
        </button>
        <button
          onClick={onManual}
          className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg px-4 py-2.5 text-sm font-medium"
        >
          <Plus size={15} /> Legg til manuelt
        </button>
      </div>
    </div>
  )
}
