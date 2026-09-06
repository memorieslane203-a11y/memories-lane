import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Quantity from '../components/ui/Quantity'
import { formatPrice } from '../components/ui/Price'
import ProductCard from '../components/ui/ProductCard'
import SectionHeading from '../components/ui/SectionHeading'
import { useCart } from '../store/cartStore'
import { useUI } from '../store/uiStore'
import { useProducts } from '../store/productStore'
import { relatedFrom } from '../data/products'
import { minDeliveryDateStr, deliveryDateError } from '../lib/deliveryDate'

export default function Cart() {
  const navigate = useNavigate()
  const allProducts = useProducts((s) => s.products)
  const { items, setQty, removeItem, coupon, applyCouponAsync, removeCoupon, giftNote, setGiftNote, giftWrap, setGiftWrap, deliveryDate, setDeliveryDate, getTotals } = useCart()
  const pushToast = useUI((s) => s.pushToast)
  const totals = getTotals()
  const [code, setCode] = useState('')
  const [addOns, setAddOns] = useState({})
  const [dateError, setDateError] = useState('')

  const onDateChange = (value) => {
    setDeliveryDate(value)
    setDateError(deliveryDateError(value) ?? '')
  }

  // Recommended add-ons (bundling) — pick one of the bestsellers
  const addOnCandidates = items[0] ? relatedFrom(allProducts, { id: items[0].productId, category: items[0].slug.includes('magazine') ? 'magazines' : 'gift-boxes', occasion: [], theme: '' }, 3) : []

  const submitCoupon = async (e) => {
    e.preventDefault()
    const res = await applyCouponAsync(code)
    pushToast(res.ok ? `Code ${res.coupon.code} applied 🎉` : res.error, res.ok ? 'success' : 'error')
    if (res.ok) setCode('')
  }

  const addAddOn = (p) => {
    if (addOns[p.id]) return
    setAddOns((a) => ({ ...a, [p.id]: true }))
    useCart.getState().addItem({
      productId: p.id,
      slug: p.slug,
      name: p.name,
      image: p.images?.[0]?.src,
      price: p.price,
    })
    pushToast(`Add-on added: ${p.name} ✨`)
  }

  return (
    <section className="py-12 container-px">
      <SectionHeading eyebrow="Almost wrapped" title="Your cart" />

      {items.length === 0 ? (
        <div className="rounded-[2rem] bg-white p-14 text-center shadow-soft max-w-xl mx-auto">
          <p className="text-6xl mb-4 animate-float">🎁</p>
          <h3 className="font-serif text-2xl text-maroon-800">Nothing to wrap yet</h3>
          <p className="mt-2 text-ink/60">Let’s fix that — the lane is full of lovely things.</p>
          <Link to="/shop" className="btn-primary mt-6">Browse gifts</Link>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          <div>
            <div className="flex flex-col gap-4">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.div
                    key={item.key}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    className="flex gap-4 rounded-3xl bg-white p-4 shadow-soft"
                  >
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-28 w-28 rounded-2xl object-cover" />
                    ) : (
                      <div className="grid h-28 w-28 place-items-center rounded-2xl bg-blush-100 text-4xl">🧺</div>
                    )}
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link to={`/product/${item.slug}`} className="font-serif text-lg text-maroon-800 leading-snug">{item.name}</Link>
                          {item.variant && <p className="text-xs text-ink/50 mt-0.5">{item.variant}</p>}
                        </div>
                        <button onClick={() => removeItem(item.key)} aria-label="Remove" className="text-ink/40 hover:text-maroon-600">✕</button>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <Quantity value={item.qty} onChange={(q) => setQty(item.key, q)} />
                        <div className="text-right">
                          <p className="font-bold text-maroon-800">{formatPrice(item.price * item.qty)}</p>
                          <p className="text-xs text-ink/40">{formatPrice(item.price)} each</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Gift options */}
            <div className="mt-8 rounded-3xl bg-white p-6 shadow-soft">
              <h3 className="font-serif text-2xl text-maroon-800 mb-5">Make it a gift 🎀</h3>
              <div className="space-y-5">
                <div>
                  <label className="label">Gift message</label>
                  <textarea
                    value={giftNote}
                    onChange={(e) => setGiftNote(e.target.value)}
                    rows={3}
                    maxLength={200}
                    placeholder="To Mum, with all my love — happy anniversary! x"
                    className="input resize-none"
                  />
                  <p className="mt-1 text-right text-xs text-ink/40">{giftNote.length}/200</p>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="label">Schedule delivery date</label>
                    <input type="date" value={deliveryDate} min={minDeliveryDateStr()} onChange={(e) => onDateChange(e.target.value)} className={`input ${dateError ? '!border-red-400' : ''}`} />
                    {dateError ? (
                      <p className="mt-1 text-xs font-bold text-red-600">⚠️ {dateError}</p>
                    ) : (
                      <p className="mt-1 text-xs text-ink/50">Perfect for birthdays & anniversaries · at least 2 days ahead</p>
                    )}
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer self-end pb-3">
                    <input type="checkbox" checked={giftWrap} onChange={(e) => setGiftWrap(e.target.checked)} className="h-5 w-5 accent-gold-500" />
                    <span className="text-sm font-bold text-maroon-800">Add gift wrap + {formatPrice(4.5)}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Add-ons */}
            {addOnCandidates.length > 0 && (
              <div className="mt-8">
                <h3 className="font-serif text-2xl text-maroon-800 mb-5">Perfect add-ons</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  {addOnCandidates.map((p) => (
                    <div key={p.id} className={`rounded-3xl bg-white p-4 shadow-soft flex flex-col ${addOns[p.id] ? 'ring-2 ring-gold-500' : ''}`}>
                      <img src={p.images?.[0]?.src} alt={p.name} className="h-24 w-full object-cover rounded-2xl" />
                      <p className="mt-2 font-serif text-sm text-maroon-800 flex-1">{p.name}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-bold text-maroon-800">{formatPrice(p.price)}</span>
                        {addOns[p.id] ? (
                          <span className="text-xs font-extrabold text-gold-600">✓ Added</span>
                        ) : (
                          <button onClick={() => addAddOn(p)} className="btn-gold !px-4 !py-1.5 text-xs">Add</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-28 h-fit rounded-3xl bg-white p-6 shadow-lift">
            <h3 className="font-serif text-2xl text-maroon-800 mb-5">Order summary</h3>
            <form onSubmit={submitCoupon} className="flex gap-2 mb-5">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Promo code"
                className="input uppercase"
              />
              <button type="submit" className="btn-outline !px-5 !py-2.5">Apply</button>
            </form>
            {coupon && (
              <div className="mb-4 flex items-center justify-between rounded-xl bg-blush-50 border border-blush-200 px-3 py-2 text-sm">
                <span className="font-bold text-maroon-700">🎟️ {coupon.code} applied</span>
                <button onClick={removeCoupon} className="text-ink/40 hover:text-maroon-600">✕</button>
              </div>
            )}

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-ink/70"><span>Subtotal</span><span>{formatPrice(totals.subtotal)}</span></div>
              {coupon && (
                <div className="flex justify-between text-maroon-600 font-bold"><span>Discount</span><span>−{formatPrice(totals.discount)}</span></div>
              )}
              <div className="flex justify-between text-ink/70"><span>Shipping</span><span>{totals.shipping === 0 ? <span className="text-maroon-700 font-bold">Free</span> : formatPrice(totals.shipping)}</span></div>
              {giftWrap && <div className="flex justify-between text-ink/70"><span>Gift wrap</span><span>{formatPrice(totals.wrapFee)}</span></div>}
              <div className="flex justify-between border-t border-blush-200 pt-3 font-serif text-xl text-maroon-800">
                <span>Total</span><span>{formatPrice(totals.total)}</span>
              </div>
            </div>

            <button onClick={() => { if (dateError) { pushToast(dateError, 'error'); return } navigate('/checkout') }} className="w-full mt-6 inline-flex items-center justify-center gap-2 rounded-full border-2 border-maroon-800 bg-white px-5 py-3.5 text-sm font-bold text-maroon-800 hover:border-gold-400 hover:bg-blush-50 transition text-center">
              Proceed to checkout →
            </button>
            <p className="mt-3 text-center text-xs text-ink/50">🔒 256-bit encrypted · Pay securely</p>
            <Link to="/shop" className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-full border-2 border-maroon-700 bg-white px-5 py-2.5 text-sm font-bold text-maroon-800 hover:border-gold-400 hover:bg-blush-50 transition text-center">Continue shopping</Link>
          </div>
        </div>
      )}
    </section>
  )
}
