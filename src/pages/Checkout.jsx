import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { formatPrice } from '../components/ui/Price'
import ConfettiBurst from '../components/ui/Confetti'
import PageLoader from '../components/ui/PageLoader'
import { useCart } from '../store/cartStore'
import { useUI } from '../store/uiStore'
import { useAuth } from '../store/authStore'
import { minDeliveryDateStr, deliveryDateError } from '../lib/deliveryDate'

const deliverySchema = z.object({
  email: z.string().email('Enter a valid email'),
  firstName: z.string().min(2, 'Required'),
  lastName: z.string().min(2, 'Required'),
  phone: z.string().min(7, 'Enter a valid phone'),
  address: z.string().min(5, 'Enter your address'),
  city: z.string().min(2, 'Required'),
  state: z.string().min(2, 'Required'),
  zip: z.string().min(3, 'Required'),
  country: z.string().min(2, 'Required'),
})

const UPI_ID = import.meta.env.VITE_UPI_ID || '9553052279-2@ybl'
const UPI_PAYEE = 'BANDARI YAMINI DEVI'

const paymentSchema = z.object({
  method: z.enum(['cod', 'upi'], { required_error: 'Select a payment method' }),
})

const steps = ['Delivery', 'Gift it', 'Payment', 'Review']

export default function Checkout() {
  const [step, setStep] = useState(0)
  const [placed, setPlaced] = useState(false)
  const [confettiOn, setConfettiOn] = useState(false)
  const { items, giftNote, setGiftNote, giftWrap, setGiftWrap, deliveryDate, setDeliveryDate, coupon, applyCouponAsync, utr, setUtr, getTotals, clearCart } = useCart()
  // Unique payment reference for this checkout (locked into the QR + saved on the order)
  const [payRef] = useState(() => `ML${Date.now().toString(36).toUpperCase()}`)
  const [utrError, setUtrError] = useState('')

  const onUtrChange = (value) => {
    setUtr(value)
    if (utrError && /^\d{12}$/.test(value.replace(/\D/g, ''))) setUtrError('')
  }
  const pushToast = useUI((s) => s.pushToast)
  const authReady = useAuth((s) => s.initialized)
  const user = useAuth((s) => s.user)
  const totals = getTotals()

  const [codeInput, setCodeInput] = useState('')

  const delivery = useForm({
    resolver: zodResolver(deliverySchema),
    defaultValues: { email: '', firstName: '', lastName: '', phone: '', address: '', city: '', state: '', zip: '', country: '' },
  })

  const payment = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: { method: 'cod' },
  })

  const next = async () => {
    const ok = step === 0 ? await delivery.trigger() : step === 2 ? await payment.trigger() : true
    if (ok) setStep((s) => Math.min(steps.length - 1, s + 1))
  }
  const back = () => setStep((s) => Math.max(0, s - 1))

  const [placing, setPlacing] = useState(false)
  const [dateError, setDateError] = useState('')

  const onDateChange = (value) => {
    setDeliveryDate(value)
    setDateError(deliveryDateError(value) ?? '')
  }

  const placeOrder = async (e) => {
    e.preventDefault()
    if (placing) return
    const err = deliveryDateError(deliveryDate)
    if (err) {
      setDateError(err)
      pushToast(err, 'error')
      return
    }
    const customer = delivery.getValues()
    const payMethod = payment.getValues('method')
    if (payMethod === 'upi' && !/^\d{12}$/.test(utr || '')) {
      const msg = 'Enter the 12-digit UTR / Ref No. from your UPI receipt first'
      setUtrError(msg)
      pushToast(msg, 'error')
      return
    }
    setPlacing(true)
    try {
      const { supabase } = await import('../lib/supabase')
      if (!supabase || !user) throw new Error('Please sign in again')
      const { data: inserted, error } = await supabase.from('orders').insert({
        user_id: user.id,
        email: customer.email || user.email,
        customer,
        items,
        status: payMethod === 'upi' ? 'pending' : 'confirmed',
        totals: { ...totals, paymentMethod: payMethod, upiId: payMethod === 'upi' ? UPI_ID : null, couponCode: coupon?.code || null, utr: payMethod === 'upi' ? utr : null, paymentRef: payMethod === 'upi' ? payRef : null },
        gift_note: giftNote || null,
        gift_wrap: giftWrap,
        delivery_date: deliveryDate || null,
      }).select().single()
      if (error) throw new Error(error.message)
      // burn one-time welcome code so the email can't reuse it
      if (coupon?.welcome) {
        const { markWelcomeUsed } = await import('../lib/welcomeCoupon')
        markWelcomeUsed(coupon.code)
      }
      // fire admin email in background — order already saved
      supabase.functions.invoke('send-order-email', { body: { order: inserted } }).then(({ error: fnErr }) => {
        if (fnErr) console.warn('Email not sent (deploy function + set RESEND_API_KEY):', fnErr.message)
      })
      setPlaced(true)
      setConfettiOn(true)
      clearCart()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      pushToast(err.message, 'error')
    } finally {
      setPlacing(false)
    }
  }

  // ---- Success screen ------------------------------------------------------
  if (placed) {
    return (
      <section className="py-20 container-px text-center">
        <ConfettiBurst trigger={confettiOn} />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 18 }}>
          <div className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-full bg-gold-sheen text-5xl shadow-gold animate-float">🎀</div>
          <span className="script-accent text-3xl block">It’s on its way</span>
          <h1 className="mt-1 font-serif text-4xl sm:text-5xl text-maroon-800">Order confirmed!</h1>
          <p className="mx-auto mt-4 max-w-md text-ink/70">
            {payment.getValues('method') === 'upi'
              ? 'Payment received — we’re verifying it right now, and wrapping starts the moment it lands ✅'
              : 'We’ve started wrapping.'} {giftNote ? `Your note “${giftNote.slice(0, 60)}${giftNote.length > 60 ? '…' : ''}” is tucked inside.` : ''}
            {deliveryDate ? ` Delivery is scheduled for ${new Date(deliveryDate + 'T00:00:00').toLocaleDateString()}.` : ' Delivery in 3–5 days.'}
          </p>
          <p className="mt-2 text-sm text-ink/50">A confirmation email is on its way. Track it anytime under <Link to="/account" className="text-maroon-700 font-bold underline">Account</Link>.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/shop" className="rounded-full border-2 border-blush-300 bg-blush-100 px-6 py-2.5 text-sm font-bold text-maroon-800 hover:border-gold-400 hover:bg-blush-50 transition">Keep shopping</Link>
            <Link to="/track-order" className="rounded-full border-2 border-blush-300 bg-blush-100 px-6 py-2.5 text-sm font-bold text-maroon-800 hover:border-gold-400 hover:bg-blush-50 transition">Track my order 📍</Link>
          </div>
        </motion.div>
      </section>
    )
  }

  if (items.length === 0) {
    return (
      <section className="py-24 container-px text-center">
        <p className="text-6xl mb-4">🧾</p>
        <h1 className="font-serif text-3xl text-maroon-800">Your cart is empty</h1>
        <p className="mt-2 text-ink/60">Add something lovely before checking out.</p>
        <Link to="/shop" className="btn-gold mt-6">Shop gifts</Link>
      </section>
    )
  }

  if (!authReady) return <PageLoader />

  if (!user) {
    return (
      <section className="py-16 container-px">
        <div className="mx-auto max-w-md">
          <div className="rounded-[2rem] bg-white p-8 shadow-soft text-center">
            <p className="text-5xl">🔒</p>
            <h2 className="mt-4 font-serif text-2xl text-maroon-800">Sign in to place your order</h2>
            <p className="mt-2 text-sm text-ink/60">
              Your cart is safe — sign in and you’ll come right back to checkout with all {items.length}{' '}
              {items.length === 1 ? 'item' : 'items'} waiting.
            </p>
            <Link to="/login?next=/checkout" className="btn-primary mt-6 inline-block w-full">Sign in</Link>
            <Link to="/signup?next=/checkout" className="btn-ghost mt-3 inline-block w-full">Create an account</Link>
            <Link to="/shop" className="mt-4 inline-block text-sm text-ink/50 hover:text-maroon-700">← Keep shopping</Link>
          </div>
        </div>
      </section>
    )
  }

  const inputErr = (errors, name) => errors[name] && <p className="mt-1 text-xs font-bold text-red-600">{errors[name].message}</p>

  return (
    <section className="py-12 container-px">
      {/* Stepper */}
      <div className="mx-auto mb-10 max-w-3xl">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s} className="flex flex-1 items-center last:flex-none">
              <button onClick={() => i < step && setStep(i)} className="flex flex-col items-center gap-1.5 group">
                <span className={`grid h-10 w-10 place-items-center rounded-full font-extrabold transition ${i <= step ? 'bg-maroon-700 text-cream-100 shadow-soft' : 'bg-white text-ink/40 border-2 border-blush-200'}`}>
                  {i < step ? '✓' : i + 1}
                </span>
                <span className={`text-xs font-bold ${i <= step ? 'text-maroon-700' : 'text-ink/40'}`}>{s}</span>
              </button>
              {i < steps.length - 1 && <div className={`mx-3 h-0.5 flex-1 rounded ${i < step ? 'bg-gold-500' : 'bg-blush-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[2rem] bg-white p-6 sm:p-8 shadow-soft">
          <AnimatePresence mode="wait">
            {/* STEP 1 — DELIVERY */}
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h2 className="font-serif text-2xl text-maroon-800 mb-6">Where should we send it?</h2>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div>
                    <label className="label">Email</label>
                    <input type="email" className="input" placeholder="you@example.com" {...delivery.register('email')} />
                    {inputErr(delivery.formState.errors, 'email')}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="label">First name</label>
                      <input className="input" {...delivery.register('firstName')} />
                      {inputErr(delivery.formState.errors, 'firstName')}
                    </div>
                    <div>
                      <label className="label">Last name</label>
                      <input className="input" {...delivery.register('lastName')} />
                      {inputErr(delivery.formState.errors, 'lastName')}
                    </div>
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input type="tel" className="input" placeholder="+1 555 000 1234" {...delivery.register('phone')} />
                    {inputErr(delivery.formState.errors, 'phone')}
                  </div>
                  <div>
                    <label className="label">Address</label>
                    <input className="input" placeholder="Street address" {...delivery.register('address')} />
                    {inputErr(delivery.formState.errors, 'address')}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="label">City</label>
                      <input className="input" {...delivery.register('city')} />
                      {inputErr(delivery.formState.errors, 'city')}
                    </div>
                    <div>
                      <label className="label">State</label>
                      <input className="input" {...delivery.register('state')} />
                      {inputErr(delivery.formState.errors, 'state')}
                    </div>
                    <div>
                      <label className="label">ZIP</label>
                      <input className="input" {...delivery.register('zip')} />
                      {inputErr(delivery.formState.errors, 'zip')}
                    </div>
                  </div>
                  <div>
                    <label className="label">Country</label>
                    <input className="input" {...delivery.register('country')} />
                    {inputErr(delivery.formState.errors, 'country')}
                  </div>
                </form>
              </motion.div>
            )}

            {/* STEP 2 — GIFT IT */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h2 className="font-serif text-2xl text-maroon-800 mb-6">Make it a gift 🎀</h2>
                <div className="space-y-5">
                  <div>
                    <label className="label">Gift message</label>
                    <textarea
                      value={giftNote}
                      onChange={(e) => setGiftNote(e.target.value)}
                      rows={4}
                      maxLength={200}
                      placeholder="To my dearest… with all my love, on your special day. x"
                      className="input resize-none"
                    />
                    <p className="mt-1 text-right text-xs text-ink/40">{giftNote.length}/200</p>
                  </div>
                  <div>
                    <label className="label">Schedule delivery (optional)</label>
                    <input type="date" value={deliveryDate} min={minDeliveryDateStr()} onChange={(e) => onDateChange(e.target.value)} className={`input ${dateError ? '!border-red-400' : ''}`} />
                    {dateError ? (
                      <p className="mt-1 text-xs font-bold text-red-600">⚠️ {dateError}</p>
                    ) : (
                      <p className="mt-1 text-xs text-ink/50">Set it to land on their birthday or anniversary · at least 2 days ahead.</p>
                    )}
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={giftWrap} onChange={(e) => setGiftWrap(e.target.checked)} className="h-5 w-5 accent-gold-500" />
                    <span className="text-sm font-bold text-maroon-800">Premium gift wrap + ribbon (+{formatPrice(4.5)})</span>
                  </label>
                  <div className="rounded-2xl bg-blush-50 border border-blush-200 p-4 text-sm text-ink/70">
                    ✍️ The message is printed in a handwriting-style font on our keepsake cards, tucked under the ribbon.
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3 — PAYMENT */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h2 className="font-serif text-2xl text-maroon-800 mb-6">Choose payment method</h2>
                <div className="space-y-3">
                  <label className={`flex items-center gap-4 rounded-2xl border-2 p-4 cursor-pointer transition ${payment.watch('method') === 'cod' ? 'border-gold-500 bg-blush-50' : 'border-blush-200 bg-white hover:border-gold-300'}`}>
                    <input type="radio" value="cod" {...payment.register('method')} className="h-5 w-5 accent-gold-500" />
                    <div className="flex-1">
                      <p className="font-extrabold text-maroon-800">💵 Cash on Delivery (COD)</p>
                      <p className="text-xs text-ink/60">Pay when the gift arrives — no advance needed</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-4 rounded-2xl border-2 p-4 cursor-pointer transition ${payment.watch('method') === 'upi' ? 'border-gold-500 bg-blush-50' : 'border-blush-200 bg-white hover:border-gold-300'}`}>
                    <input type="radio" value="upi" {...payment.register('method')} className="h-5 w-5 accent-gold-500" />
                    <div className="flex-1">
                      <p className="font-extrabold text-maroon-800">📱 Pay Online — UPI Scanner</p>
                      <p className="text-xs text-ink/60">Scan & pay via any UPI app (GPay, PhonePe, Paytm)</p>
                    </div>
                  </label>
                  {inputErr(payment.formState.errors, 'method')}
                </div>

                {payment.watch('method') === 'upi' && (
                  <div className="mt-6 rounded-2xl bg-white border border-blush-200 p-6">
                    <p className="text-sm font-extrabold text-maroon-800 text-center">Pay <span className="font-serif text-lg">₹{Math.round(totals.total * 83.5)}</span> via UPI</p>
                    <p className="text-xs text-ink/50 mt-1 text-center">UPI ID: <span className="font-bold text-maroon-700">{UPI_ID}</span> · {UPI_PAYEE} · Ref: <span className="font-bold text-maroon-700">{payRef}</span></p>
                    <img
                      src="/upi-qr.jpg"
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`upi://pay?pa=${UPI_ID}&pn=Memories Lane&am=${Math.round(totals.total * 83.5)}&cu=INR&tn=${payRef}&tr=${payRef}`)}`
                      }}
                      alt="PhonePe QR — Memories Lane"
                      className="mx-auto mt-4 h-56 w-56 rounded-2xl border border-blush-200 object-cover"
                    />
                    <p className="mt-2 text-center text-sm font-extrabold text-maroon-800">Enter ₹{Math.round(totals.total * 83.5)} exactly · Add ref <span className="font-serif">{payRef}</span> in the note</p>
                    <ol className="mt-4 space-y-2 text-sm text-ink/70">
                      <li><span className="font-extrabold text-maroon-800">1 ·</span> Scan the QR with any UPI app & pay <span className="font-bold">₹{Math.round(totals.total * 83.5)} exactly</span></li>
                      <li><span className="font-extrabold text-maroon-800">2 ·</span> Copy the <span className="font-bold">12-digit UTR / Ref No.</span> from your payment receipt</li>
                      <li><span className="font-extrabold text-maroon-800">3 ·</span> Paste it below — we verify it and start wrapping 🎀</li>
                    </ol>
                    <div className="mt-4">
                      <label className="label !text-xs">UTR / UPI Ref No. (12 digits)</label>
                      <input
                        value={utr}
                        onChange={(e) => onUtrChange(e.target.value)}
                        inputMode="numeric"
                        placeholder="e.g. 423781908654"
                        className={`input tracking-widest font-bold ${utrError ? '!border-red-400' : ''}`}
                      />
                      {utrError ? (
                        <p className="mt-1 text-xs font-bold text-red-600">⚠️ {utrError}</p>
                      ) : (
                        <p className="mt-1 text-xs text-ink/50">Find it in your UPI app under History → that payment → “UTR / Transaction ID”.</p>
                      )}
                    </div>
                  </div>
                )}
                {payment.watch('method') === 'cod' && (
                  <div className="mt-4 rounded-2xl bg-blush-50 border border-blush-200 p-4 text-sm text-ink/70">
                    ✅ You’ll pay <span className="font-bold text-maroon-800">{formatPrice(totals.total)}</span> in cash when the delivery arrives.
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 4 — REVIEW */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h2 className="font-serif text-2xl text-maroon-800 mb-6">Review your order</h2>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.key} className="flex items-center justify-between gap-4 rounded-2xl bg-cream-100 p-4">
                      <div className="flex items-center gap-3">
                        {item.image ? <img src={item.image} alt={item.name} className="h-14 w-14 rounded-xl object-cover" /> : <span className="text-3xl">🧺</span>}
                        <div>
                          <p className="font-bold text-maroon-800 text-sm">{item.name}</p>
                          <p className="text-xs text-ink/50">Qty {item.qty}{item.variant ? ` · ${item.variant}` : ''}</p>
                        </div>
                      </div>
                      <span className="font-bold text-maroon-800">{formatPrice(item.price * item.qty)}</span>
                    </div>
                  ))}
                  {giftNote && (
                    <div className="rounded-2xl border border-gold-400 bg-blush-50 p-4">
                      <p className="text-xs font-extrabold uppercase tracking-widest text-gold-600 mb-1">Gift message</p>
                      <p className="text-sm italic text-maroon-800">“{giftNote}”</p>
                    </div>
                  )}
                  <div className="rounded-2xl bg-white border border-blush-200 p-4 text-sm space-y-2">
                    <p className="font-extrabold text-maroon-800">Payment</p>
                    <p className="text-ink/70">{payment.getValues('method') === 'upi' ? `📱 UPI — ${UPI_ID} · UTR ${utr || '—'} · Ref ${payRef}` : '💵 Cash on Delivery'}</p>
                  </div>
                  <div className="rounded-2xl bg-white border border-blush-200 p-4 text-sm space-y-2">
                    <p className="font-extrabold text-maroon-800">Delivery</p>
                    <p className="text-ink/70">
                      {delivery.getValues('firstName')} {delivery.getValues('lastName')} · {delivery.getValues('address')}, {delivery.getValues('city')}, {delivery.getValues('state')} {delivery.getValues('zip')}, {delivery.getValues('country')}
                    </p>
                    <p className="text-ink/60">
                      {deliveryDate
                        ? `📅 Scheduled for ${new Date(deliveryDate + 'T00:00:00').toLocaleDateString()}`
                        : '📦 Delivery in 3–5 days'}
                      {giftWrap ? ' · 🎀 Gift wrap' : ''}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white border border-blush-200 p-4 text-sm space-y-1.5">
                    <div className="flex justify-between text-ink/70"><span>Subtotal</span><span>{formatPrice(totals.subtotal)}</span></div>
                    {coupon && <div className="flex justify-between text-maroon-600 font-bold"><span>Discount</span><span>−{formatPrice(totals.discount)}</span></div>}
                    <div className="flex justify-between text-ink/70"><span>Shipping</span><span>{totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)}</span></div>
                    <div className="flex justify-between border-t border-blush-200 pt-2 font-serif text-lg text-maroon-800"><span>Total</span><span>{formatPrice(totals.total)}</span></div>
                  </div>
                  <button onClick={placeOrder} disabled={placing} className="btn-primary w-full !py-4 text-lg border-2 border-maroon-800 disabled:opacity-50">
                    {placing ? 'Placing order…' : `🎀 Place order — ${formatPrice(totals.total)}`}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step nav */}
          {step < 3 && (
            <div className="mt-8 flex items-center justify-between">
              {step > 0 ? (
                <button onClick={back} className="rounded-full border-2 border-blush-300 bg-blush-100 px-6 py-2.5 text-sm font-bold text-maroon-800 hover:border-gold-400 hover:bg-blush-50 transition">← Back</button>
              ) : <span />}
              <button onClick={next} className="rounded-full border-2 border-maroon-800 bg-maroon-700 px-6 py-2.5 text-sm font-bold text-cream-100 hover:bg-maroon-600 transition">Continue →</button>
            </div>
          )}
        </div>

        {/* Summary sidebar */}
        <aside className="h-fit rounded-3xl bg-white p-6 shadow-lift lg:sticky lg:top-28">
          <h3 className="font-serif text-2xl text-maroon-800 mb-4">Summary</h3>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-ink/70 truncate">{item.qty} × {item.name}</span>
                <span className="font-bold text-maroon-800">{formatPrice(item.price * item.qty)}</span>
              </div>
            ))}
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const res = await applyCouponAsync(codeInput)
              pushToast(res.ok ? `Code applied 🎉` : res.error, res.ok ? 'success' : 'error')
              if (res.ok) setCodeInput('')
            }}
            className="mt-5 flex gap-2"
          >
            <input value={codeInput} onChange={(e) => setCodeInput(e.target.value)} placeholder="Promo code" className="input uppercase" />
            <button type="submit" className="btn-outline !px-4 !py-2">Apply</button>
          </form>
          <div className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between text-ink/70"><span>Subtotal</span><span>{formatPrice(totals.subtotal)}</span></div>
            {coupon && <div className="flex justify-between text-maroon-600 font-bold"><span>Discount</span><span>−{formatPrice(totals.discount)}</span></div>}
            <div className="flex justify-between text-ink/70"><span>Shipping</span><span>{totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)}</span></div>
            {giftWrap && <div className="flex justify-between text-ink/70"><span>Gift wrap</span><span>{formatPrice(totals.wrapFee)}</span></div>}
            <div className="flex justify-between border-t border-blush-200 pt-3 font-serif text-xl text-maroon-800"><span>Total</span><span>{formatPrice(totals.total)}</span></div>
          </div>
          <div className="mt-5 rounded-2xl bg-blush-50 border border-blush-200 p-4 text-xs text-ink/60 space-y-2">
            <p>🌿 Plastic-free, ribbon-tied packaging</p>
            <p>🔒 Encrypted payments</p>
            <p>🎁 Recipient sees no prices</p>
          </div>
        </aside>
      </div>
    </section>
  )
}
