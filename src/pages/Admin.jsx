import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import SectionHeading from '../components/ui/SectionHeading'
import PageLoader from '../components/ui/PageLoader'
import { supabase, isSupabaseReady, uploadProductImage, uploadGalleryMedia, GALLERY_CATEGORIES, IMAGE_BUCKET, ADMIN_EMAIL } from '../lib/supabase'
import { FESTIVE_THEMES, THEME_IDS } from '../lib/festiveThemes'
import { useTheme } from '../store/themeStore'
import { useProducts } from '../store/productStore'
import { useAuth } from '../store/authStore'
import { formatPrice } from '../components/ui/Price'

function SetupNotice() {
  return (
    <div className="mx-auto max-w-2xl rounded-[2rem] bg-white p-8 shadow-soft">
      <p className="text-5xl mb-4">🔑</p>
      <h2 className="font-serif text-2xl text-maroon-800">Connect Supabase to enable photo uploads</h2>
      <ol className="mt-5 space-y-3 text-sm text-ink/70 list-decimal list-inside">
        <li>Create a free project at <span className="font-bold">supabase.com</span></li>
        <li>Open the <span className="font-bold">SQL Editor</span> and run everything in <code className="rounded bg-cream-100 px-1.5 py-0.5 font-bold">supabase/schema.sql</code></li>
        <li>Run <code className="rounded bg-cream-100 px-1.5 py-0.5 font-bold">npm run supabase:seed</code> to load the catalogue</li>
        <li>Copy <code className="rounded bg-cream-100 px-1.5 py-0.5 font-bold">.env.example</code> → <code className="rounded bg-cream-100 px-1.5 py-0.5 font-bold">.env</code> and paste your <span className="font-bold">Project URL</span> and <span className="font-bold">anon key</span> (Project Settings → API)</li>
        <li>Restart the dev server — this page becomes live</li>
      </ol>
    </div>
  )
}

function LoginGate() {
  return (
    <div className="mx-auto max-w-md rounded-[2rem] bg-white p-8 shadow-soft text-center">
      <p className="text-5xl">🔒</p>
      <h2 className="mt-4 font-serif text-2xl text-maroon-800">Sign in to manage your shop</h2>
      <p className="mt-2 text-sm text-ink/60">
        Photo uploads, prices, stock and product edits are for logged-in store owners only.
      </p>
      <Link to="/login" className="btn-primary mt-6 inline-block w-full">Sign in</Link>
      <Link to="/signup" className="btn-ghost mt-3 inline-block w-full">Create an account</Link>
    </div>
  )
}

function OwnerOnlyGate() {
  return (
    <div className="mx-auto max-w-md rounded-[2rem] bg-white p-8 shadow-soft text-center">
      <p className="text-5xl">🚫</p>
      <h2 className="mt-4 font-serif text-2xl text-maroon-800">Store owner only</h2>
      <p className="mt-2 text-sm text-ink/60">
        This area is restricted to the Memories Lane store owner. You’re signed in as a customer — head back to the
        shop and keep browsing.
      </p>
      <Link to="/shop" className="btn-gold mt-6 inline-block w-full">Back to the shop</Link>
    </div>
  )
}

