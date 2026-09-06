import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import SectionHeading from '../components/ui/SectionHeading'
import Reveal from '../components/ui/Reveal'
import { supabase, isSupabaseReady, GALLERY_CATEGORIES } from '../lib/supabase'

const ALL = 'all'

function MediaTile({ item, onOpen }) {
  return (
    <button
      onClick={() => onOpen(item)}
      className="group relative mb-4 block w-full overflow-hidden rounded-3xl shadow-soft break-inside-avoid text-left"
    >
      {item.media_type === 'video' ? (
        <video
          src={item.url}
          muted
          playsInline
          preload="metadata"
          className="w-full object-cover"
        />
      ) : (
        <img src={item.url} alt={item.caption || 'Gallery photo'} loading="lazy" className="w-full object-cover transition duration-500 group-hover:scale-105" />
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-maroon-900/70 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
      {item.media_type === 'video' && (
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-cream-50/90 text-2xl shadow-lift">▶️</span>
        </span>
      )}
      {(item.caption || item.category) && (
        <span className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
          {item.caption && <span className="block font-serif text-lg text-cream-50">{item.caption}</span>}
          <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
            {GALLERY_CATEGORIES.find((c) => c.id === item.category)?.name ?? item.category}
          </span>
        </span>
      )}
    </button>
  )
}

function Lightbox({ item, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!item) return null
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[80] grid place-items-center bg-maroon-900/85 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.92, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[88vh] w-full max-w-3xl overflow-hidden rounded-[2rem] bg-white shadow-lift"
      >
        {item.media_type === 'video' ? (
          <video src={item.url} controls autoPlay playsInline className="max-h-[70vh] w-full bg-black" />
        ) : (
          <img src={item.url} alt={item.caption || 'Gallery photo'} className="max-h-[70vh] w-full object-contain bg-cream-100" />
        )}
        <div className="flex items-center justify-between gap-3 p-5">
          <p className="font-serif text-xl text-maroon-800">{item.caption || 'From our studio 💝'}</p>
          <Link
            to="/shop"
            className="btn-gold !px-5 !py-2 text-sm whitespace-nowrap"
            onClick={onClose}
          >
            Shop this vibe →
          </Link>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-maroon-900/70 text-cream-100 text-lg hover:bg-maroon-900"
        >
          ✕
        </button>
      </motion.div>
    </motion.div>
  )
}

export default function Explore() {
  const ready = isSupabaseReady()
  const [params] = useSearchParams()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState(ALL)
  const [open, setOpen] = useState(null)

  // Deep link: /explore?cat=bouquets lands on that category
  useEffect(() => {
    const cat = (params.get('cat') || '').toLowerCase()
    if (cat === ALL || GALLERY_CATEGORIES.some((c) => c.id === cat)) setFilter(cat || ALL)
  }, [params])

  useEffect(() => {
    if (!ready) {
      setLoading(false)
      return
    }
    supabase
      .from('gallery_items')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
      .then(({ data }) => {
        setItems(data || [])
        setLoading(false)
      })
  }, [ready])

  const counts = useMemo(() => {
    const c = { [ALL]: items.length }
    for (const cat of GALLERY_CATEGORIES) c[cat.id] = items.filter((i) => i.category === cat.id).length
    return c
  }, [items])

  const visible = filter === ALL ? items : items.filter((i) => i.category === filter)

  return (
    <section className="py-12 container-px">
      <SectionHeading
        eyebrow="Fresh from our studio"
        title="Explore the Lane"
        sub="Real polaroids, bouquets, hampers, gift boxes & magazines — made by us, loved by them."
      />

      {/* Category filters */}
      <div className="flex flex-wrap justify-center gap-2">
        <button
          onClick={() => setFilter(ALL)}
          className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${filter === ALL ? 'bg-maroon-700 text-cream-100 shadow-soft' : 'bg-white text-maroon-700 hover:bg-blush-50'}`}
        >
          ✨ All ({counts[ALL] ?? 0})
        </button>
        {GALLERY_CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setFilter(c.id)}
            className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${filter === c.id ? 'bg-maroon-700 text-cream-100 shadow-soft' : 'bg-white text-maroon-700 hover:bg-blush-50'}`}
          >
            {c.emoji} {c.name} ({counts[c.id] ?? 0})
          </button>
        ))}
      </div>

      <div className="mt-10">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-3xl bg-blush-100" />
            ))}
          </div>
        ) : !ready || items.length === 0 ? (
          <Reveal className="mx-auto max-w-md rounded-[2rem] bg-white p-10 text-center shadow-soft">
            <p className="text-5xl mb-3">📸</p>
            <h3 className="font-serif text-2xl text-maroon-800">Gallery blooming soon</h3>
            <p className="mt-2 text-sm text-ink/60">
              {!ready
                ? 'Connect Supabase and run supabase/gallery.sql to bring this wall to life.'
                : 'Our studio wall is being dressed — check back soon, or browse the shop meanwhile.'}
            </p>
            <Link to="/shop" className="btn-gold mt-6 inline-block">Browse gifts →</Link>
          </Reveal>
        ) : visible.length === 0 ? (
          <p className="text-center text-sm text-ink/60">Nothing here yet — try another category ✨</p>
        ) : (
          <div className="columns-2 sm:columns-3 gap-4">
            {visible.map((item) => (
              <MediaTile key={item.id} item={item} onOpen={setOpen} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {open && <Lightbox item={open} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </section>
  )
}
