import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ProductCard from '../components/ui/ProductCard'
import SectionHeading from '../components/ui/SectionHeading'
import { formatPrice } from '../components/ui/Price'
import { occasions, themes, recipients, getCategory } from '../data/products'
import { useProducts } from '../store/productStore'

const categories = [
  { slug: 'all', name: 'All' },
  { slug: 'gift-boxes', name: 'Gift Boxes' },
  { slug: 'hampers', name: 'Hampers' },
  { slug: 'magazines', name: 'Magazines' },
]

const sortOptions = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-asc', label: 'Price: Low → High' },
  { id: 'price-desc', label: 'Price: High → Low' },
]

const priceRanges = [
  { id: 'all', label: 'Any price', min: 0, max: Infinity },
  { id: 'under30', label: 'Under 30', min: 0, max: 30 },
  { id: '30-60', label: '30 – 60', min: 30, max: 60 },
  { id: '60-90', label: '60 – 90', min: 60, max: 90 },
  { id: 'over90', label: 'Over 90', min: 90, max: Infinity },
]

const rangeLabel = (r) =>
  r.id === 'all'
    ? r.label
    : r.id === 'under30'
      ? `Under ${formatPrice(r.max)}`
      : r.id === 'over90'
        ? `Over ${formatPrice(r.min)}`
        : `${formatPrice(r.min)} – ${formatPrice(r.max)}`

function Checkbox({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-[18px] w-[18px] rounded accent-gold-500"
      />
      <span className={`text-sm ${checked ? 'font-bold text-maroon-800' : 'text-ink/70 group-hover:text-maroon-700'}`}>
        {label}
      </span>
    </label>
  )
}

function FilterGroup({ title, children }) {
  return (
    <div className="border-b border-blush-200 pb-5">
      <h3 className="mb-3 font-serif text-lg text-maroon-800">{title}</h3>
      <div className="space-y-2.5">{children}</div>
    </div>
  )
}

