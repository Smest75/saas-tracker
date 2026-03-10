const CACHE_KEY = 'saas-tracker-fx-rates'
const CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6 hours

interface RateCache {
  base: string
  rates: Record<string, number>
  fetchedAt: number
}

async function fetchRates(): Promise<Record<string, number>> {
  const res = await fetch('https://api.frankfurter.app/latest?base=NOK')
  if (!res.ok) throw new Error('Failed to fetch rates')
  const data = await res.json()
  // data.rates are relative to NOK, but we need: how many NOK per currency
  // frankfurter returns: 1 NOK = X foreign
  // We want: 1 foreign = Y NOK → invert
  const inverted: Record<string, number> = { NOK: 1 }
  for (const [currency, rate] of Object.entries(data.rates as Record<string, number>)) {
    inverted[currency] = 1 / rate
  }
  return inverted
}

export async function getRates(): Promise<Record<string, number>> {
  if (typeof window === 'undefined') return { NOK: 1 }
  const cached = localStorage.getItem(CACHE_KEY)
  if (cached) {
    const parsed: RateCache = JSON.parse(cached)
    if (Date.now() - parsed.fetchedAt < CACHE_TTL_MS) {
      return parsed.rates
    }
  }
  try {
    const rates = await fetchRates()
    const cache: RateCache = { base: 'NOK', rates, fetchedAt: Date.now() }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
    return rates
  } catch {
    if (cached) return (JSON.parse(cached) as RateCache).rates
    return { NOK: 1 }
  }
}

export function toNOK(amount: number, currency: string, rates: Record<string, number>): number {
  const rate = rates[currency.toUpperCase()] ?? 1
  return amount * rate
}

export function formatNOK(amount: number): string {
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    maximumFractionDigits: 0,
  }).format(amount)
}
