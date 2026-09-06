// Delivery-date rule: scheduled dates must be at least LEAD_DAYS out so we
// have time to craft & ship. String comparison works on YYYY-MM-DD values.

export const MIN_DELIVERY_LEAD_DAYS = 2

export function minDeliveryDateStr() {
  const d = new Date()
  d.setDate(d.getDate() + MIN_DELIVERY_LEAD_DAYS)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

// Returns an error message when the picked date is too soon, else null.
export function deliveryDateError(value) {
  if (!value) return null
  return value < minDeliveryDateStr()
    ? `Please pick a date at least ${MIN_DELIVERY_LEAD_DAYS} days from today — we need time to craft & ship 🎀`
    : null
}
