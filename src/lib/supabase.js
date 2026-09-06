import { createClient } from '@supabase/supabase-js'

// ============================================================================
// SUPABASE CLIENT
// ----------------------------------------------------------------------------
// Copy `.env.example` → `.env` and fill in:
//   VITE_SUPABASE_URL        (Project Settings → API → Project URL)
//   VITE_SUPABASE_ANON_KEY   (Project Settings → API → anon public key)
//
// If the keys are missing the app simply falls back to the bundled static
// catalogue — nothing breaks.
// ============================================================================

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = url && anonKey ? createClient(url, anonKey) : null

export const isSupabaseReady = () => !!supabase

// Store-owner email (from .env) — the only account allowed to open /admin.
export const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL ?? '').toLowerCase()

// Storage bucket used for product photos (created by supabase/schema.sql).
export const IMAGE_BUCKET = 'product-images'

// Storage bucket for Explore gallery images & videos (supabase/gallery.sql).
export const GALLERY_BUCKET = 'gallery-media'

export const GALLERY_CATEGORIES = [
  { id: 'frames', name: 'Frames', emoji: '🖼️' },
  { id: 'polaroids', name: 'Polaroids', emoji: '📸' },
  { id: 'bouquets', name: 'Bouquets', emoji: '💐' },
  { id: 'hampers', name: 'Hampers', emoji: '🧺' },
  { id: 'gift-boxes', name: 'Gift Boxes', emoji: '🎁' },
  { id: 'magazines', name: 'Magazines', emoji: '📖' },
]

// Uploads an Explore-gallery photo/video to Storage, returns { url, mediaType }.
export async function uploadGalleryMedia(category, file) {
  if (!supabase) throw new Error('Supabase is not configured (missing .env keys)')
  const mediaType = file.type.startsWith('video/') ? 'video' : 'image'
  const ext = file.name.split('.').pop()?.toLowerCase() || (mediaType === 'video' ? 'mp4' : 'jpg')
  const path = `gallery/${category}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage.from(GALLERY_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from(GALLERY_BUCKET).getPublicUrl(path)
  return { url: data.publicUrl, mediaType, path }
}

// Uploads a photo to Storage and returns its public URL.
// ---- This is the ONLY function the rest of the app needs for photos. ----
export async function uploadProductImage(slug, file) {
  if (!supabase) throw new Error('Supabase is not configured (missing .env keys)')
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `products/${slug}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path)
  return data.publicUrl
}
