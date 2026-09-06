// ============================================================================
// SEEDS THE PRODUCT CATALOGUE INTO SUPABASE
// ----------------------------------------------------------------------------
// Usage:
//   1. Copy .env.example → .env and fill VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
//   2. Run supabase/schema.sql in the Supabase SQL Editor
//   3. npm run supabase:seed
//
// Safe to re-run: products are upserted by `id`, so your photo uploads and
// edits are preserved.
// ============================================================================
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split('\n')
    .filter((l) => l && !l.trim().startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    })
)

const url = env.VITE_SUPABASE_URL
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const { products } = await import('../src/data/products.js')

const supabase = createClient(url, serviceKey)

const rows = products.map((p) => ({
  id: p.id,
  slug: p.slug,
  name: p.name,
  category: p.category,
  price: p.price,
  compare_at: p.compareAt ?? null,
  rating: p.rating,
  review_count: p.reviewCount,
  badge: p.badge ?? null,
  stock: p.stock,
  occasion: p.occasion,
  recipient: p.recipient,
  theme: p.theme,
  short: p.short,
  description: p.description,
  what_inside: p.whatInside,
  images: p.images,
}))

const { error } = await supabase.from('products').upsert(rows, { onConflict: 'id' })

if (error) {
  console.error('❌ Seed failed:', error.message)
  process.exit(1)
}

console.log(`✅ Seeded ${rows.length} products into Supabase (id-based upsert — your edits are safe).`)