export default function Admin() {
  const ready = isSupabaseReady()
  const authReady = useAuth((s) => s.initialized)
  const user = useAuth((s) => s.user)
  const isOwner = !!user && ADMIN_EMAIL !== '' && user.email?.toLowerCase() === ADMIN_EMAIL
  const { products, source, load } = useProducts()
  const [busy, setBusy] = useState(null)
  const [msg, setMsg] = useState(null)
  const [drafts, setDrafts] = useState({})
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [openOrder, setOpenOrder] = useState(null)
  const [gallery, setGallery] = useState([])
  const [galleryLoading, setGalleryLoading] = useState(true)
  const [gCategory, setGCategory] = useState('polaroids')
  const [gCaption, setGCaption] = useState('')
  const [gBusy, setGBusy] = useState(false)
  const [pUploadSlug, setPUploadSlug] = useState('')
  const [pBusy, setPBusy] = useState(false)
  const [pCategory, setPCategory] = useState('all')
  const [pCaption, setPCaption] = useState('')
  const themeSettings = useTheme((s) => s.settings)
  const setThemeSettings = useTheme((s) => s.setSettings)
  const [tDraft, setTDraft] = useState(null) // local edits before Save
  const [tBusy, setTBusy] = useState(false)
  const tVal = (key) => tDraft?.[key] ?? themeSettings[key]

  useEffect(() => {
    if (!isOwner) return
    supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(50).then(({ data, error }) => {
      if (!error) setOrders(data || [])
      setOrdersLoading(false)
    })
    supabase.from('gallery_items').select('*').order('created_at', { ascending: false }).limit(200).then(({ data, error }) => {
      if (!error) setGallery(data || [])
      setGalleryLoading(false)
    })
  }, [isOwner])

  const toast = (text, ok = true) => {
    setMsg({ text, ok })
    setTimeout(() => setMsg(null), 3500)
  }

  const draft = (slug, key) =>
    drafts[slug]?.[key] ?? products.find((p) => p.slug === slug)?.[key]

  const setDraft = (slug, key, value) =>
    setDrafts((d) => ({ ...d, [slug]: { ...d[slug], [key]: value } }))

  const saveProduct = async (p) => {
    const d = drafts[p.slug]
    if (!d) return
    setBusy(p.id)
    const { error } = await supabase
      .from('products')
      .update({
        name: d.name ?? p.name,
        price: d.price != null ? Number(d.price) : p.price,
        badge: d.badge ?? p.badge ?? null,
        stock: d.stock != null ? Number(d.stock) : p.stock,
        short: d.short ?? p.short,
      })
      .eq('slug', p.slug)
    setBusy(null)
    if (error) {
      toast(`Save failed: ${error.message}`, false)
      return
    }
    setDrafts((dd) => { const { [p.slug]: _, ...rest } = dd; return rest })
    toast(`Saved “${d.name ?? p.name}” ✅`)
    load()
  }

  const uploadPhoto = async (p, file, altText) => {
    setBusy(p.id)
    try {
      const url = await uploadProductImage(p.slug, file)
      const realPhotos = (p.images || []).filter((i) => i.src.startsWith('http'))
      const { error } = await supabase
        .from('products')
        .update({ images: [{ src: url, alt: (altText || '').trim() || p.name }, ...realPhotos] })
        .eq('slug', p.slug)
      if (error) throw new Error(error.message)
      toast(`Added to “${p.name}” 📸`)
      load()
    } catch (e) {
      toast(e.message, false)
    }
    setBusy(null)
  }

  const uploadGallery = async (file) => {
    if (!file) return
    setGBusy(true)
    try {
      const { url, mediaType } = await uploadGalleryMedia(gCategory, file)
      const { data, error } = await supabase
        .from('gallery_items')
        .insert({ category: gCategory, media_type: mediaType, url, caption: gCaption.trim() })
        .select()
        .single()
      if (error) throw new Error(error.message)
      setGallery((g) => [data, ...g])
      setGCaption('')
      toast(`Added to Explore → ${GALLERY_CATEGORIES.find((c) => c.id === gCategory)?.name} ${mediaType === 'video' ? '🎬' : '📸'}`)
    } catch (e) {
      toast(e.message, false)
    }
    setGBusy(false)
  }

  const deleteGalleryItem = async (item) => {
    if (!confirm('Remove this from the Explore gallery?')) return
    const { error } = await supabase.from('gallery_items').delete().eq('id', item.id)
    if (error) {
      toast(`Delete failed: ${error.message}`, false)
      return
    }
    // Best-effort: also remove the file from Storage
    try {
      const path = item.url.split('/gallery-media/')[1]
      if (path) await supabase.storage.from('gallery-media').remove([decodeURIComponent(path)])
    } catch { /* row is already gone — ignore storage errors */ }
    setGallery((g) => g.filter((x) => x.id !== item.id))
    toast('Removed from gallery')
  }

  const addProduct = async () => {
    const fallbackCat = pCategory !== 'all' ? pCategory : 'gift-boxes'
    const name = window.prompt('New product name?', 'New gift box')
    if (!name || !name.trim()) return
    const base = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'product'
    const slug = `${base}-${Date.now().toString(36)}`
    setPBusy(true)
    try {
      const { error } = await supabase.from('products').insert({
        id: slug, slug, name: name.trim(), category: fallbackCat,
        price: 0, stock: 0, short: '', description: '',
      })
      if (error) throw new Error(error.message)
      setPCategory(fallbackCat)
      setPUploadSlug(slug)
      toast(`“${name.trim()}” added — set its price & photo 🎁`)
      load()
    } catch (e) {
      toast(e.message, false)
    }
    setPBusy(false)
  }

  const removeProduct = async () => {
    const slug = pUploadSlug || products[0]?.slug
    const p = products.find((x) => x.slug === slug)
    if (!p) return
    if (!window.confirm(`Delete “${p.name}” and its photos? This cannot be undone.`)) return
    setPBusy(true)
    const { error } = await supabase.from('products').delete().eq('slug', p.slug)
    setPBusy(false)
    if (error) {
      toast(`Delete failed: ${error.message}`, false)
      return
    }
    setPUploadSlug('')
    toast('Product deleted')
    load()
  }

  if (!ready) return <SetupNotice />
  if (!authReady) return <PageLoader />
  if (!user) return <LoginGate />
  if (!isOwner) return <OwnerOnlyGate />

  return (
    <section className="py-12 container-px">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <span className="script-accent text-2xl block">Store manager</span>
          <h1 className="font-serif text-4xl text-maroon-800">Photos & products</h1>
        </div>
        <span className="chip bg-white border border-gold-300 text-maroon-700">
          {source === 'supabase' ? '🟢 Live from Supabase' : '🟠 Showing static fallback'}
        </span>
      </div>

      <div className="rounded-[2rem] bg-white p-6 shadow-soft mb-8">
        <h2 className="font-serif text-2xl text-maroon-800">Recent orders — {orders.length}</h2>
        {ordersLoading ? <p className="mt-3 text-sm text-ink/50">Loading…</p> : orders.length === 0 ? <p className="mt-3 text-sm text-ink/50">No orders yet — they will appear here the moment a customer checks out.</p> : (
          <div className="mt-4 space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="rounded-2xl bg-cream-100 text-sm overflow-hidden">
                <div onClick={() => setOpenOrder((id) => (id === o.id ? null : o.id))} className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-blush-50/60 transition">
                  <span className={`text-[10px] text-ink/40 transition-transform ${openOrder === o.id ? 'rotate-90' : ''}`}>▶</span>
                  <span className="font-extrabold text-maroon-800">{o.id.slice(0, 8).toUpperCase()}</span>
                  <span className="hidden sm:inline font-bold text-maroon-800 truncate max-w-52">{o.email}</span>
                  <span className="text-ink/50 text-xs whitespace-nowrap">{new Date(o.created_at).toLocaleDateString()} · {new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {o.status === 'cancelled' && <span className="hidden md:inline rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-extrabold text-red-700 whitespace-nowrap">🚫 Cancelled</span>}
                  <span className="ml-auto font-bold whitespace-nowrap">{o.totals?.total != null ? formatPrice(o.totals.total) : ''}</span>
                  <span onClick={(e) => e.stopPropagation()} className="flex items-center">
                    <select value={o.status} onChange={async (e) => {
                      const newStatus = e.target.value
                      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', o.id)
                      if (error) { setMsg({ text: error.message, ok: false }); return }
                      setOrders((prev) => prev.map((x) => x.id === o.id ? { ...x, status: newStatus } : x))
                      setMsg({ text: `Status → ${newStatus}`, ok: true }); setTimeout(()=>setMsg(null),2000)
                    }} className="rounded-full border border-blush-300 bg-white px-2 py-1 text-xs font-bold text-maroon-800">
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="shipping">Shipping</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </span>
                </div>
                {openOrder === o.id && (
                <div className="border-t border-blush-200 px-4 py-3">
                <p className="font-bold text-maroon-800">{o.email} · {new Date(o.created_at).toLocaleString()}</p>
                {o.status === 'cancelled' && (
                  <p className="mt-2 inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-extrabold text-red-700">🚫 Cancelled by customer</p>
                )}
                <p className="text-ink/60 mt-1">{(o.items || []).map((i) => `${i.name} ×${i.qty}`).join(', ')}</p>
                {o.customer && <p className="text-ink/50 mt-1">{o.customer.firstName} {o.customer.lastName} · {o.customer.address}, {o.customer.city} · {o.customer.phone}</p>}
                {o.totals?.paymentMethod && (
                  <p className="mt-1 text-sm font-bold text-maroon-800">
                    {o.totals.paymentMethod === 'upi' ? `📱 UPI · UTR ${o.totals.utr || '—'} · Ref ${o.totals.paymentRef || '—'}` : '💵 Cash on Delivery'}
                    {o.totals?.couponCode && <span className="ml-2 rounded-full bg-gold-100 px-2 py-0.5 text-[10px] font-extrabold">🎟️ {o.totals.couponCode}</span>}
                  </p>
                )}
                {o.gift_note && <p className="italic text-maroon-700 mt-1">“{o.gift_note}”</p>}
                <div className="flex flex-wrap gap-2 mt-3">
                  {o.totals?.paymentMethod === 'upi' && o.status === 'pending' && (
                    <button onClick={async () => {
                      const { error } = await supabase.from('orders').update({ status: 'confirmed' }).eq('id', o.id)
                      if (error) { setMsg({ text: error.message, ok: false }); return }
                      setOrders((prev) => prev.map((x) => x.id === o.id ? { ...x, status: 'confirmed' } : x))
                      setMsg({ text: 'Payment verified — order confirmed ✅', ok: true }); setTimeout(()=>setMsg(null),3000)
                    }} className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700">✅ Verify payment</button>
                  )}
                  <button onClick={() => {
                  const c = o.customer || {}
                  const itemsRows = (o.items||[]).map((it, idx) => `<tr><td style="padding:8px;border:1px solid #eee">${idx+1}</td><td style="padding:8px;border:1px solid #eee">${it.name}${it.variant?` <span style="color:#888">(${it.variant})</span>`:''}</td><td style="padding:8px;border:1px solid #eee;text-align:center">${it.qty}</td><td style="padding:8px;border:1px solid #eee;text-align:right">${formatPrice(it.price)}</td><td style="padding:8px;border:1px solid #eee;text-align:right">${formatPrice(it.price*it.qty)}</td></tr>`).join('')
                  const w = window.open('', '_blank')
                  w.document.write(`<html><head><title>Order ${o.id.slice(0,8)}</title><style>body{font-family:system-ui,sans-serif;padding:32px;color:#333;max-width:800px;margin:auto}h1{color:#4a1a2e;margin-bottom:4px}p{margin:4px 0;font-size:14px}table{width:100%;border-collapse:collapse;margin-top:12px}th{background:#fdf2f8;padding:8px;border:1px solid #eee;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:0.05em}td{font-size:14px}.box{border:1px solid #eee;border-radius:12px;padding:16px;margin:12px 0;background:#fffafb}.label{font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#888;font-weight:700}.total{font-size:18px;font-weight:800;color:#4a1a2e}</style></head><body>
                    <div style="text-align:center;border-bottom:2px solid #4a1a2e;padding-bottom:12px;margin-bottom:16px"><h1 style="margin:0">🎀 Memories Lane</h1><p style="color:#888">Every box tells a story</p></div>
                    <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:16px"><div><p class="label">Order ID</p><p><b>${o.id.slice(0,8).toUpperCase()} — ${o.id}</b></p><p class="label" style="margin-top:8px">Order Date</p><p>${new Date(o.created_at).toLocaleString()}</p><p class="label" style="margin-top:8px">Status</p><p><span style="background:#dcfce7;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:700">${o.status}</span></p></div><div style="text-align:right"><p class="label">Customer Email</p><p>${o.email}</p><p class="label" style="margin-top:8px">Payment</p><p>${o.totals?.paymentMethod === 'upi' ? `UPI · UTR ${o.totals?.utr || '-'} · Ref ${o.totals?.paymentRef || '-'}` : 'Cash on Delivery'}${o.totals?.couponCode ? ` · Code ${o.totals.couponCode}` : ''}</p><p class="label" style="margin-top:8px">Delivery Date</p><p>${o.delivery_date ? new Date(o.delivery_date+'T00:00:00').toLocaleDateString() : '3–5 days (standard)'}</p></div></div>
                    <div class="box"><p class="label">Customer Details</p><p><b>${c.firstName||''} ${c.lastName||''}</b></p><p>📞 ${c.phone||'-'}</p><p>✉️ ${c.email||o.email}</p></div>
                    <div class="box"><p class="label">Shipping Address</p><p>${c.address||'-'}</p><p>${c.city||''} ${c.state||''} ${c.zip||''}</p><p>${c.country||''}</p></div>
                    <table><thead><tr><th>#</th><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>${itemsRows || '<tr><td colspan=5 style="padding:12px;text-align:center;color:#888">No items</td></tr>'}</tbody></table>
                    <div style="margin-top:16px;text-align:right"><p>Subtotal: ${o.totals?.subtotal!=null?formatPrice(o.totals.subtotal):'-'}</p>${o.totals?.discount?`<p>Discount: -${formatPrice(o.totals.discount)}</p>`:''}<p>Shipping: ${o.totals?.shipping===0?'Free':o.totals?.shipping!=null?formatPrice(o.totals.shipping):'-'}</p>${o.gift_wrap?`<p>Gift wrap: ${o.totals?.wrapFee!=null?formatPrice(o.totals.wrapFee):formatPrice(4.5)}</p>`:''}<p class="total">Total: ${o.totals?.total!=null?formatPrice(o.totals.total):''}</p></div>
                    ${o.gift_note?`<div class="box"><p class="label">Gift Note</p><p style="font-style:italic">“${o.gift_note}”</p></div>`:''}
                    <p style="margin-top:24px;text-align:center;color:#888;font-size:12px">Thank you for shopping with Memories Lane • Printed on ${new Date().toLocaleString()}</p>
                  </body></html>`)
                  w.document.close(); w.focus(); w.print()
                }} className="rounded-full border border-blush-200 bg-white px-4 py-1.5 text-xs font-bold text-maroon-800 hover:border-gold-400">🖨️ Print</button>
                  <button onClick={async () => {
                    if (!confirm('Delete this order? This cannot be undone.')) return
                    const { error } = await supabase.from('orders').delete().eq('id', o.id)
                    if (error) { setMsg({ text: error.message, ok: false }); return }
                    setOrders((prev) => prev.filter((x) => x.id !== o.id))
                    setMsg({ text: 'Order deleted', ok: true }); setTimeout(()=>setMsg(null),3000)
                  }} className="rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100">🗑️ Delete</button>
                </div>
                </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ------------------------------------------------ OCCASION THEME */}
      <div className="rounded-[2rem] bg-white p-6 shadow-soft mb-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="script-accent text-2xl block">Dress up the store</span>
            <h2 className="font-serif text-2xl text-maroon-800">Occasion theme</h2>
            <p className="text-sm text-ink/60 mt-1">Applies instantly site-wide — announcement bar, hero & falling decor.</p>
          </div>
          {tDraft && (
            <button
              onClick={async () => {
                setTBusy(true)
                try {
                  const payload = {
                    id: 1,
                    theme: tVal('theme'),
                    banner_text: (tVal('banner_text') || '').trim(),
                    banner_enabled: tVal('banner_enabled') ?? true,
                    starts_at: tVal('starts_at') || null,
                    ends_at: tVal('ends_at') || null,
                    updated_at: new Date().toISOString(),
                  }
                  const { error } = await supabase.from('site_settings').upsert(payload)
                  if (error) throw new Error(error.message)
                  setThemeSettings({ ...themeSettings, ...payload })
                  setTDraft(null)
                  toast(`Theme → ${FESTIVE_THEMES[payload.theme]?.name ?? payload.theme} ✨ Live now!`)
                } catch (e) {
                  toast(e.message, false)
                }
                setTBusy(false)
              }}
              disabled={tBusy}
              className="btn-gold !px-6 !py-2.5 text-sm disabled:opacity-40"
            >
              {tBusy ? 'Publishing…' : '✨ Publish theme'}
            </button>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-5 gap-3">
          {THEME_IDS.map((id) => {
            const t = FESTIVE_THEMES[id]
            const active = tVal('theme') === id
            return (
              <button
                key={id}
                onClick={() => setTDraft((d) => ({ ...(d ?? themeSettings), theme: id }))}
                className={`rounded-2xl border-2 p-4 text-center transition ${active ? 'border-gold-500 bg-blush-50 shadow-gold' : 'border-blush-200 bg-cream-50 hover:border-gold-400'}`}
              >
                <span className="block text-3xl">{t.emoji}</span>
                <p className="mt-1 text-sm font-extrabold text-maroon-800">{t.name}</p>
              </button>
            )
          })}
        </div>

        {/* Live preview of the announcement bar */}
        <div className={`mt-4 rounded-2xl text-center text-sm font-bold py-2.5 px-4 ${FESTIVE_THEMES[tVal('theme')]?.bar ?? 'bg-maroon-700 text-cream-100'}`}>
          {(tVal('banner_text') || '').trim() || FESTIVE_THEMES[tVal('theme')]?.banner}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <label className="label !text-xs">Banner text (blank = theme default)</label>
            <input
              value={tVal('banner_text') ?? ''}
              onChange={(e) => setTDraft((d) => ({ ...(d ?? themeSettings), banner_text: e.target.value }))}
              placeholder="e.g. 💘 Valentine week — 10% off first orders (auto-issued at signup)"
              className="input !py-2 !text-sm"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer pb-2">
            <input
              type="checkbox"
              checked={tVal('banner_enabled') ?? true}
              onChange={(e) => setTDraft((d) => ({ ...(d ?? themeSettings), banner_enabled: e.target.checked }))}
              className="h-5 w-5 accent-gold-500"
            />
            <span className="text-sm font-bold text-maroon-800">Show banner</span>
          </label>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label !text-xs">Auto-start (optional)</label>
            <input
              type="date"
              value={tVal('starts_at') ? new Date(tVal('starts_at')).toISOString().split('T')[0] : ''}
              onChange={(e) => setTDraft((d) => ({ ...(d ?? themeSettings), starts_at: e.target.value ? new Date(e.target.value + 'T00:00:00').toISOString() : null }))}
              className="input !py-2 !text-sm"
            />
          </div>
          <div>
            <label className="label !text-xs">Auto-stop (optional)</label>
            <input
              type="date"
              value={tVal('ends_at') ? new Date(tVal('ends_at')).toISOString().split('T')[0] : ''}
              onChange={(e) => setTDraft((d) => ({ ...(d ?? themeSettings), ends_at: e.target.value ? new Date(e.target.value + 'T23:59:59').toISOString() : null }))}
              className="input !py-2 !text-sm"
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-ink/50">Set dates for e.g. Valentine week — the theme turns itself on & off. Leave blank for manual control.</p>
      </div>

      {/* ------------------------------------------------ EXPLORE GALLERY */}
      <div className="rounded-[2rem] bg-white p-6 shadow-soft mb-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="script-accent text-2xl block">Show off your work</span>
            <h2 className="font-serif text-2xl text-maroon-800">Explore gallery — {gallery.length}</h2>
            <p className="text-sm text-ink/60 mt-1">Uploads appear instantly on the <span className="font-bold">/explore</span> page.</p>
          </div>
          <Link to="/explore" className="btn-ghost text-sm">View page →</Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-[180px_1fr_auto] sm:items-end rounded-2xl bg-cream-100 p-4">
          <div>
            <label className="label !text-xs">Category</label>
            <select value={gCategory} onChange={(e) => setGCategory(e.target.value)} className="input !py-2 !text-sm">
              {GALLERY_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label !text-xs">Caption (optional)</label>
            <input
              value={gCaption}
              onChange={(e) => setGCaption(e.target.value)}
              placeholder="e.g. Blush mini bouquet for Aisha 💐"
              className="input !py-2 !text-sm"
            />
          </div>
          <label className={`btn-gold !px-6 !py-2.5 text-sm text-center cursor-pointer ${gBusy ? 'opacity-50 pointer-events-none' : ''}`}>
            {gBusy ? 'Uploading…' : '📤 Upload photo / video'}
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) uploadGallery(f)
                e.target.value = ''
              }}
            />
          </label>
        </div>
        <p className="mt-2 text-xs text-ink/50">Accepts images & videos (keep videos under ~50MB for fast loading).</p>

        {galleryLoading ? (
          <p className="mt-4 text-sm text-ink/50">Loading gallery…</p>
        ) : gallery.length === 0 ? (
          <p className="mt-4 text-sm text-ink/50">No gallery posts yet — upload your first one above ✨</p>
        ) : (
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {gallery.map((g) => (
              <div key={g.id} className="relative group rounded-2xl overflow-hidden border border-blush-200 bg-cream-100">
                {g.media_type === 'video' ? (
                  <video src={g.url} muted playsInline preload="metadata" className="h-36 w-full object-cover" />
                ) : (
                  <img src={g.url} alt={g.caption} className="h-36 w-full object-cover" />
                )}
                <span className="absolute top-2 left-2 rounded-full bg-maroon-900/70 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-cream-100">
                  {g.media_type === 'video' ? '🎬 ' : ''}{GALLERY_CATEGORIES.find((c) => c.id === g.category)?.name ?? g.category}
                </span>
                <button
                  onClick={() => deleteGalleryItem(g)}
                  className="absolute top-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-maroon-600 text-cream-100 text-xs opacity-0 group-hover:opacity-100 hover:bg-maroon-700 transition"
                  title="Remove"
                >
                  ✕
                </button>
                {g.caption && <p className="px-2.5 py-1.5 text-xs font-bold text-maroon-800 truncate">{g.caption}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {msg && (
        <div className={`mb-6 rounded-2xl px-5 py-3 text-sm font-bold ${msg.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
          {msg.text}
        </div>
      )}

      {source !== 'supabase' && (
        <div className="mb-6 rounded-2xl bg-gold-300/40 border border-gold-500 px-5 py-3 text-sm font-bold text-maroon-800">
          ⚠️ Showing the built-in catalogue. Uploads below will only stick once the DB is connected.
        </div>
      )}

      <div className="rounded-[2rem] bg-white p-6 shadow-soft mb-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="script-accent text-2xl block">Fresh shots</span>
            <h2 className="font-serif text-2xl text-maroon-800">Product photos — {products.length}</h2>
            <p className="text-sm text-ink/60 mt-1">Pick a product, upload — it appears on its card below and across the shop.</p>
          </div>
        </div>
        <div className="mt-5 space-y-3 rounded-2xl bg-cream-100 p-4">
        <div className="grid gap-3 sm:grid-cols-[170px_1fr_110px_110px] sm:items-end">
          <div>
            <label className="label !text-xs">Category</label>
            <select
              value={pCategory}
              onChange={(e) => {
                const c = e.target.value
                setPCategory(c)
                const list = c === 'all' ? products : products.filter((x) => x.category === c)
                if (!list.some((x) => x.slug === (pUploadSlug || products[0]?.slug))) setPUploadSlug(list[0]?.slug || '')
              }}
              className="input !py-2 !text-sm"
            >
              <option value="all">✨ All products</option>
              {[...new Set(products.map((p) => p.category))].map((c) => (
                <option key={c} value={c}>{c.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label !text-xs">Product</label>
            <div className="flex gap-2">
              <select value={pUploadSlug || products[0]?.slug || ''} onChange={(e) => setPUploadSlug(e.target.value)} className="input !py-2 !text-sm flex-1">
                {(pCategory === 'all' ? products : products.filter((x) => x.category === pCategory)).map((p) => (
                  <option key={p.slug} value={p.slug}>{p.name}</option>
                ))}
              </select>
              <button onClick={addProduct} title="Add product" className="shrink-0 rounded-xl bg-maroon-700 px-3.5 text-lg font-extrabold text-cream-100 hover:bg-maroon-600 transition">＋</button>
              <button onClick={removeProduct} title="Remove product" className="shrink-0 rounded-xl border-2 border-red-200 bg-white px-3 text-base font-bold text-red-600 hover:bg-red-50 transition">🗑️</button>
            </div>
          </div>
          <div>
            <label className="label !text-xs">Price $</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={(() => { const s = pUploadSlug || products[0]?.slug; const p = products.find((x) => x.slug === s); return draft(s, 'price') ?? p?.price ?? '' })()}
              onChange={(e) => setDraft(pUploadSlug || products[0]?.slug, 'price', e.target.value)}
              className="input !py-2 !text-sm"
            />
            <p className="mt-1 text-xs font-extrabold text-maroon-700">
              ≈ {(() => {
                const s = pUploadSlug || products[0]?.slug
                const p = products.find((x) => x.slug === s)
                const v = Number(draft(s, 'price') ?? p?.price ?? 0)
                return Number.isFinite(v) ? `₹${Math.round(v * 83.5).toLocaleString('en-IN')}` : '—'
              })()}
            </p>
          </div>
          <div>
            <label className="label !text-xs">Stock</label>
            <input
              type="number"
              min="0"
              step="1"
              value={(() => { const s = pUploadSlug || products[0]?.slug; const p = products.find((x) => x.slug === s); return draft(s, 'stock') ?? p?.stock ?? '' })()}
              onChange={(e) => setDraft(pUploadSlug || products[0]?.slug, 'stock', e.target.value)}
              className="input !py-2 !text-sm"
            />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr] sm:items-end">
          <div>
            <label className="label !text-xs">Product name (edit)</label>
            <input
              value={(() => { const s = pUploadSlug || products[0]?.slug; const p = products.find((x) => x.slug === s); return draft(s, 'name') ?? p?.name ?? '' })()}
              onChange={(e) => setDraft(pUploadSlug || products[0]?.slug, 'name', e.target.value)}
              placeholder="e.g. Birthday gift box"
              className="input !py-2 !text-sm"
            />
          </div>
          <div>
            <label className="label !text-xs">Caption (optional)</label>
            <input
              value={pCaption}
              onChange={(e) => setPCaption(e.target.value)}
              placeholder="e.g. Blush box with silk ribbon 🎀"
              className="input !py-2 !text-sm"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => { const p = products.find((x) => x.slug === (pUploadSlug || products[0]?.slug)); if (p) saveProduct(p) }}
            disabled={(() => {
              const s = pUploadSlug || products[0]?.slug
              const p = products.find((x) => x.slug === s)
              if (!p || busy === p.id) return true
              const d = drafts[s]
              if (!d) return true
              const nameChanged = d.name != null && d.name !== p.name
              const priceChanged = d.price != null && d.price !== '' && Number(d.price) !== Number(p.price)
              const stockChanged = d.stock != null && d.stock !== '' && Number(d.stock) !== Number(p.stock)
              return !(nameChanged || priceChanged || stockChanged)
            })()}
            className="btn-outline !px-5 !py-2.5 text-sm whitespace-nowrap disabled:opacity-40"
          >
            {(() => { const s = pUploadSlug || products[0]?.slug; const p = products.find((x) => x.slug === s); return busy === p?.id ? 'Saving…' : '💾 Save changes' })()}
          </button>
          <label className={`btn-gold !px-6 !py-2.5 text-sm text-center cursor-pointer whitespace-nowrap ${pBusy ? 'opacity-50 pointer-events-none' : ''}`}>
            {pBusy ? 'Uploading…' : '📷 Upload photo'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0]
                e.target.value = ''
                if (!f) return
                const p = products.find((x) => x.slug === (pUploadSlug || products[0]?.slug))
                if (!p) return
                setPBusy(true)
                await uploadPhoto(p, f, pCaption)
                setPBusy(false)
                setPCaption('')
              }}
            />
          </label>
        </div>
        </div>
        <p className="mt-2 text-xs text-ink/50">Photos appear across the shop instantly after upload.</p>
      </div>

      {(() => {
        const s = pUploadSlug || products[0]?.slug
        const p = products.find((x) => x.slug === s)
        const shots = p?.images || []
        if (!p || shots.length === 0) return null
        return (
          <div className="mt-4 rounded-[2rem] bg-white p-5 shadow-soft">
            <p className="text-sm font-extrabold text-maroon-800">Preview — {p.name} <span className="text-ink/40 font-bold">({shots.length})</span></p>
            <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-3">
              {shots.map((img, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-blush-200 bg-cream-100">
                  <img src={img.src} alt={img.alt || p.name} className="h-28 w-full object-cover" loading="lazy" />
                  {(img.alt || p.name) && <p className="px-2 py-1 text-[11px] font-bold text-maroon-800 truncate">{img.alt || p.name}</p>}
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      <div className="mt-8 rounded-2xl bg-blush-50 border border-blush-200 px-5 py-4 text-sm text-ink/70">
        💡 Photos are stored in the <code className="font-bold">product-images</code> bucket and served from the Supabase CDN.
        Refresh the storefront after uploading — product cards, detail pages and the cart all update automatically.
      </div>
    </section>
  )
}