'use client'

import { useState } from 'react'
import { X, AlertCircle, Check } from 'lucide-react'
import { ImportedSubscription } from '@/types/subscription'
import { useSubscriptionStore } from '@/store/subscriptions'
import { format, parseISO, isValid } from 'date-fns'
import { nb } from 'date-fns/locale'

interface Props {
  onClose: () => void
  onShowPrompt: () => void
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  const d = parseISO(dateStr)
  return isValid(d) ? format(d, 'd. MMM yyyy', { locale: nb }) : dateStr
}

export default function ImportModal({ onClose, onShowPrompt }: Props) {
  const [json, setJson] = useState('')
  const [parsed, setParsed] = useState<ImportedSubscription | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const add = useSubscriptionStore((s) => s.add)

  function parseJson() {
    setError(null)
    setParsed(null)
    try {
      const raw = JSON.parse(json.trim())
      const data = Array.isArray(raw) ? raw[0] : raw
      if (!data.name || data.price === undefined) {
        setError('Mangler obligatoriske felt (name, price). Prøv å kjøre LLM-en på nytt.')
        return
      }
      setParsed(data as ImportedSubscription)
    } catch {
      setError('Ugyldig JSON. Sjekk at du har kopiert hele svaret fra LLM-en.')
    }
  }

  function save() {
    if (!parsed) return
    add(parsed)
    setSaved(true)
    setTimeout(() => {
      onClose()
    }, 1000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Lim inn JSON fra LLM</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {!parsed && (
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-500">
              Lim inn JSON-svaret du fikk fra LLM-en her.{' '}
              <button
                onClick={onShowPrompt}
                className="text-blue-600 hover:underline"
              >
                Trenger du prompten?
              </button>
            </p>
            <textarea
              className="w-full border border-gray-200 rounded-lg p-3 text-sm font-mono h-48 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder='{"name": "GitHub Copilot", "price": 10, ...}'
              value={json}
              onChange={(e) => setJson(e.target.value)}
            />
            {error && (
              <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                {error}
              </div>
            )}
            <button
              onClick={parseJson}
              disabled={!json.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
            >
              Valider og forhåndsvis
            </button>
          </div>
        )}

        {parsed && !saved && (
          <div className="p-6 space-y-4">
            <p className="text-sm font-medium text-gray-700">Ser dette riktig ut?</p>
            <div className="bg-gray-50 rounded-xl border border-gray-200 divide-y divide-gray-100">
              {[
                ['Navn', parsed.name],
                ['Pris', `${parsed.price} ${parsed.currency}`],
                ['Fakturering', parsed.billing_cycle],
                ['Neste fornyelse', formatDate(parsed.next_renewal)],
                ['E-post', parsed.email ?? '—'],
                ['Prøveperiode', parsed.is_trial ? `Ja, slutter ${formatDate(parsed.trial_end_date)}` : 'Nei'],
                ['URL', parsed.url ?? '—'],
                ['Kommentar', parsed.comment || '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between px-4 py-2.5 text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="text-gray-900 font-medium text-right max-w-[60%] break-all">{value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setParsed(null)}
                className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-lg text-sm transition-colors"
              >
                Tilbake
              </button>
              <button
                onClick={save}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
              >
                Lagre abonnement
              </button>
            </div>
          </div>
        )}

        {saved && (
          <div className="p-12 flex flex-col items-center gap-3 text-green-600">
            <Check size={40} strokeWidth={2.5} />
            <p className="font-medium text-lg">Lagret!</p>
          </div>
        )}
      </div>
    </div>
  )
}
