import { create } from 'zustand'

export const useUI = create((set) => ({
  toasts: [],
  openCart: false,

  pushToast: (message, tone = 'success') => {
    const id = Date.now() + Math.random()
    set((s) => ({ toasts: [...s.toasts, { id, message, tone }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3000)
  },

  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  toggleCart: () => set((s) => ({ openCart: !s.openCart })),
  openCartFn: () => set({ openCart: true }),
  closeCart: () => set({ openCart: false }),

  isMenuOpen: false,
  toggleMenu: () => set((s) => ({ isMenuOpen: !s.isMenuOpen })),
  closeMenu: () => set({ isMenuOpen: false }),
}))

export default useUI
