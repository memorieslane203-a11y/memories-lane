import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import HamperScene from '../components/three/HamperScene'
import ThreeD from '../components/three/ThreeD'
import SectionHeading from '../components/ui/SectionHeading'
import Reveal from '../components/ui/Reveal'
import { useCart } from '../store/cartStore'
import { useUI } from '../store/uiStore'

const GOODIES = [
  { id: 'scrunchies', name: 'Scrunchies', emoji: '🎀' },
  { id: 'chocolates', name: 'Chocolates', emoji: '🍫' },
  { id: 'cards', name: '3 Fold Cards', emoji: '💌' },
  { id: 'keychains', name: 'Keychains', emoji: '🔑' },
  { id: 'fairy', name: 'Fairy Lights', emoji: '✨' },
  { id: 'frames', name: 'Mini Frames', emoji: '🖼️' },
  { id: 'letters', name: 'Personalized Letters', emoji: '📝' },
  { id: 'jewellery', name: 'Jewellery', emoji: '💍' },
  { id: 'mugs', name: 'Coffee Mugs', emoji: '☕' },
  { id: 'wallets', name: 'Wallets', emoji: '👛' },
  { id: 'clips', name: 'Claw Clips', emoji: '🦋' },
]

const PACKS = [
  { id: 'pack-5', label: '5 items', items: 5, price: 799 },
  { id: 'pack-8', label: '8 items', items: 8, price: 1099 },
  { id: 'pack-11', label: '11 items', items: 11, price: 1299 },
  { id: 'choco-only', label: 'Only chocolate hamper', items: null, price: 599, desc: 'with add on gifts' },
]

const ADDONS = [
  { id: 'add-card', name: '3 folded card', price: 50, emoji: '💌' },
  { id: 'polaroid-mini', name: 'Polaroids (mini)', price: 5, emoji: '📸', per: 'each' },
  { id: 'polaroid-square', name: 'Polaroids (square)', price: 10, emoji: '🖼️', per: 'each' },
  { id: 'photo-strip', name: 'Photo strip', price: 50, emoji: '🎞️' },
  { id: 'frame-square', name: 'Frames (square)', price: 149, emoji: '🖼️' },
]

function FallbackScene() {
  return (
    <div className="grid h-full w-full place-items-center">
      <motion.div className="relative text-center" animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3.5 }}>
        <span className="text-8xl block">🧺</span>
        <p className="mt-3 font-serif text-maroon-800 text-xl">Your basket lives here</p>
      </motion.div>
    </div>
  )
}

