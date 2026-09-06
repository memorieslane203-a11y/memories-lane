import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SectionHeading from '../components/ui/SectionHeading'
import Reveal from '../components/ui/Reveal'
import { useCart } from '../store/cartStore'
import { useUI } from '../store/uiStore'

const INR = 83.5
const toCartPrice = (inr) => inr / INR

// ---------------------------------------------------------------------------
// Catalogue (prices in INR)
// ---------------------------------------------------------------------------
const FRAMES = [
  { id: 'square', name: 'Square Frame', price: 149, emoji: '🖼️', desc: 'Cute & compact — desk favourite' },
  { id: 'mini', name: 'Mini Frame', price: 249, emoji: '🪞', desc: 'Small size, big feelings' },
  { id: 'a4', name: 'A4 Frame', price: 349, emoji: '🎨', desc: 'Classic wall-ready size' },
  { id: 'a3', name: 'A3 Frame', price: 599, emoji: '🌟', desc: 'Statement piece for the wall' },
]

const POLAROIDS = [
  { id: 'mini', name: 'Mini Polaroids', price: 5, emoji: '📸', per: 'each', desc: 'Tiny prints, endless charm' },
  { id: 'square', name: 'Square Polaroids', price: 7, emoji: '🔳', per: 'each', desc: 'The classic insta look' },
  { id: 'strip', name: 'Photo Strips', price: 50, emoji: '🎞️', per: 'each', desc: 'Retro booth-style strip' },
]

const BOUQUET_PRICES = {
  square: [
    { count: 10, price: 350 },
    { count: 15, price: 450 },
    { count: 20, price: 550 },
  ],
  mini: [
    { count: 10, price: 300 },
    { count: 15, price: 400 },
    { count: 20, price: 500 },
  ],
}

function Stepper({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(-1)}
        className="h-8 w-8 grid place-items-center rounded-full bg-white border border-blush-200 text-maroon-700 font-bold"
        aria-label="Decrease"
      >
        −
      </button>
      <span className="w-8 text-center font-extrabold text-sm text-maroon-800">{value}</span>
      <button
        onClick={() => onChange(1)}
        className="h-8 w-8 grid place-items-center rounded-full bg-maroon-700 text-cream-100 font-bold"
        aria-label="Increase"
      >
        +
      </button>
    </div>
  )
}

