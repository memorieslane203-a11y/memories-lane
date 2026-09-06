-- ============================================================================
-- GALLERY — add 'frames' category (for the Frames / Bouquet page Explore links)
-- Run: Supabase Dashboard → SQL Editor → paste → Run
-- Only needed if you already ran gallery.sql before this file existed.
-- Fresh setups can skip this (gallery.sql already includes 'frames').
-- ============================================================================

alter table public.gallery_items drop constraint if exists gallery_items_category_check;

alter table public.gallery_items
  add constraint gallery_items_category_check
  check (category in ('frames','polaroids','bouquets','hampers','gift-boxes','magazines'));
