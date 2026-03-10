'use client'

import { useState } from 'react'
import { X, Copy, Check } from 'lucide-react'
import { IMPORT_PROMPT } from '@/lib/prompt'

interface Props {
  onClose: () => void
}

export default function PromptModal({ onClose }: Props) {
  const [copied, setCopied] = useState(false)

  async function copyPrompt() {
    await navigator.clipboard.writeText(IMPORT_PROMPT)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Legg inn via LLM</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <ol className="space-y-2 text-sm text-gray-600">
            <li className="flex gap-2">
              <span className="font-bold text-gray-400 shrink-0">1.</span>
              Kopier prompten under
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-gray-400 shrink-0">2.</span>
              Lim inn i ChatGPT, Claude eller annen LLM — legg til e-postteksten fra kjøpsbekreftelsen etter siste linje i prompten
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-gray-400 shrink-0">3.</span>
              Kopier JSON-svaret og lim inn i neste steg
            </li>
          </ol>

          <div className="relative">
            <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs text-gray-700 whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">
              {IMPORT_PROMPT}
            </pre>
            <button
              onClick={copyPrompt}
              className="absolute top-3 right-3 flex items-center gap-1.5 bg-white border border-gray-200 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 shadow-sm"
            >
              {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
              {copied ? 'Kopiert!' : 'Kopier'}
            </button>
          </div>
        </div>

        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
          >
            Gå til innliming av JSON →
          </button>
        </div>
      </div>
    </div>
  )
}