export default function BuildHamper() {
  const addToCart = useCart((s) => s.addItem)
  const pushToast = useUI((s) => s.pushToast)
  const navigate = useNavigate()

  const [packId, setPackId] = useState('pack-5')
  const [picked, setPicked] = useState({})
  const [addons, setAddons] = useState({})

  const pack = PACKS.find((p) => p.id === packId)
  const pickedCount = useMemo(() => Object.values(picked).reduce((s, n) => s + n, 0), [picked])
  const addonTotal = useMemo(() => Object.entries(addons).reduce((s, [id, qty]) => {
    const a = ADDONS.find((x) => x.id === id)
    return s + (a ? a.price * qty : 0)
  }, 0), [addons])
  const total = pack.price + addonTotal
  const limit = pack.items
  const overLimit = limit != null && pickedCount > limit
  const remaining = limit != null ? limit - pickedCount : null

  const toggleGoodie = (id) => {
    setPicked((prev) => {
      const next = { ...prev }
      next[id] = (next[id] || 0) + 1
      if (limit != null && Object.values(next).reduce((s, n) => s + n, 0) > limit) {
        pushToast(`This pack allows ${limit} items — remove one to add another`, 'info')
        return prev
      }
      const g = GOODIES.find((x) => x.id === id)
      pushToast(`${g.emoji} ${g.name} added`)
      return next
    })
  }

  const decGoodie = (id) => {
    setPicked((prev) => {
      const next = { ...prev }
      if (!next[id]) return prev
      next[id] -= 1
      if (next[id] <= 0) delete next[id]
      return next
    })
  }

  const setAddonQty = (id, delta) => {
    setAddons((prev) => {
      const cur = prev[id] || 0
      const next = Math.max(0, cur + delta)
      const out = { ...prev }
      if (next === 0) delete out[id]
      else out[id] = next
      return out
    })
  }

  const checkoutHamper = () => {
    if (pickedCount === 0) {
      pushToast('Pick at least one goody for your hamper', 'error')
      return
    }
    if (overLimit) {
      pushToast(`This pack allows ${limit} items — please adjust`, 'error')
      return
    }
    if (packId === 'choco-only' && !picked['chocolates']) {
      pushToast('Chocolate hamper needs at least one Chocolate', 'info')
    }
    const goodiesList = Object.entries(picked).map(([id, qty]) => {
      const g = GOODIES.find((x) => x.id === id)
      return `${g.emoji} ${g.name} ×${qty}`
    }).join(', ')
    const addonList = Object.entries(addons).map(([id, qty]) => {
      const a = ADDONS.find((x) => x.id === id)
      return `${a.emoji} ${a.name} ×${qty}`
    }).join(', ')
    const variant = [goodiesList, addonList].filter(Boolean).join(' | Add-ons: ')
    // price is in INR — store as INR/83.5 so formatPrice shows ₹ correctly, but for hamper we store raw INR and bypass conversion by using price as INR directly in cart display
    // To keep cart totals consistent, we store price as INR value and cart will show via formatPrice — we store INR/83.5 equivalent
    const priceForCart = total / 83.5
    addToCart({
      productId: `hamper-custom-${Date.now()}`,
      slug: 'custom-hamper',
      name: `Custom Hamper — ${pack.label}`,
      image: null,
      price: priceForCart,
      variant,
    })
    pushToast('Hamper added to cart 🎁')
    navigate('/cart')
  }

  return (
    <section className="py-12 container-px">
      <SectionHeading
        eyebrow="You design it, we wrap it"
        title="Build Your Own Hamper"
        sub="Pick a pack, choose your goodies, add cute extras — we wrap it beautifully."
      />

      <div className="grid gap-10 lg:grid-cols-2">
        <Reveal>
          <div className="relative rounded-[2rem] overflow-hidden shadow-soft" style={{ height: 'min(58vh, 520px)', minHeight: 380 }}>
            <ThreeD fallback={<FallbackScene />} children={<HamperScene className="h-full w-full" />} />
          </div>

          <div className="mt-6 rounded-2xl bg-white p-5 shadow-soft">
            <h4 className="font-serif text-lg text-maroon-800">Your hamper so far</h4>
            {pickedCount === 0 && Object.keys(addons).length === 0 ? (
              <p className="mt-2 text-sm text-ink/50">Nothing yet — pick goodies below!</p>
            ) : (
              <ul className="mt-3 space-y-2">
                <AnimatePresence initial={false}>
                  {Object.entries(picked).map(([id, qty]) => {
                    const g = GOODIES.find((x) => x.id === id)
                    return (
                      <motion.li key={id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex items-center justify-between rounded-xl bg-blush-50 px-3 py-2 text-sm">
                        <span className="flex items-center gap-2 font-bold text-maroon-800"><span className="text-lg">{g.emoji}</span> {g.name}</span>
                        <span className="flex items-center gap-2">
                          <button onClick={() => decGoodie(id)} className="h-7 w-7 grid place-items-center rounded-full bg-white border border-blush-200 text-maroon-700">−</button>
                          <span className="font-extrabold w-5 text-center">{qty}</span>
                          <button onClick={() => toggleGoodie(id)} className="h-7 w-7 grid place-items-center rounded-full bg-maroon-700 text-cream-100">+</button>
                        </span>
                      </motion.li>
                    )
                  })}
                </AnimatePresence>
                {Object.entries(addons).map(([id, qty]) => {
                  const a = ADDONS.find((x) => x.id === id)
                  return (
                    <li key={id} className="flex items-center justify-between rounded-xl bg-gold-50 border border-gold-200 px-3 py-2 text-sm">
                      <span className="font-bold text-maroon-800">{a.emoji} {a.name} ×{qty}</span>
                      <span className="font-bold text-maroon-800">₹{a.price * qty}</span>
                    </li>
                  )
                })}
              </ul>
            )}
            <div className="mt-4 flex items-center justify-between border-t border-blush-200 pt-4">
              <div className="text-sm text-ink/60">
                <p>Pack: <span className="font-bold text-maroon-800">{pack.label} — ₹{pack.price}</span></p>
                {addonTotal > 0 && <p>Add-ons: <span className="font-bold text-maroon-800">₹{addonTotal}</span></p>}
                {limit != null && <p className={overLimit ? 'text-red-600 font-bold' : remaining === 0 ? 'text-emerald-700 font-bold' : ''}>{pickedCount}/{limit} items {overLimit ? '— over limit!' : remaining === 0 ? '— perfect!' : `— ${remaining} left`}</p>}
              </div>
              <div className="text-right">
                <p className="font-serif text-2xl text-maroon-800">₹{total}</p>
                <p className="text-xs text-ink/50">incl. wrapping</p>
              </div>
            </div>
            <button onClick={checkoutHamper} className="btn-gold w-full mt-4">Add hamper to cart → Checkout</button>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="space-y-6">
          <div className="rounded-[2rem] bg-white p-6 shadow-soft">
            <h3 className="font-serif text-xl text-maroon-800">Hamper packs</h3>
            <p className="text-sm text-ink/60 mt-1">Choose your size — price is fixed for the pack.</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {PACKS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPackId(p.id)}
                  className={`rounded-2xl border-2 p-4 text-left transition ${packId === p.id ? 'border-gold-500 bg-blush-50 shadow-gold' : 'border-blush-200 hover:border-gold-400 bg-cream-50'}`}
                >
                  <p className="font-extrabold text-maroon-800 text-sm">{p.label}</p>
                  {p.desc && <p className="text-xs text-ink/50">{p.desc}</p>}
                  <p className="mt-1 font-serif text-lg text-maroon-800">₹{p.price}/-</p>
                  {p.items && <p className="text-xs text-ink/50">{p.items} items</p>}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl text-maroon-800">Available goodies</h3>
              <span className="text-xs font-bold text-ink/50">tap to add</span>
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {GOODIES.map((g) => {
                const qty = picked[g.id] || 0
                return (
                  <div key={g.id} className={`relative rounded-2xl border p-3 text-center transition ${qty > 0 ? 'border-gold-500 bg-blush-50' : 'border-blush-200 bg-cream-50 hover:border-gold-400'}`}>
                    <span className="block text-3xl">{g.emoji}</span>
                    <p className="mt-1 text-xs font-extrabold text-maroon-800">{g.name}</p>
                    {qty > 0 && <span className="absolute -top-2 -right-2 grid h-6 w-6 place-items-center rounded-full bg-gold-500 text-xs font-extrabold text-maroon-800">{qty}</span>}
                    <button onClick={() => toggleGoodie(g.id)} className="mt-2 w-full rounded-full bg-maroon-700 py-1.5 text-xs font-extrabold text-cream-100">➕ Add</button>
                    {qty > 0 && <button onClick={() => decGoodie(g.id)} className="mt-1 w-full rounded-full bg-white border border-blush-200 py-1 text-xs font-bold text-maroon-700">− Remove</button>}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-soft">
            <h3 className="font-serif text-xl text-maroon-800">✨ Add on gifts ✨</h3>
            <div className="mt-4 space-y-3">
              {ADDONS.map((a) => {
                const qty = addons[a.id] || 0
                return (
                  <div key={a.id} className="flex items-center justify-between rounded-2xl border border-blush-200 bg-cream-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-extrabold text-maroon-800">{a.emoji} {a.name} {a.per && <span className="text-xs text-ink/50">({a.per})</span>}</p>
                      <p className="text-xs text-ink/50">₹{a.price}/- {a.per || ''}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setAddonQty(a.id, -1)} className="h-8 w-8 grid place-items-center rounded-full bg-white border border-blush-200">−</button>
                      <span className="w-6 text-center font-extrabold text-sm">{qty}</span>
                      <button onClick={() => setAddonQty(a.id, 1)} className="h-8 w-8 grid place-items-center rounded-full bg-maroon-700 text-cream-100">+</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal className="mt-10 text-center">
        <Link to="/shop" className="btn-ghost">…or choose a ready-made hamper</Link>
      </Reveal>
    </section>
  )
}
