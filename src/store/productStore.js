import { create } from 'zustand'
import { products as staticProducts } from '../data/products'
import { supabase } from '../lib/supabase'

// ============================================================================
// PRODUCT STORE — live Supabase catalogue with static fallback.
// ----------------------------------------------------------------------------
// While VITE_SUPABASE_URL / ANON_KEY are missing (or the DB is unreachable),
// the store serves the bundled static catalogue, so the site always works.
// ============================================================================

const rowToProduct = (r) => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  category: r.category,
  price: Number(r.price),
  compareAt: r.compare_at != null ? Number(r.compare_at) : null,
  rating: Number(r.rating),
  reviewCount: r.review_count,
  badge: r.badge ?? null,
  stock: r.stock,
  occasion: r.occasion ?? [],
  recipient: r.recipient ?? [],
  theme: r.theme,
  short: r.short,
  description: r.description,
  whatInside: r.what_inside ?? [],
  images: r.images ?? [],
})

export const useProducts = create((set) => ({
  products: staticProducts,
  source: 'static',
  loading: false,
  error: null,

  async load() {
    if (!supabase) return
    set({ loading: true })
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id')
      if (error) throw new Error(error.message)
      if (data && data.length) {
        set({ products: data.map(rowToProduct), source: 'supabase', loading: false, error: null })
      } else {
        set({ loading: false })
      }
    } catch (e) {
      set({ loading: false, error: e.message, products: staticProducts, source: 'static' })
    }
  },
}))