export default function Quantity({ value, onChange, min = 1, size = 'md' }) {
  const btn = size === 'lg' ? 'h-10 w-10 text-lg' : 'h-8 w-8 text-base'
  return (
    <div className="inline-flex items-center rounded-full border border-blush-200 bg-white overflow-hidden">
      <button
        type="button"
        aria-label="Decrease quantity"
        className={`${btn} flex items-center justify-center font-bold text-maroon-700 hover:bg-blush-100 transition`}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        −
      </button>
      <span className={`min-w-8 text-center font-extrabold text-maroon-800 ${size === 'lg' ? 'text-base' : 'text-sm'}`}>
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        className={`${btn} flex items-center justify-center font-bold text-maroon-700 hover:bg-blush-100 transition`}
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  )
}
