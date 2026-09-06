import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================================================================
// CART STORE
// Persisted to localStorage. In production, sync with your cart API:
//   api.cart.sync(cart) / api.cart.update(id, qty)
// ----------------------------------------------------------------------------
// cartItem shape: { key, productId, slug, name, image, price, qty, variant?, giftNote? }
// key = `${slug}__${variant ?? 'default'}` so variants stay separate lines.
// ============================================================================

// Generic promo codes. NOTE: the 10% first-order discount is NOT here —
// it lives in welcome_coupons (one code per login email, single use).
const coupons = {
  LANE15: { code: 'LANE15', type: 'percent', value: 15 },
  FLAT5: { code: 'FLAT5', type: 'flat', value: 5 },
}

export const useCart = create(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      giftNote: '',
      giftWrap: false,
      deliveryDate: '',
      utr: '',

      addItem: (item, qty = 1) => {
        const { items } = get()
        const key = item.key ?? `${item.slug}__${item.variant ?? 'default'}`
        const existing = items.find((i) => i.key === key)
        if (existing) {
          set({
            items: items.map((i) =>
              i.key === key ? { ...i, qty: i.qty + qty } : i
            ),
          })
        } else {
          set({ items: [...items, { ...item, key, qty }] })
        }
        return { ok: true }
      },

      removeItem: (key) =>
        set({ items: get().items.filter((i) => i.key !== key) }),

      setQty: (key, qty) =>
        set({
          items: get()
            .items.map((i) => (i.key === key ? { ...i, qty: Math.max(1, qty) } : i))
            .filter((i) => i.qty > 0),
        }),

      clearCart: () => set({ items: [], coupon: null, giftNote: '', giftWrap: false, deliveryDate: '', utr: '' }),

      applyCoupon: (code) => {
        const c = coupons[(code || '').trim().toUpperCase()]
        if (!c) return { ok: false, error: 'Invalid coupon code' }
        set({ coupon: c })
        return { ok: true, coupon: c }
      },

      // Tries generic codes first, then one-time WELCOME- codes (async DB check)
      applyCouponAsync: async (code) => {
        const clean = (code || '').trim().toUpperCase()
        const generic = coupons[clean]
        if (generic) {
          set({ coupon: generic })
          return { ok: true, coupon: generic }
        }
        const { validateWelcomeCode } = await import('../lib/welcomeCoupon')
        const res = await validateWelcomeCode(clean)
        if (!res.ok) return res
        set({ coupon: res.coupon })
        return { ok: true, coupon: res.coupon }
      },

      removeCoupon: () => set({ coupon: null }),

      setGiftNote: (giftNote) => set({ giftNote }),
      setGiftWrap: (giftWrap) => set({ giftWrap }),
      setDeliveryDate: (deliveryDate) => set({ deliveryDate }),
      setUtr: (utr) => set({ utr: (utr || '').replace(/\D/g, '').slice(0, 12) }),

      // Derived (helper for components)
      getTotals: () => {
        const { items, coupon, giftWrap } = get()
        const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
        const shipping = subtotal === 0 || subtotal * 83.5 >= 200 ? 0 : 6.5
        const wrapFee = giftWrap ? 4.5 : 0
        let discount = 0
        if (coupon) {
          discount =
            coupon.type === 'percent'
              ? (subtotal * coupon.value) / 100
              : coupon.value
        }
        const total = subtotal - discount + shipping + wrapFee
        return { subtotal, discount, shipping, wrapFee, total, count: items.reduce((s, i) => s + i.qty, 0) }
      },
    }),
    { name: 'ml-cart' }
  )
)
