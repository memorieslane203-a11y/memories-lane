import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Wishlist + out-of-stock "notify me" registrations.
// Persist locally; wire to auth API in production.
export const useWishlist = create(
  persist(
    (set, get) => ({
      items: [],
      notify: [],

      toggle: (product) => {
        const exists = get().items.some((i) => i.slug === product.slug)
        set({
          items: exists
            ? get().items.filter((i) => i.slug !== product.slug)
            : [
                ...get().items,
                {
                  slug: product.slug,
                  name: product.name,
                  price: product.price,
                  image: product.images?.[0]?.src,
                  badge: product.badge,
                },
              ],
        })
        return !exists
      },

      isWishlisted: (slug) => get().items.some((i) => i.slug === slug),
      remove: (slug) =>
        set({ items: get().items.filter((i) => i.slug !== slug) }),

      notifyMe: (slug, email) =>
        set({ notify: [...get().notify, { slug, email, at: Date.now() }] }),
    }),
    { name: 'ml-wishlist' }
  )
)
