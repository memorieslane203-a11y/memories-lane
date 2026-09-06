import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import SectionHeading from '../components/ui/SectionHeading'
import { trackOrderSteps } from '../data/content'
import { supabase } from '../lib/supabase'
import { useAuth } from '../store/authStore'

const statusOrder = ['pending', 'confirmed', 'wrapped', 'shipped', 'shipping', 'delivered']

export default function TrackOrder() {
  const [params] = useSearchParams()
  const [orderId, setOrderId] = useState(params.get('id') || '')
  const [order, setOrder] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(false)
  const user = useAuth((s) => s.user)
  const authReady = useAuth((s) => s.initialized)

  const runSearch = async (rawId) => {
    const id = (rawId || '').trim()
    if (!id) return
    setLoading(true); setNotFound(false); setOrder(null)
    try {
      // UUID columns reject ilike — fetch readable rows, match the prefix here
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(50)
      if (error) throw new Error('not found')
      const clean = id.toUpperCase().replace(/^ML-/, '').replace(/-/g, '')
      const match = (data || []).find((o) => o.id.replace(/-/g, '').toUpperCase().startsWith(clean) && clean.length >= 4)
      if (!match) throw new Error('not found')
      const statusIdx = statusOrder.indexOf(match.status)
      const timeline = trackOrderSteps.map((s, i) => ({
        step: s.key,
        time: i <= statusIdx ? new Date(match.created_at).toLocaleString() : 'Pending',
        done: i < statusIdx || (i === statusIdx && match.status === 'delivered'),
      }))
      setOrder({
        id: match.id.slice(0, 8).toUpperCase(),
        fullId: match.id,
        status: match.status,
        statusIndex: statusIdx === -1 ? 0 : statusIdx,
        eta: match.delivery_date ? new Date(match.delivery_date + 'T00:00:00').toLocaleDateString() : '3–5 days',
        timeline,
        raw: match,
      })
    } catch {
      setNotFound(true)
    } finally { setLoading(false) }
  }

  const search = (e) => {
    e.preventDefault()
    runSearch(orderId)
  }

  useEffect(() => {
    const q = params.get('id')
    if (q && user) runSearch(q)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return (
    <section className="py-12 container-px">
      <SectionHeading
        eyebrow="Where’s the ribbon?"
        title="Track your order"
        sub="Enter your order number from Account → Orders to see exactly where your gift is."
      />

      {!authReady ? null : !user ? (
        <div className="mx-auto max-w-md rounded-3xl bg-white p-8 text-center shadow-soft">
          <p className="text-5xl mb-3">🔒</p>
          <h3 className="font-serif text-xl text-maroon-800">Sign in to track</h3>
          <p className="mt-2 text-sm text-ink/60">Tracking is linked to your account — sign in first.</p>
          <Link to="/login?next=/track-order" className="btn-primary mt-5 inline-block">Sign in</Link>
        </div>
      ) : (
      <>
      <form onSubmit={search} className="mx-auto max-w-xl flex flex-col sm:flex-row gap-3">
        <input
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Order number, e.g. 46BF3FF2"
          className="input flex-1 uppercase"
        />
        <button type="submit" disabled={loading} className="rounded-full border-2 border-blush-300 bg-blush-100 px-6 py-2.5 text-sm font-bold text-maroon-800 hover:border-gold-400 hover:bg-blush-50 transition disabled:opacity-50">{loading ? 'Searching…' : 'Track gift 🎁'}</button>
      </form>

      <div className="mx-auto mt-10 max-w-2xl">
        <AnimatePresence mode="wait">
          {notFound && (
            <motion.div key="nf" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-3xl bg-white p-8 text-center shadow-soft">
              <p className="text-5xl mb-3">🔍</p>
              <h3 className="font-serif text-xl text-maroon-800">No order found</h3>
              <p className="mt-2 text-sm text-ink/60">Copy the full order number from Account → Orders and try again.</p>
            </motion.div>
          )}

          {order && (
            <motion.div key={order.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-[2rem] bg-white p-8 shadow-lift">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gold-600">Order {order.id} · {order.fullId.slice(0,8)}</p>
                  <h3 className="font-serif text-2xl text-maroon-800">Status: {order.status} · ETA: {order.eta}</h3>
                </div>
                <span className={`rounded-full text-sm font-extrabold px-4 py-2 ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : order.status === 'cancelled' ? 'bg-red-100 text-red-700' : order.status === 'shipped' || order.status === 'shipping' ? 'bg-gold-500 text-maroon-800' : 'bg-blush-100 text-maroon-700'}`}>{order.status}</span>
              </div>

              {order.status === 'cancelled' && (
                <div className="mt-6 rounded-2xl bg-red-50 border border-red-200 p-5 text-center">
                  <p className="text-3xl">🚫</p>
                  <p className="mt-2 font-serif text-xl text-red-800">This order was cancelled</p>
                  <p className="mt-1 text-sm text-ink/60">Changed your mind again? We'd love to wrap something new for you.</p>
                </div>
              )}

              {order.status !== 'cancelled' && (
              <>
              {/* Stepper */}
              <div className="mt-8">
                {order.timeline.map((t, i) => {
                  const isCurrent = i === order.statusIndex
                  return (
                    <div key={t.step} className="relative flex gap-4 pb-8 last:pb-0">
                      {i < order.timeline.length - 1 && (
                        <span className={`absolute left-[15px] top-8 h-full w-0.5 ${t.done ? 'bg-gold-500' : 'bg-blush-200'}`} />
                      )}
                      <span className={`relative z-10 grid h-8 w-8 flex-shrink-0 place-items-center rounded-full text-sm font-extrabold ${t.done ? 'bg-gold-500 text-maroon-800' : isCurrent ? 'bg-maroon-700 text-cream-100 animate-pulse' : 'bg-blush-200 text-ink/40'}`}>
                        {t.done ? '✓' : i + 1}
                      </span>
                      <div className="pt-1">
                        <p className={`font-bold ${t.done || isCurrent ? 'text-maroon-800' : 'text-ink/40'}`}>
                          {trackOrderSteps[i].label}
                        </p>
                        <p className="text-sm text-ink/50">{t.time}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 rounded-2xl bg-blush-50 border border-blush-200 p-4 text-sm text-ink/70">
                🎀 <span className="font-bold text-maroon-800">Heads up:</span> if this is a gift with a scheduled delivery date, tracking is hidden until it ships to keep the surprise intact.
              </div>
              </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </>
      )}
    </section>
  )
}
