'use client'

import { formatNOK } from '@/lib/currency'

interface Props {
  monthly: number
  yearly: number
  activeCount: number
  personalMonthly: number
  workMonthly: number
}

export default function CostSummary({ monthly, yearly, activeCount, personalMonthly, workMonthly }: Props) {
  return (
    <div className="mb-8 space-y-2">
      <div className="grid grid-cols-3 gap-4">
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
      <div className="flex gap-4 text-xs text-gray-500 px-1">
        <span>Privat: <span className="font-medium text-gray-700">{formatNOK(personalMonthly)}/mnd</span></span>
        <span>·</span>
        <span>Jobb: <span className="font-medium text-gray-700">{formatNOK(workMonthly)}/mnd</span></span>
      </div>
    </div>
  )
}
