import { CURRENCIES, convert, getCurrencyCode } from '../../store/currencyStore'

// Formats a price (canonically USD) in the current display currency.
// Falls back to the given currency code when explicitly passed.
export function formatPrice(n, currency = getCurrencyCode()) {
  const c = CURRENCIES[currency] ?? CURRENCIES.USD
  return new Intl.NumberFormat(c.locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(convert(n, currency))
}

export default function Price({ price, compareAt = null, className = '', currency }) {
  return (
    <div className={`flex items-baseline gap-2 ${className}`}>
      <span className="font-bold text-maroon-800">{formatPrice(price, currency)}</span>
      {compareAt && (
        <span className="text-sm text-ink/40 line-through">{formatPrice(compareAt, currency)}</span>
      )}
    </div>
  )
}