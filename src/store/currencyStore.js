import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================================================================
// CURRENCY STORE
// ----------------------------------------------------------------------------
// All product prices are stored canonically in USD. This store holds the
// display currency + conversion rates; formatPrice() converts at render time.
// Rate map can later be swapped for a live FX API (e.g. exchangerate.host).
// ============================================================================

export const CURRENCIES = {
  INR: { label: 'Indian Rupee', symbol: '₹', rate: 83.5, locale: 'en-IN' },
  USD: { label: 'US Dollar', symbol: '$', rate: 1, locale: 'en-US' },
  EUR: { label: 'Euro', symbol: '€', rate: 0.92, locale: 'en-US' },
  GBP: { label: 'Pound', symbol: '£', rate: 0.79, locale: 'en-US' },
}

export const useCurrency = create(
  persist(
    (set) => ({
      code: 'INR',
      setCurrency: (code) => set({ code }),
    }),
    { name: 'ml-currency' }
  )
)

// Current currency code (safe to call anywhere, not a hook).
export const getCurrencyCode = () => useCurrency.getState().code

// Converts a USD price to the given currency code.
export function convert(usd, code = getCurrencyCode()) {
  const c = CURRENCIES[code] ?? CURRENCIES.USD
  return usd * c.rate
}