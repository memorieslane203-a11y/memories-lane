import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useCart } from '../../store/cartStore'
import { useWishlist } from '../../store/wishlistStore'
import { useUI } from '../../store/uiStore'
import { useAuth } from '../../store/authStore'
import { useTheme, selectPreset, selectBanner } from '../../store/themeStore'
import { ADMIN_EMAIL } from '../../lib/supabase'
import CartDrawer from '../ui/CartDrawer'

const links = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/build-your-hamper', label: 'Build a Hamper' },
  { to: '/frames-bouquets', label: 'Frames / Bouquet' },
  { to: '/explore', label: 'Explore' },
]

export function Logo({ className = '' }) {
  return (
    <Link to="/" className={`group flex items-center gap-2.5 ${className}`}>
      <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-gold-sheen text-lg shadow-gold">
        🎀
        <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-blush-300" />
      </span>
      <span className="leading-none">
        <span className="block font-script text-2xl text-maroon-700">Memories</span>
        <span className="block font-serif text-[11px] tracking-[0.35em] uppercase text-gold-600">Lane</span>
      </span>
    </Link>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const cartCount = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0))
  const toggleCart = useUI((s) => s.toggleCart)
  const wishCount = useWishlist((s) => s.items.length)
  const user = useAuth((s) => s.user)
  const signOut = useAuth((s) => s.signOut)
  const authReady = useAuth((s) => s.initialized)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setUserOpen(false)
  }, [location.pathname])

  const initial = (user?.email ?? '?').charAt(0).toUpperCase()
  const isOwner = !!user && ADMIN_EMAIL !== '' && user.email?.toLowerCase() === ADMIN_EMAIL
  const themeSettings = useTheme((s) => s.settings)
  const preset = selectPreset(themeSettings)
  const banner = selectBanner(themeSettings)

  return (
    <>
      {/* Announcement bar — occasion themed from /admin */}
      {banner && (
        <div className={`${preset.bar} text-center text-xs sm:text-sm font-bold py-2 px-4`}>
          {banner}
        </div>
      )}

      <header
        className={`sticky top-0 z-50 bg-cream-50/85 backdrop-blur-lg border-b border-blush-200 transition-shadow ${
          scrolled ? 'shadow-soft' : ''
        }`}
      >
        <nav className="container-px flex items-center justify-between gap-4 py-3.5">
          <Logo />

          {/* Desktop links */}
          <ul className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.to === '/'}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                      isActive ? 'bg-blush-100 text-maroon-700' : 'text-ink/70 hover:text-maroon-700'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Icons */}
          <div className="flex items-center gap-1">
            {authReady && !user && (
              <Link to="/login" className="btn-gold !px-4 !py-2 text-sm hidden sm:inline-flex">Sign in</Link>
            )}
            {authReady && user && (
              <div className="relative">
                <button
                  onClick={() => setUserOpen((o) => !o)}
                  aria-label="Account menu"
                  className="grid h-10 w-10 place-items-center rounded-full bg-maroon-700 text-cream-100 font-serif font-bold hover:bg-maroon-600 transition"
                >
                  {initial}
                </button>
                <AnimatePresence>
                  {userOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 top-12 w-56 rounded-2xl bg-white p-2 shadow-lift border border-blush-200"
                    >
                      <p className="px-3 py-2 text-sm font-bold text-maroon-800 truncate">{user.email}</p>
                      {isOwner && <Link to="/admin" className="block rounded-xl px-3 py-2 text-sm font-bold text-ink/70 hover:bg-blush-50 hover:text-maroon-700">🛠️ Manage shop (admin)</Link>}
                      <Link to="/account" className="block rounded-xl px-3 py-2 text-sm font-bold text-ink/70 hover:bg-blush-50 hover:text-maroon-700">👤 My account</Link>
                      <button
                        onClick={async () => { await signOut(); navigate('/') }}
                        className="block w-full rounded-xl px-3 py-2 text-left text-sm font-bold text-blush-600 hover:bg-blush-50"
                      >
                        ↩️ Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            <Link to="/account" aria-label="Account" className="btn-ghost !px-3 hidden sm:inline-flex">
              <span className="text-lg">👤</span>
            </Link>
            <Link to="/account?tab=wishlist" aria-label="Wishlist" className="btn-ghost !px-3 hidden sm:inline-flex relative">
              <span className="text-lg">🤍</span>
              {wishCount > 0 && (
                <span className="absolute top-1 right-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-blush-500 text-[10px] font-extrabold text-white px-1">
                  {wishCount}
                </span>
              )}
            </Link>
            <button onClick={toggleCart} aria-label="Open cart" className="btn-ghost !px-3 relative">
              <span className="text-lg">🛍️</span>
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-gold-500 text-[10px] font-extrabold text-maroon-800 px-1">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
              className="btn-ghost !px-3 lg:hidden"
            >
              <span className="text-xl">{mobileOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden lg:hidden border-t border-blush-200 bg-cream-50"
            >
              <ul className="px-6 py-4 space-y-1">
                {links.map((l) => (
                  <li key={l.to}>
                    <NavLink
                      to={l.to}
                      end={l.to === '/'}
                      className={({ isActive }) =>
                        `block px-4 py-3 rounded-2xl font-bold ${
                          isActive ? 'bg-blush-100 text-maroon-700' : 'text-ink/80'
                        }`
                      }
                    >
                      {l.label}
                    </NavLink>
                  </li>
                ))}
                <li className="flex gap-2 pt-2">
                  {authReady && !user && <Link to="/login" className="btn-gold flex-1 text-sm">Sign in</Link>}
                  {authReady && user && (
                    <button onClick={async () => { await signOut(); navigate('/') }} className="btn-outline flex-1 text-sm">↩️ Sign out</button>
                  )}
                  <Link to="/account" className="btn-outline flex-1 text-sm">👤 Account</Link>
                  <Link to="/account?tab=wishlist" className="btn-ghost flex-1 text-sm">🤍 Wishlist</Link>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}
