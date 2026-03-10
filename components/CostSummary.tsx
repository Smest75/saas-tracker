'use client'

import { formatNOK } from '@/lib/currency'

interface Props {
  monthly: number
  yearly: number
  activeCount: number
}

export default function CostSummary({ monthly, yearly, activeCount }: Props) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Per måned</p>
        <p className="text-2xl font-bold text-gray-900">{formatNOK(monthly)}</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Per år</p>
        <p className="text-2xl font-bold text-gray-900">{formatNOK(yearly)}</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Aktive</p>
        <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
      </div>
    </div>
  )
}
