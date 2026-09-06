import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Price, { formatPrice } from '../components/ui/Price'
import ProductCard from '../components/ui/ProductCard'
import Quantity from '../components/ui/Quantity'
import Reveal from '../components/ui/Reveal'
import ProductTilt from '../components/ui/ProductTilt'
import ThreeD from '../components/three/ThreeD'
import GiftBox3D from '../components/three/GiftBox3D'
import { themes, relatedFrom } from '../data/products'
import { useProducts } from '../store/productStore'
import { useCart } from '../store/cartStore'
import { useWishlist } from '../store/wishlistStore'
import { useUI } from '../store/uiStore'

function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-blush-200">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between py-4 text-left">
        <span className="font-serif text-xl text-maroon-800">{title}</span>
        <span className={`text-gold-600 transition-transform ${open ? 'rotate-45' : ''}`}>＋</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const products = useProducts((s) => s.products)
  const product = products.find((p) => p.slug === slug)
  const addItem = useCart((s) => s.addItem)
  const pushToast = useUI((s) => s.pushToast)
  const wishlist = useWishlist((s) => s)

  const [activeImage, setActiveImage] = useState(0)
  const [view3D, setView3D] = useState(false)
  const [qty, setQty] = useState(1)
  const [theme, setTheme] = useState(product?.theme ?? themes[0].slug)
  const [notifyEmail, setNotifyEmail] = useState('')
  const isMagazine = product?.category === 'magazines'
  const MINI = [
    { pages: 8, price: 199 },
    { pages: 12, price: 299 },
    { pages: 16, price: 359 },
    { pages: 20, price: 459 },
    { pages: 32, price: 659 },
  ]
  const A4 = [
    { pages: 8, price: 249 },
    { pages: 12, price: 399 },
    { pages: 16, price: 459 },
    { pages: 20, price: 599 },
    { pages: 32, price: 799 },
  ]
  const [magChoice, setMagChoice] = useState(null)
  const effectivePrice = isMagazine && magChoice ? magChoice.price / 83.5 : product.price
  const effectiveCompareAt = isMagazine && magChoice ? null : product.compareAt

  if (!product) {
    return (
      <div className="py-24 text-center container-px">
        <p className="text-6xl mb-4">🔍</p>
        <h1 className="font-serif text-3xl text-maroon-800">Gift not found</h1>
        <p className="mt-2 text-ink/60">That box may have been wrapped and shipped already.</p>
        <button onClick={() => navigate('/shop')} className="btn-gold mt-6">Back to the shop</button>
      </div>
    )
  }

  const wished = wishlist.isWishlisted(product.slug)

  const addToCart = () => {
    if (isMagazine && !magChoice) {
      pushToast('Please select Mini or A4 page count', 'info')
      return
    }
    const variant = isMagazine && magChoice
      ? `${magChoice.label} — ${magChoice.pages} Pages`
      : theme ? themes.find((t) => t.slug === theme)?.name : undefined
    const price = effectivePrice
    const name = isMagazine && magChoice ? `${product.name} — ${magChoice.label} ${magChoice.pages}P` : product.name
    addItem({
      productId: isMagazine && magChoice ? `${product.id}-${magChoice.label}-${magChoice.pages}` : product.id,
      slug: product.slug,
      name,
      image: product.images?.[0]?.src,
      price,
      variant,
    }, qty)
    pushToast(`${name} added to cart 🎁`)
  }

  const notifyMe = (e) => {
    e.preventDefault()
    wishlist.notifyMe(product.slug, notifyEmail)
    pushToast('We’ll email you the moment it’s back 💌')
    setNotifyEmail('')
  }

  const related = relatedFrom(products, product)

  return (
    <>
      <div className="py-10 container-px">
        {/* Breadcrumbs */}
        <nav className="text-sm text-ink/50 mb-6 flex items-center gap-2 flex-wrap">
          <Link to="/" className="hover:text-maroon-700">Home</Link>
          <span>/</span>
          <Link to={`/shop/${product.category}`} className="hover:text-maroon-700 capitalize">{product.category.replace('-', ' ')}</Link>
          <span>/</span>
          <span className="text-maroon-700 font-bold">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Viewer */}
          <div>
            <div className="relative">
              <div className="absolute top-4 left-4 z-10 flex gap-2">
                {product.badge && (
                  <span className="rounded-full bg-gold-500 text-maroon-800 text-xs font-extrabold px-3 py-1.5 shadow-gold">{product.badge}</span>
                )}
                {product.stock < 10 && product.stock > 0 && (
                  <span className="rounded-full bg-maroon-600 text-cream-100 text-xs font-extrabold px-3 py-1.5">Only {product.stock} left</span>
                )}
              </div>

              <AnimatePresence mode="wait">
                {view3D ? (
                  <motion.div key="3d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-[420px] sm:h-[500px] rounded-[2rem] overflow-hidden bg-gradient-to-br from-blush-100 to-cream-200">
                    <ThreeD
                      fallback={
                        <div className="grid h-full place-items-center">
                          <img src={product.images[activeImage].src} alt={product.name} className="h-72 w-72 object-cover rounded-3xl shadow-lift" />
                        </div>
                      }
                      children={<GiftBox3D className="h-full w-full" />}
                    />
                  </motion.div>
                ) : (
                  <motion.div key="img" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ProductTilt max={7} className="rounded-[2rem] overflow-hidden shadow-lift">
                      <img src={product.images[activeImage].src} alt={product.images[activeImage].alt} className="h-[420px] sm:h-[500px] w-full object-cover" />
                    </ProductTilt>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 3D toggle */}
              <button
                onClick={() => setView3D((v) => !v)}
                className={`absolute right-4 bottom-4 z-10 rounded-full px-5 py-2.5 text-sm font-extrabold shadow-lift transition ${view3D ? 'bg-maroon-700 text-cream-100' : 'bg-white text-maroon-700'}`}
              >
                {view3D ? '✕ Exit 3D' : '🧊 View in 3D'}
              </button>
            </div>

            {/* Thumbnails */}
            <div className="mt-4 grid grid-cols-4 gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`overflow-hidden rounded-2xl border-2 transition ${activeImage === i ? 'border-gold-500 shadow-gold' : 'border-transparent opacity-70 hover:opacity-100'}`}
                >
                  <img src={img.src} alt={img.alt} className="aspect-square w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <span className="script-accent text-2xl">Hand-wrapped for someone special</span>
            <h1 className="mt-1 font-serif text-4xl sm:text-5xl text-maroon-800">{product.name}</h1>
            <div className="mt-5 flex items-center gap-4">
              <Price price={effectivePrice} compareAt={effectiveCompareAt} className="!text-3xl" />
              {effectiveCompareAt && (
                <span className="rounded-full bg-blush-100 text-maroon-700 text-xs font-extrabold px-3 py-1">
                  Save {Math.round((1 - effectivePrice / effectiveCompareAt) * 100)}%
                </span>
              )}
            </div>
            <p className="mt-5 text-ink/70 leading-relaxed">{product.description}</p>

            {isMagazine && (
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-white p-4 shadow-soft border border-blush-200">
                  <p className="text-sm font-extrabold text-maroon-800">📖 Mini Magazine</p>
                  <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {MINI.map((r) => (
                      <button key={r.pages} onClick={() => setMagChoice({ ...r, label: 'Mini' })} className={`rounded-xl border-2 p-2 text-center ${magChoice?.pages === r.pages && magChoice?.label === 'Mini' ? 'border-gold-500 bg-blush-50' : 'border-blush-200 bg-cream-50 hover:border-gold-300'}`}>
                        <p className="text-[11px] font-extrabold text-gold-600">{r.pages}P</p>
                        <p className="text-sm font-bold text-maroon-800">₹{r.price}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-soft border border-blush-200">
                  <p className="text-sm font-extrabold text-maroon-800">📚 A4 Magazine</p>
                  <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {A4.map((r) => (
                      <button key={r.pages} onClick={() => setMagChoice({ ...r, label: 'A4' })} className={`rounded-xl border-2 p-2 text-center ${magChoice?.pages === r.pages && magChoice?.label === 'A4' ? 'border-gold-500 bg-blush-50' : 'border-blush-200 bg-cream-50 hover:border-gold-300'}`}>
                        <p className="text-[11px] font-extrabold text-gold-600">{r.pages}P</p>
                        <p className="text-sm font-bold text-maroon-800">₹{r.price}</p>
                      </button>
                    ))}
                  </div>
                </div>
                {magChoice && <p className="text-sm font-bold text-maroon-700">Selected: {magChoice.label} — {magChoice.pages} Pages — ₹{magChoice.price}/-</p>}
              </div>
            )}

            {/* Theme variant */}
            <div className="mt-7">
              <label className="label">Theme</label>
              <div className="flex flex-wrap gap-3">
                {themes.map((t) => (
                  <button
                    key={t.slug}
                    onClick={() => setTheme(t.slug)}
                    className={`flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-bold transition ${theme === t.slug ? 'border-gold-500 bg-blush-50 text-maroon-800' : 'border-blush-200 text-ink/60 hover:border-gold-400'}`}
                  >
                    <span className="h-4 w-4 rounded-full border border-blush-200" style={{ backgroundColor: t.color }} />
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Occasion chips */}
            <div className="mt-5 flex flex-wrap gap-2">
              {product.occasion.map((o) => (
                <Link key={o} to="/shop" className="chip bg-white border border-blush-200 text-maroon-700 text-xs hover:border-gold-400">
                  {o.replace('-', ' ')}
                </Link>
              ))}
            </div>

            {product.stock > 0 ? (
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Quantity value={qty} onChange={setQty} size="lg" />
                <button onClick={addToCart} className="flex-1 min-w-52 inline-flex items-center justify-center gap-2 rounded-full border-2 border-maroon-800 bg-white px-6 py-3.5 text-sm font-bold text-maroon-800 hover:border-gold-400 hover:bg-blush-50 transition">Add to Cart —</button>
                <button
                  onClick={() => {
                    const added = wishlist.toggle(product)
                    pushToast(added ? 'Added to wishlist ♥' : 'Removed from wishlist', added ? 'success' : 'info')
                  }}
                  aria-label="Toggle wishlist"
                  className={`btn !px-5 !py-4 rounded-full text-lg ${wished ? 'bg-blush-100 text-maroon-600' : 'bg-white border-2 border-blush-200 text-maroon-700'}`}
                >
                  {wished ? '♥' : '♡'}
                </button>
              </div>
            ) : (
              <form onSubmit={notifyMe} className="mt-8 rounded-3xl bg-blush-50 border border-blush-200 p-6">
                <p className="font-serif text-lg text-maroon-800">Out of stock — but not forever</p>
                <p className="text-sm text-ink/60 mt-1">Leave your email and we’ll ping you the moment this box is back.</p>
                <div className="mt-4 flex gap-3">
                  <input value={notifyEmail} onChange={(e) => setNotifyEmail(e.target.value)} type="email" required placeholder="you@example.com" className="input flex-1" />
                  <button type="submit" className="btn-gold">Notify me</button>
                </div>
              </form>
            )}

            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-soft text-sm">
                <span className="text-2xl">📅</span>
                <p className="text-ink/70">
                  <span className="font-bold text-maroon-800">Plan the delivery date</span> — schedule this gift for a birthday, anniversary or festival at checkout.
                </p>
              </div>

            {/* Accordions */}
            <div className="mt-8">
              <Accordion title="What's inside" defaultOpen>
                <ul className="space-y-2.5">
                  {product.whatInside.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="text-gold-500 mt-0.5">✦</span>
                      <span className="text-ink/75">{item}</span>
                    </li>
                  ))}
                </ul>
              </Accordion>
              <Accordion title="Delivery & gift wrap">
                <ul className="space-y-2 text-ink/70 text-sm">
                  <li>• Free shipping over ₹200</li>
                  <li>• Schedule delivery up to 12 months ahead</li>
                  <li>• Add gift wrap (+{formatPrice(4.5)}) and a handwritten note at checkout</li>
                  <li>• Dispatched in 24h, tracked door-to-door</li>
                </ul>
              </Accordion>
              <Accordion title="Returns & guarantee">
                <p className="text-ink/70 text-sm">
                  If anything arrives less than perfect, we reship or refund within 7 days — no quibbles, we promise.
                </p>
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      <section className="py-14 container-px">
        <Reveal className="text-center mb-10">
          <span className="script-accent block">Pairs beautifully with</span>
          <h2 className="section-title">You might also love</h2>
        </Reveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </>
  )
}
