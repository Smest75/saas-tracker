'use client'

import { useState } from 'react'
import { X, AlertCircle, Check } from 'lucide-react'
import { Subscription } from '@/types/subscription'
import { useSubscriptionStore } from '@/store/subscriptions'

interface Props {
  onClose: () => void
}

export default function RestoreModal({ onClose }: Props) {
  const [json, setJson] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<Subscription[] | null>(null)
  const [done, setDone] = useState(false)
  const restore = useSubscriptionStore((s) => s.restore)

  function validate() {
    setError(null)
    setPreview(null)
    try {
      const parsed = JSON.parse(json.trim())
      const arr: Subscription[] = Array.isArray(parsed) ? parsed : [parsed]
      if (!arr.length || !arr[0].id || !arr[0].name) {
        setError('Gjenkjenner ikke formatet. Lim inn JSON-en du kopierte med Backup-knappen.')
        return
      }
      setPreview(arr)
    } catch {
      setError('Ugyldig JSON. Sjekk at du har kopiert hele backup-teksten.')
    }
  }

  function confirm() {
    if (!preview) return
    restore(preview)
    setDone(true)
    setTimeout(onClose, 1000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Gjenopprett fra backup</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {!preview && !done && (
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-500">
              Lim inn JSON-teksten du kopierte med Backup-knappen. Eksisterende data erstattes helt.
            </p>
            <textarea
              className="w-full border border-gray-200 rounded-lg p-3 text-sm font-mono h-48 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder='[{"id": "...", "name": "GitHub Copilot", ...}]'
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
              onClick={validate}
              disabled={!json.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
            >
              Valider
            </button>
          </div>
        )}

        {preview && !done && (
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-700">
              Fant <span className="font-semibold">{preview.length}</span> abonnementer. Dette erstatter all eksisterende data.
            </p>
            <ul className="bg-gray-50 border border-gray-200 rounded-xl divide-y divide-gray-100 max-h-48 overflow-y-auto">
              {preview.map((s) => (
                <li key={s.id} className="flex justify-between px-4 py-2.5 text-sm">
                  <span className="text-gray-800 font-medium">{s.name}</span>
                  <span className="text-gray-400">{s.price} {s.currency}</span>
                </li>
              ))}
            </ul>
            <div className="flex gap-3">
              <button
                onClick={() => setPreview(null)}
                className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-lg text-sm"
              >
                Tilbake
              </button>
              <button
                onClick={confirm}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm"
              >
                Gjenopprett
              </button>
            </div>
          </div>
        )}

        {done && (
          <div className="p-12 flex flex-col items-center gap-3 text-green-600">
            <Check size={40} strokeWidth={2.5} />
            <p className="font-medium text-lg">Gjenopprettet!</p>
          </div>
        )}
      </div>
    </div>
  )
}
