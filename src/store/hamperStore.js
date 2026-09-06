import { create } from 'zustand'
import { hamperBaskets } from '../data/products'

// ============================================================================
// "BUILD YOUR OWN HAMPER" store — drives both the 3D scene and the live totals
// ============================================================================
export const useHamper = create((set, get) => ({
  basket: hamperBaskets[0].id,
  items: [],

  setBasket: (basket) => set({ basket }),

  addItem: (item) => {
    const exists = get().items.find((i) => i.id === item.id)
    if (exists) {
      set({
        items: get().items.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + 1 } : i
        ),
      })
    } else {
      set({ items: [...get().items, { ...item, qty: 1 }] })
    }
    return { ok: true }
  },

  removeItem: (id) =>
    set({ items: get().items.filter((i) => i.id !== id) }),

  setQty: (id, qty) =>
    set({
      items: get()
        .items.map((i) => (i.id === id ? { ...i, qty: Math.max(0, qty) } : i))
        .filter((i) => i.qty > 0),
    }),

  clear: () => set({ items: [] }),

  getTotals: () => {
    const { basket, items } = get()
    const b = hamperBaskets.find((x) => x.id === basket)
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
    return { basketPrice: b?.price ?? 0, subtotal, total: subtotal + (b?.price ?? 0), count: items.reduce((s, i) => s + i.qty, 0) }
  },
}))
