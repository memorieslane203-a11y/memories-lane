import { Link } from 'react-router-dom'
import { Logo } from './Navbar'
import { useState } from 'react'
import { useUI } from '../../store/uiStore'
import { useCurrency } from '../../store/currencyStore'

const shopLinks = [
  { to: '/shop/gift-boxes', label: 'Surprise Gift Boxes' },
  { to: '/shop/hampers', label: 'Gift Hampers' },
  { to: '/shop/magazines', label: 'Magazines' },
  { to: '/build-your-hamper', label: 'Build Your Own Hamper' },
  { to: '/frames-bouquets', label: 'Frames / Bouquet' },
]

const companyLinks = [
  { to: '/explore', label: 'Explore Gallery' },
  { to: '/contact', label: 'Contact' },
  { to: '/faq', label: 'FAQ' },
  { to: '/track-order', label: 'Track Your Order' },
  { to: '/admin', label: 'Admin · Photos' },
]

export default function Footer() {
  const pushToast = useUI((s) => s.pushToast)
  const [email, setEmail] = useState('')
  const currency = useCurrency((s) => s.code)
  const setCurrency = useCurrency((s) => s.setCurrency)

  const subscribe = async (e) => {
    e.preventDefault()
    try {
      const { claimWelcomeCode } = await import('../../lib/welcomeCoupon')
      const res = await claimWelcomeCode(email)
      pushToast(res.reused ? `Already claimed — your code is ${res.code} 🎟️` : `Welcome! Your 10% code: ${res.code} 🎉 — sign in with this email at checkout`, 'success')
      setEmail('')
    } catch (err) {
      pushToast(err.message, 'error')
    }
  }

  return (
    <footer className="mt-24 bg-maroon-800 text-cream-100">
      {/* Newsletter band */}
      <div className="border-b border-cream-100/10">
        <div className="container-px py-14 grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="script-accent text-3xl">Unbox a Memory</span>
            <h3 className="mt-1 font-serif text-3xl text-cream-100">Join the lane — 10% off your first gift</h3>
            <p className="mt-2 text-cream-100/70 text-sm">
              Monthly stories, early access to limited boxes, and a welcome treat in your inbox.
            </p>
          </div>
          <form onSubmit={subscribe} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input !bg-white/10 !border-white/20 !text-cream-100 placeholder:!text-cream-100/50 flex-1"
            />
            <button type="submit" className="btn-gold">Subscribe</button>
          </form>
        </div>
      </div>

      <div className="container-px py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-4 text-sm text-cream-100/70 max-w-sm">
            Curated surprise gift boxes, magazines and gift hampers —
            wrapped with care and delivered to the door. Every box tells a story.
          </p>
          <div className="mt-5 flex gap-2">
            {['Instagram', 'Pinterest', 'TikTok', 'YouTube'].map((s) => (
              <a
                key={s}
                href="#"
                onClick={(e) => e.preventDefault()}
                className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold hover:bg-gold-500 hover:text-maroon-800 transition-colors"
              >
                {s}
              </a>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-3">
            <label className="text-xs font-bold text-cream-100/70">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-cream-100 focus:outline-none"
            >
              <option className="text-maroon-800" value="INR">INR ₹</option>
              <option className="text-maroon-800" value="USD">USD $</option>
              <option className="text-maroon-800" value="EUR">EUR €</option>
              <option className="text-maroon-800" value="GBP">GBP £</option>
            </select>
            <select className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-cream-100 focus:outline-none">
              <option className="text-maroon-800">English</option>
              <option className="text-maroon-800">Español</option>
              <option className="text-maroon-800">हिन्दी</option>
            </select>
          </div>
        </div>

        <div>
          <h4 className="font-serif text-lg mb-4 text-gold-400">Shop</h4>
          <ul className="space-y-2.5 text-sm text-cream-100/75">
            {shopLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-gold-400 transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-lg mb-4 text-gold-400">Support</h4>
          <ul className="space-y-2.5 text-sm text-cream-100/75">
            {companyLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-gold-400 transition-colors">{l.label}</Link>
              </li>
            ))}
            <li>
              <a href="mailto:hello@memorieslane.example" className="hover:text-gold-400 transition-colors">
                hello@memorieslane.example
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream-100/10">
        <div className="container-px py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-cream-100/60">
          <p>© {new Date().getFullYear()} Memories Lane. Made with ♥ and lots of ribbon.</p>
          <div className="flex items-center gap-2">
            {['VISA', 'MC', 'AMEX', 'UPI', 'PayPal'].map((p) => (
              <span key={p} className="rounded-md bg-white/10 px-2.5 py-1 font-extrabold tracking-wider">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