export default function Shop() {
  const { category: categoryParam } = useParams()
  const products = useProducts((s) => s.products)
  const [activeCat, setActiveCat] = useState(categoryParam ?? 'all')
  const [query, setQuery] = useState('')
  const [occ, setOcc] = useState([])
  const [recipient, setRecipient] = useState([])
  const [theme, setTheme] = useState([])
  const [price, setPrice] = useState('all')
  const [sort, setSort] = useState('featured')
  const [view, setView] = useState('grid')
  const [mobileFilters, setMobileFilters] = useState(false)

  useEffect(() => setActiveCat(categoryParam ?? 'all'), [categoryParam])

  const activeCategory = activeCat === 'all' ? null : getCategory(activeCat)

  const toggle = (list, setList, val) =>
    setList(list.includes(val) ? list.filter((v) => v !== val) : [...list, val])

  const results = useMemo(() => {
    const range = priceRanges.find((r) => r.id === price) ?? priceRanges[0]
    let list = products.filter((p) => {
      if (activeCat !== 'all' && p.category !== activeCat) return false
      if (occ.length && !p.occasion.some((o) => occ.includes(o))) return false
      if (recipient.length && !p.recipient.some((r) => recipient.includes(r))) return false
      if (theme.length && !theme.includes(p.theme)) return false
      if (p.price < range.min || p.price > range.max) return false
      if (query && !`${p.name} ${p.short}`.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price)
    return list
  }, [activeCat, occ, recipient, theme, price, sort, query])

  const clearAll = () => {
    setOcc([])
    setRecipient([])
    setTheme([])
    setPrice('all')
    setQuery('')
  }

  const activeFilters =
    occ.length + recipient.length + theme.length + (price !== 'all' ? 1 : 0)

  const FilterPanel = (
    <div className="space-y-5">
      <FilterGroup title="Occasion">
        {occasions.map((o) => (
          <Checkbox key={o.slug} checked={occ.includes(o.slug)} onChange={() => toggle(occ, setOcc, o.slug)} label={`${o.emoji} ${o.name}`} />
        ))}
      </FilterGroup>
      <FilterGroup title="Recipient">
        {recipients.map((r) => (
          <Checkbox key={r} checked={recipient.includes(r)} onChange={() => toggle(recipient, setRecipient, r)} label={r} />
        ))}
      </FilterGroup>
      <FilterGroup title="Price">
        <div className="space-y-2.5">
          {priceRanges.map((r) => (
            <label key={r.id} className="flex items-center gap-2.5 cursor-pointer">
              <input type="radio" name="price" checked={price === r.id} onChange={() => setPrice(r.id)} className="h-4 w-4 accent-gold-500" />
              <span className={`text-sm ${price === r.id ? 'font-bold text-maroon-800' : 'text-ink/70'}`}>{rangeLabel(r)}</span>
            </label>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title="Theme">
        {themes.map((t) => (
          <label key={t.slug} className="flex items-center gap-2.5 cursor-pointer">
            <span className="h-4 w-4 rounded-full border border-blush-200" style={{ backgroundColor: t.color }} />
            <Checkbox checked={theme.includes(t.slug)} onChange={() => toggle(theme, setTheme, t.slug)} label={t.name} />
          </label>
        ))}
      </FilterGroup>
      {activeFilters > 0 && (
        <button onClick={clearAll} className="btn-ghost w-full text-sm">✕ Clear all filters</button>
      )}
    </div>
  )

  return (
    <section className="py-12 container-px">
      <SectionHeading
        eyebrow={activeCategory ? activeCategory.tagline : 'The full collection'}
        title={activeCategory ? activeCategory.name : 'Shop the lane'}
        sub={activeCategory ? activeCategory.description : 'Gift boxes, hampers and magazines — filter by occasion, price, recipient or theme.'}
      />

      {/* Category tabs */}
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {categories.map((c) => {
          const icons = { all: '✨', 'gift-boxes': '🎁', hampers: '🧺', magazines: '📖' }
          const isActive = activeCat === c.slug
          return (
            <button
              key={c.slug}
              onClick={() => setActiveCat(c.slug)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-extrabold tracking-wide transition-all duration-300 ${isActive ? 'bg-maroon-700 text-cream-100 shadow-soft scale-105 border border-gold-400' : 'bg-white text-maroon-700 border border-blush-200 hover:border-gold-400 hover:shadow-soft hover:-translate-y-0.5 hover:bg-blush-50'}`}
            >
              <span className={`grid h-6 w-6 place-items-center rounded-full text-xs ${isActive ? 'bg-white/20' : 'bg-blush-100'}`}>{icons[c.slug]}</span>
              {c.name}
            </button>
          )
        })}
      </div>

      {/* Toolbar */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the lane…"
            className="input !w-56"
          />
          <button onClick={() => setMobileFilters(true)} className="btn-outline sm:hidden">
            Filters{activeFilters > 0 ? ` (${activeFilters})` : ''}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-ink/60">{results.length} {results.length === 1 ? 'gift' : 'gifts'}</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="input !w-auto">
            {sortOptions.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
          <div className="flex rounded-full border border-blush-200 bg-white overflow-hidden">
            <button
              onClick={() => setView('grid')}
              aria-label="Grid view"
              className={`px-3 py-2 text-sm font-bold transition ${view === 'grid' ? 'bg-maroon-700 text-cream-100' : 'text-maroon-700'}`}
            >
              ▦
            </button>
            <button
              onClick={() => setView('list')}
              aria-label="List view"
              className={`px-3 py-2 text-sm font-bold transition ${view === 'list' ? 'bg-maroon-700 text-cream-100' : 'text-maroon-700'}`}
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-3xl bg-white p-6 shadow-soft max-h-[calc(100vh-8rem)] overflow-y-auto">
            {FilterPanel}
          </div>
        </aside>

        {/* Mobile filter drawer */}
        <AnimatePresence>
          {mobileFilters && (
            <>
              <motion.div className="fixed inset-0 bg-maroon-900/40 z-[80]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileFilters(false)} />
              <motion.div
                className="fixed left-0 top-0 z-[85] h-full w-80 max-w-[85vw] overflow-y-auto bg-cream-50 p-6 shadow-lift"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              >
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="font-serif text-xl text-maroon-800">Filters</h2>
                  <button onClick={() => setMobileFilters(false)} className="rounded-full p-2 hover:bg-blush-100">✕</button>
                </div>
                {FilterPanel}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Results */}
        <div>
          {results.length === 0 ? (
            <div className="rounded-3xl bg-white p-12 text-center shadow-soft">
              <p className="text-5xl mb-3">🫙</p>
              <h3 className="font-serif text-2xl text-maroon-800">No gifts match that filter</h3>
              <p className="mt-2 text-ink/60">Try widening the price range or clearing a filter or two.</p>
              <button onClick={clearAll} className="btn-gold mt-6">Clear filters</button>
            </div>
          ) : (
            <div className={view === 'grid' ? 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3' : 'flex flex-col gap-4'}>
              <AnimatePresence mode="popLayout">
                {results.map((p) =>
                  view === 'grid' ? (
                    <motion.div key={p.id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}>
                      <ProductCard product={p} />
                    </motion.div>
                  ) : (
                    <motion.div key={p.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
                      <ListViewRow product={p} />
                    </motion.div>
                  )
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

import { Link } from 'react-router-dom'
import Price from '../components/ui/Price'
import { useCart } from '../store/cartStore'
import { useUI } from '../store/uiStore'

function ListViewRow({ product }) {
  const addItem = useCart((s) => s.addItem)
  const pushToast = useUI((s) => s.pushToast)
  return (
    <article className="flex flex-col sm:flex-row gap-5 rounded-3xl bg-white p-4 shadow-soft hover:shadow-lift transition-shadow">
      <Link to={`/product/${product.slug}`} className="shrink-0 sm:w-48">
        <img src={product.images?.[0]?.src} alt={product.name} className="h-44 w-full sm:w-48 rounded-2xl object-cover" />
      </Link>
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-widest font-extrabold text-gold-600">
            {product.category === 'gift-boxes' ? 'Gift Box' : product.category === 'magazines' ? 'Magazine' : 'Hamper'}
          </span>
          {product.badge && <span className="rounded-full bg-blush-100 text-maroon-700 text-xs font-bold px-2.5 py-0.5">{product.badge}</span>}
        </div>
        <Link to={`/product/${product.slug}`}>
          <h3 className="mt-1 font-serif text-xl text-maroon-800">{product.name}</h3>
        </Link>
        <p className="mt-2 text-sm text-ink/60 line-clamp-2 flex-1">{product.short}</p>
        <div className="mt-3 flex items-center justify-between">
          <Price price={product.price} compareAt={product.compareAt} />
          <button
            onClick={() => {
              addItem({ productId: product.id, slug: product.slug, name: product.name, image: product.images?.[0]?.src, price: product.price })
              pushToast(`${product.name} added to cart 🎁`)
            }}
            className="btn-gold !px-5 !py-2.5 text-sm"
          >
            Add to cart
          </button>
        </div>
      </div>
    </article>
  )
}
