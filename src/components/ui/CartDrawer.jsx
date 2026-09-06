import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useCart } from '../../store/cartStore'
import { useUI } from '../../store/uiStore'
import Quantity from './Quantity'
import Price, { formatPrice } from './Price'

export default function CartDrawer() {
  const open = useUI((s) => s.openCart)
  const toggle = useUI((s) => s.toggleCart)
  const { items, setQty, removeItem, getTotals, setGiftNote, giftNote, giftWrap, setGiftWrap } = useCart()
  const totals = getTotals()

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-maroon-900/40 backdrop-blur-sm z-[80]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggle}
          />
          <motion.aside
            className="fixed top-0 right-0 z-[85] flex h-full w-full max-w-md flex-col bg-cream-50 shadow-lift"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
          >
            <header className="flex items-center justify-between border-b border-blush-200 px-6 py-5">
              <div>
                <span className="script-accent text-xl block leading-none">Your cart</span>
                <h2 className="font-serif text-2xl text-maroon-800">Unwrapping…</h2>
              </div>
              <button onClick={toggle} aria-label="Close cart" className="rounded-full p-2 text-maroon-700 hover:bg-blush-100 transition">
                ✕
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center gap-3">
                  <span className="text-6xl animate-float">🎁</span>
                  <p className="font-serif text-xl text-maroon-800">Your cart is empty</p>
                  <p className="text-sm text-ink/60">Time to find a memory worth wrapping.</p>
                  <Link to="/shop" onClick={toggle} className="btn-gold mt-2 text-sm">Start shopping</Link>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.key}
                        layout
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                        className="flex gap-3 rounded-2xl bg-white p-3 shadow-soft"
                      >
                        <img src={item.image} alt={item.name} className="h-20 w-20 rounded-xl object-cover" />
                        <div className="flex flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <Link to={`/product/${item.slug}`} onClick={toggle} className="font-serif text-sm text-maroon-800 leading-snug">
                              {item.name}
                            </Link>
                            <button onClick={() => removeItem(item.key)} aria-label="Remove" className="text-ink/40 hover:text-maroon-600 text-sm">
                              ✕
                            </button>
                          </div>
                          {item.variant && <span className="text-xs text-ink/50">{item.variant}</span>}
                          <div className="mt-auto flex items-center justify-between pt-2">
                            <Quantity value={item.qty} onChange={(q) => setQty(item.key, q)} />
                            <Price price={item.price * item.qty} className="text-sm" />
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}

              {items.length > 0 && (
                <div className="mt-5 space-y-3 rounded-2xl bg-white p-4 shadow-soft">
                  <label className="label">Gift note (optional)</label>
                  <textarea
                    value={giftNote}
                    onChange={(e) => setGiftNote(e.target.value)}
                    rows={2}
                    maxLength={200}
                    placeholder="Add a personal message…"
                    className="input resize-none"
                  />
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={giftWrap}
                      onChange={(e) => setGiftWrap(e.target.checked)}
                      className="h-5 w-5 accent-gold-500"
                    />
                    <span className="text-sm font-bold text-maroon-800">Add gift wrap (+{formatPrice(4.5)})</span>
                  </label>
                </div>
              )}
            </div>

            {items.length > 0 && (
              <footer className="border-t border-blush-200 px-6 py-5 space-y-3 bg-white">
                <div className="flex justify-between text-sm text-ink/70">
                  <span>Subtotal</span>
                  <span>{formatPrice(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-ink/70">
                  <span>Shipping</span>
                  <span>{totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)}</span>
                </div>
                <div className="flex justify-between font-serif text-xl text-maroon-800">
                  <span>Total</span>
                  <span>{formatPrice(totals.total)}</span>
                </div>
                <Link to="/checkout" onClick={toggle} className="w-full inline-flex items-center justify-center gap-2 rounded-full border-2 border-maroon-800 bg-white px-5 py-3.5 text-sm font-bold text-maroon-800 hover:border-gold-400 hover:bg-blush-50 transition text-center">
                  Proceed to Checkout →
                </Link>
                <Link to="/cart" onClick={toggle} className="w-full inline-flex items-center justify-center gap-2 rounded-full border-2 border-blush-300 bg-white px-5 py-2.5 text-sm font-bold text-maroon-800 hover:border-gold-400 hover:bg-blush-50 transition text-center">
                  View full cart
                </Link>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