export default function FramesBouquets() {
  const addToCart = useCart((s) => s.addItem)
  const pushToast = useUI((s) => s.pushToast)
  const navigate = useNavigate()

  // Frames: size -> qty
  const [frames, setFrames] = useState({})
  // Polaroids: type -> qty
  const [polaroids, setPolaroids] = useState({})
  // Bouquet: style + count
  const [bouquetStyle, setBouquetStyle] = useState('square')
  const [bouquetCount, setBouquetCount] = useState(10)

  const setQty = (setter) => (id, delta) => {
    setter((prev) => {
      const next = Math.max(0, (prev[id] || 0) + delta)
      const out = { ...prev }
      if (next === 0) delete out[id]
      else out[id] = next
      return out
    })
  }
  const setFrameQty = setQty(setFrames)
  const setPolaroidQty = setQty(setPolaroids)

  const bouquetPrice = useMemo(() => {
    const tier = BOUQUET_PRICES[bouquetStyle].find((t) => t.count === bouquetCount)
    return tier ? tier.price : 0
  }, [bouquetStyle, bouquetCount])

  const framesTotal = Object.entries(frames).reduce((s, [id, qty]) => {
    const f = FRAMES.find((x) => x.id === id)
    return s + (f ? f.price * qty : 0)
  }, 0)
  const polaroidsTotal = Object.entries(polaroids).reduce((s, [id, qty]) => {
    const p = POLAROIDS.find((x) => x.id === id)
    return s + (p ? p.price * qty : 0)
  }, 0)

  const addFrames = () => {
    const entries = Object.entries(frames)
    if (entries.length === 0) {
      pushToast('Pick at least one frame size', 'error')
      return
    }
    entries.forEach(([id, qty]) => {
      const f = FRAMES.find((x) => x.id === id)
      addToCart({
        productId: `frame-${id}`,
        slug: `frame-${id}`,
        name: `${f.name} 🖼️`,
        image: null,
        price: toCartPrice(f.price),
        variant: `${f.name}`,
      }, qty)
    })
    pushToast('Frames added to cart 🖼️')
    navigate('/cart')
  }

  const addPolaroids = () => {
    const entries = Object.entries(polaroids)
    if (entries.length === 0) {
      pushToast('Pick at least one polaroid type', 'error')
      return
    }
    entries.forEach(([id, qty]) => {
      const p = POLAROIDS.find((x) => x.id === id)
      addToCart({
        productId: `polaroid-${id}`,
        slug: `polaroid-${id}`,
        name: `${p.name} ${p.emoji}`,
        image: null,
        price: toCartPrice(p.price),
        variant: `${p.name} (₹${p.price} each)`,
      }, qty)
    })
    pushToast('Polaroids added to cart 📸')
    navigate('/cart')
  }

  const addBouquet = () => {
    const label = bouquetStyle === 'square' ? 'Square' : 'Mini'
    addToCart({
      productId: `polaroid-bouquet-${bouquetStyle}-${bouquetCount}`,
      slug: `polaroid-bouquet-${bouquetStyle}-${bouquetCount}`,
      name: `Polaroid Bouquet — ${label} ×${bouquetCount} 💐`,
      image: null,
      price: toCartPrice(bouquetPrice),
      variant: `${label} polaroids ×${bouquetCount}`,
    })
    pushToast('Polaroid bouquet added to cart 💐')
    navigate('/cart')
  }

  return (
    <section className="py-12 container-px">
      <SectionHeading
        eyebrow="Printed with love"
        title="Frames / Bouquet"
        sub="Frames, polaroids & bouquets — turn your favourite photos into gifts worth keeping."
      />

      <div className="mx-auto max-w-3xl">
        <div className="space-y-8">
          {/* ------------------------------------------------ FRAMES */}
          <Reveal>
            <div className="rounded-[2rem] bg-white p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-2xl text-maroon-800">🖼️ Photo Frames</h3>
                  <p className="text-sm text-ink/60 mt-1">Pick a size — beautifully framed & gift-ready.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link to="/explore?cat=frames" className="rounded-full border border-blush-300 bg-white px-4 py-1.5 text-xs font-bold text-maroon-700 hover:border-gold-400 hover:bg-blush-50 transition whitespace-nowrap">✨ Explore</Link>
                  {framesTotal > 0 && (
                    <span className="rounded-full bg-blush-100 px-4 py-1.5 text-sm font-extrabold text-maroon-700">
                      ₹{framesTotal}
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FRAMES.map((f) => {
                  const qty = frames[f.id] || 0
                  return (
                    <div key={f.id} className={`rounded-2xl border-2 p-4 transition ${qty > 0 ? 'border-gold-500 bg-blush-50' : 'border-blush-200 bg-cream-50 hover:border-gold-400'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-3xl">{f.emoji}</p>
                          <p className="mt-1 font-extrabold text-maroon-800">{f.name}</p>
                          <p className="text-xs text-ink/50">{f.desc}</p>
                          <p className="mt-1 font-serif text-lg text-maroon-800">₹{f.price}/-</p>
                        </div>
                        <Stepper value={qty} onChange={(d) => setFrameQty(f.id, d)} />
                      </div>
                    </div>
                  )
                })}
              </div>
              <button onClick={addFrames} className="btn-gold w-full mt-5">Add frames to cart 🖼️</button>
            </div>
          </Reveal>

          {/* ------------------------------------------------ POLAROIDS */}
          <Reveal delay={0.05}>
            <div className="rounded-[2rem] bg-white p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-2xl text-maroon-800">📸 Polaroids</h3>
                  <p className="text-sm text-ink/60 mt-1">Priced per print — order as many as you like.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link to="/explore?cat=polaroids" className="rounded-full border border-blush-300 bg-white px-4 py-1.5 text-xs font-bold text-maroon-700 hover:border-gold-400 hover:bg-blush-50 transition whitespace-nowrap">✨ Explore</Link>
                  {polaroidsTotal > 0 && (
                    <span className="rounded-full bg-blush-100 px-4 py-1.5 text-sm font-extrabold text-maroon-700">
                      ₹{polaroidsTotal}
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {POLAROIDS.map((p) => {
                  const qty = polaroids[p.id] || 0
                  return (
                    <div key={p.id} className="flex items-center justify-between rounded-2xl border border-blush-200 bg-cream-50 px-4 py-3">
                      <div>
                        <p className="text-sm font-extrabold text-maroon-800">{p.emoji} {p.name} <span className="text-xs text-ink/50">(per print)</span></p>
                        <p className="text-xs text-ink/50">{p.desc}</p>
                        <p className="text-sm font-bold text-maroon-800 mt-0.5">₹{p.price}/- each{qty > 0 && <span className="text-ink/50"> · ₹{p.price * qty}</span>}</p>
                      </div>
                      <Stepper value={qty} onChange={(d) => setPolaroidQty(p.id, d)} />
                    </div>
                  )
                })}
              </div>
              <button onClick={addPolaroids} className="btn-gold w-full mt-5">Add polaroids to cart 📸</button>
            </div>
          </Reveal>

          {/* ------------------------------------------------ BOUQUET */}
          <Reveal delay={0.1}>
            <div className="rounded-[2rem] bg-white p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-2xl text-maroon-800">💐 Polaroid Bouquet</h3>
                  <p className="text-sm text-ink/60 mt-1">Your memories, arranged like flowers.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link to="/explore?cat=bouquets" className="rounded-full border border-blush-300 bg-white px-4 py-1.5 text-xs font-bold text-maroon-700 hover:border-gold-400 hover:bg-blush-50 transition whitespace-nowrap">✨ Explore</Link>
                  <span className="rounded-full bg-gold-100 px-4 py-1.5 text-sm font-extrabold text-maroon-800">
                    ₹{bouquetPrice}
                  </span>
                </div>
              </div>

              <p className="mt-5 text-sm font-extrabold text-maroon-800">1 · Choose style</p>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {[
                  { id: 'square', name: 'Square Bouquet', emoji: '🔳' },
                  { id: 'mini', name: 'Mini Bouquet', emoji: '📸' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setBouquetStyle(s.id)}
                    className={`rounded-2xl border-2 p-4 text-center transition ${bouquetStyle === s.id ? 'border-gold-500 bg-blush-50 shadow-gold' : 'border-blush-200 bg-cream-50 hover:border-gold-400'}`}
                  >
                    <span className="block text-3xl">{s.emoji}</span>
                    <p className="mt-1 text-sm font-extrabold text-maroon-800">{s.name}</p>
                  </button>
                ))}
              </div>

              <p className="mt-5 text-sm font-extrabold text-maroon-800">2 · Choose count</p>
              <div className="mt-2 grid grid-cols-3 gap-3">
                {BOUQUET_PRICES[bouquetStyle].map((t) => (
                  <button
                    key={t.count}
                    onClick={() => setBouquetCount(t.count)}
                    className={`rounded-2xl border-2 p-4 text-center transition ${bouquetCount === t.count ? 'border-gold-500 bg-blush-50 shadow-gold' : 'border-blush-200 bg-cream-50 hover:border-gold-400'}`}
                  >
                    <p className="font-extrabold text-maroon-800">{t.count} polaroids</p>
                    <p className="mt-1 font-serif text-lg text-maroon-800">₹{t.price}/-</p>
                  </button>
                ))}
              </div>

              <button onClick={addBouquet} className="btn-gold w-full mt-5">Add bouquet to cart 💐</button>
            </div>
          </Reveal>
          <Reveal className="text-center">
            <p className="text-xs text-ink/50">Share your photos with us on WhatsApp after ordering — we print & craft. 📩</p>
            <Link to="/shop" className="btn-ghost mt-3 text-sm">…or browse ready-made gifts</Link>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
