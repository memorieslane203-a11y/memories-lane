import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ProductCard from '../components/ui/ProductCard'
import { formatPrice } from '../components/ui/Price'
import { useWishlist } from '../store/wishlistStore'
import { useCart } from '../store/cartStore'
import { useUI } from '../store/uiStore'
import { useProducts } from '../store/productStore'
import { useAuth } from '../store/authStore'

const ordersFallback = []

const addresses = [
  { id: 1, label: 'Home', name: 'Aisha M.', line1: '12 Blossom Court', city: 'San Francisco, CA 94107', country: 'United States' },
  { id: 2, label: 'Office', name: 'Aisha M.', line1: 'One Market Plaza, Suite 400', city: 'San Francisco, CA 94105', country: 'United States' },
]

const statusStyle = {
  Delivered: 'bg-emerald-100 text-emerald-700',
  Active: 'bg-gold-100 text-gold-700',
  Paused: 'bg-blush-100 text-blush-700',
  pending: 'bg-gold-100 text-maroon-800',
  confirmed: 'bg-blush-100 text-maroon-700',
  wrapped: 'bg-blush-100 text-maroon-700',
  shipped: 'bg-gold-500 text-maroon-800',
  shipping: 'bg-gold-500 text-maroon-800',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function Account() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') ?? 'overview'
  const [savedAddresses, setSavedAddresses] = useState(addresses)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const wishlist = useWishlist((s) => s)
  const pushToast = useUI((s) => s.pushToast)
  const addItem = useCart((s) => s.addItem)
  const products = useProducts((s) => s.products)

  const wishProducts = products.filter((p) => wishlist.items.some((w) => w.slug === p.slug))
  const user = useAuth((s) => s.user)
  const signOut = useAuth((s) => s.signOut)
  const [orders, setOrders] = useState(ordersFallback)
  const [ordersLoading, setOrdersLoading] = useState(false)

  useEffect(() => {
    if (!user) { setOrders([]); return }
    setOrdersLoading(true)
    import('../lib/supabase').then(({ supabase }) => {
      supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).then(({ data }) => {
        if (data && data.length) setOrders(data.map((o) => ({
          id: o.id.slice(0, 8).toUpperCase(),
          fullId: o.id,
          date: new Date(o.created_at).toLocaleDateString(),
          items: (o.items || []).map((i) => `${i.name} ×${i.qty}`).join(' · '),
          total: o.totals?.total ?? 0,
          status: o.status,
        })))
        else setOrders([])
        setOrdersLoading(false)
      })
    })
  }, [user])

  const setTab = (t) => {
    setParams(t === 'overview' ? {} : { tab: t })
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '🏠' },
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'addresses', label: 'Addresses', icon: '📍' },
    { id: 'wishlist', label: `Wishlist (${wishlist.items.length})`, icon: '🤍' },
  ]

  const saveAddress = (e) => {
    e.preventDefault()
    if (editing) {
      setSavedAddresses((prev) => prev.map((a) => (a.id === editing.id ? { ...a, ...form } : a)))
      pushToast('Address updated ✅')
    } else {
      setSavedAddresses((prev) => [...prev, { ...form, id: Date.now(), label: form.label || 'New' }])
      pushToast('Address added ✅')
    }
    setEditing(null)
    setForm({})
  }

  return (
    <section className="py-12 container-px">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="script-accent text-2xl block">Welcome back</span>
          {(() => {
            const raw = user ? (user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Aisha') : 'Aisha'
            let first = raw.split(' ')[0].replace(/[^a-zA-Z]/g, '') || 'Aisha'
            first = first.charAt(0).toUpperCase() + first.slice(1).toLowerCase()
            if (first.length > 5) first = first.slice(0, 5)
            return <h1 className="font-serif text-4xl text-maroon-800">Your lane, {first}</h1>
          })()}
          {user && (
            <p className="mt-2 text-sm text-ink/60">Signed in as <span className="font-bold text-maroon-700">{user.email}</span></p>
          )}
        </div>
        {user && (
          <button onClick={async () => { await signOut(); pushToast('Signed out — see you soon 👋', 'info') }} className="btn-outline text-sm">
            ↩️ Sign out
          </button>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Tab rail */}
        <aside>
          <div className="lg:sticky lg:top-28 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`whitespace-nowrap rounded-2xl px-4 py-3 text-sm font-bold transition ${tab === t.id ? 'bg-maroon-700 text-cream-100 shadow-soft' : 'bg-white text-maroon-700 hover:bg-blush-50'}`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </aside>

        <div>
          <AnimatePresence mode="wait">
            {/* OVERVIEW */}
            {tab === 'overview' && (
              <motion.div key="ov" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                <div className="rounded-[2rem] bg-white p-6 shadow-soft">
                  <h2 className="font-serif text-2xl text-maroon-800 mb-4">Latest order</h2>
                  {ordersLoading ? <p className="text-sm text-ink/60">Loading…</p> : orders.length === 0 ? (
                    <p className="text-sm text-ink/60">No orders yet — your first gift will appear here.</p>
                  ) : (
                    <OrderRow order={orders[0]} />
                  )}
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="rounded-[2rem] bg-white p-6 shadow-soft">
                    <h2 className="font-serif text-2xl text-maroon-800 mb-3">Saved addresses</h2>
                    <p className="text-sm text-ink/60">{savedAddresses.length} on file</p>
                    <button onClick={() => setTab('addresses')} className="btn-ghost mt-3 text-sm">Manage →</button>
                  </div>
                  <div className="rounded-[2rem] bg-white p-6 shadow-soft">
                    <h2 className="font-serif text-2xl text-maroon-800 mb-3">Wishlist</h2>
                    <p className="text-sm text-ink/60">{wishlist.items.length} gifts saved</p>
                    <button onClick={() => setTab('wishlist')} className="btn-ghost mt-3 text-sm">View →</button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ORDERS */}
            {tab === 'orders' && (
              <motion.div key="or" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <h2 className="font-serif text-2xl text-maroon-800">Order history</h2>
                {ordersLoading ? <p className="text-sm text-ink/60">Loading…</p> : orders.length === 0 ? (
                  <div className="rounded-3xl bg-white p-12 text-center shadow-soft">
                    <p className="text-5xl mb-3">📦</p>
                    <h3 className="font-serif text-xl text-maroon-800">No orders yet</h3>
                    <p className="mt-2 text-ink/60">Your gifts will appear here after checkout.</p>
                    <Link to="/shop" className="btn-gold mt-5">Browse gifts</Link>
                  </div>
                ) : (
                  orders.map((o) => (
                    <div key={o.id} className="rounded-3xl bg-white p-5 shadow-soft">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-bold text-maroon-800">{o.id} · <span className="font-sans text-ink/60 text-sm">{o.date}</span></p>
                          <p className="mt-1 text-sm text-ink/60">{o.items}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-serif text-lg text-maroon-800">{formatPrice(o.total)}</p>
                          <span className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-extrabold ${statusStyle[o.status]}`}>{o.status}</span>
                        </div>
                      </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button onClick={() => pushToast('Order details sent to your email 📧', 'info')} className="btn-outline !px-4 !py-2 text-xs">View details</button>
                      {o.fullId && o.status !== 'cancelled' && <Link to={`/track-order?id=${o.fullId}`} className="btn-ghost !px-4 !py-2 text-xs">📍 Track</Link>}
                      {o.fullId && ['pending', 'confirmed'].includes(o.status) && (
                        <button
                          onClick={async () => {
                            if (!window.confirm(`Cancel order ${o.id}? This cannot be undone.`)) return
                            const { supabase } = await import('../lib/supabase')
                            const { error } = await supabase.from('orders').update({ status: 'cancelled' }).eq('id', o.fullId)
                            if (error) {
                              pushToast(`Couldn't cancel: ${error.message}`, 'error')
                              return
                            }
                            setOrders((prev) => prev.map((x) => (x.fullId === o.fullId ? { ...x, status: 'cancelled' } : x)))
                            pushToast('Order cancelled', 'info')
                          }}
                          className="rounded-full border-2 border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-50 transition"
                        >
                          ✕ Cancel order
                        </button>
                      )}
                    </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {/* ADDRESSES */}
            {tab === 'addresses' && (
              <motion.div key="ad" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <h2 className="font-serif text-2xl text-maroon-800">Saved addresses</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {savedAddresses.map((a) => (
                    <div key={a.id} className="rounded-3xl bg-white p-5 shadow-soft">
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-gold-sheen text-maroon-800 text-xs font-extrabold px-3 py-1">{a.label}</span>
                        <button
                          onClick={() => { setEditing(a); setForm(a) }}
                          className="text-xs font-bold text-maroon-700 hover:text-gold-600"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="mt-3 font-bold text-maroon-800">{a.name}</p>
                      <p className="text-sm text-ink/60">{a.line1}<br />{a.city}<br />{a.country}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-3xl bg-white p-6 shadow-soft">
                  <h3 className="font-serif text-xl text-maroon-800 mb-4">{editing ? 'Edit address' : 'Add a new address'}</h3>
                  <form onSubmit={saveAddress} className="grid gap-4 sm:grid-cols-2">
                    <input className="input" placeholder="Label (Home, Office…)" value={form.label ?? ''} onChange={(e) => setForm({ ...form, label: e.target.value })} />
                    <input className="input" placeholder="Full name" required value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    <input className="input sm:col-span-2" placeholder="Address line" required value={form.line1 ?? ''} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
                    <input className="input sm:col-span-2" placeholder="City, State, ZIP" required value={form.city ?? ''} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                    <input className="input sm:col-span-2" placeholder="Country" required value={form.country ?? ''} onChange={(e) => setForm({ ...form, country: e.target.value })} />
                    <div className="sm:col-span-2 flex gap-3">
                      <button type="submit" className="btn-primary">Save address</button>
                      {editing && <button type="button" onClick={() => { setEditing(null); setForm({}) }} className="btn-ghost">Cancel</button>}
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* WISHLIST */}
            {tab === 'wishlist' && (
              <motion.div key="wi" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="font-serif text-2xl text-maroon-800 mb-6">Your wishlist</h2>
                {wishProducts.length === 0 ? (
                  <div className="rounded-3xl bg-white p-12 text-center shadow-soft">
                    <p className="text-5xl mb-3">🤍</p>
                    <h3 className="font-serif text-xl text-maroon-800">Nothing saved yet</h3>
                    <p className="mt-2 text-ink/60">Tap the ♡ on any gift to keep it here.</p>
                    <Link to="/shop" className="btn-gold mt-5">Browse gifts</Link>
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {wishProducts.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                )}
                {wishlist.notify.length > 0 && (
                  <div className="mt-8 rounded-3xl bg-white p-5 shadow-soft">
                    <h3 className="font-serif text-lg text-maroon-800 mb-2">Out-of-stock alerts</h3>
                    <ul className="space-y-2 text-sm text-ink/60">
                      {wishlist.notify.map((n, i) => (
                        <li key={i}>🔔 {n.slug} → {n.email}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

function OrderRow({ order }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-cream-100 p-4">
      <div>
        <p className="font-bold text-maroon-800">{order.id}</p>
        <p className="text-sm text-ink/60">{order.items}</p>
        <p className="mt-1 text-xs text-ink/40">{order.date}</p>
      </div>
      <div className="text-right">
        <p className="font-serif text-lg text-maroon-800">{formatPrice(order.total)}</p>
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-extrabold ${statusStyle[order.status]}`}>{order.status}</span>
      </div>
    </div>
  )
}
