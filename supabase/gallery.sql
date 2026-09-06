-- ============================================================================
-- MEMORIES LANE — EXPLORE GALLERY
-- ----------------------------------------------------------------------------
-- Run this in Dashboard → SQL Editor → New query (after schema.sql).
-- Stores the images & videos shown on the /explore page, uploaded from /admin.
-- ============================================================================

create table if not exists public.gallery_items (
  id          uuid primary key default gen_random_uuid(),
  category    text not null check (category in ('frames','polaroids','bouquets','hampers','gift-boxes','magazines')),
  media_type  text not null check (media_type in ('image','video')),
  url         text not null,
  caption     text not null default '',
  created_at  timestamptz not null default now()
);

alter table public.gallery_items enable row level security;

-- Anyone can view the gallery (this is the /explore page)
create policy "anon can read gallery"
  on public.gallery_items for select
  using (true);

-- DEMO: anon can insert/update/delete so /admin works without extra auth,
-- same pattern as products (harden with auth-based policies before going live).
create policy "demo anon can insert gallery"
  on public.gallery_items for insert
  with check (true);

create policy "demo anon can update gallery"
  on public.gallery_items for update
  using (true)
  with check (true);

create policy "demo anon can delete gallery"
  on public.gallery_items for delete
  using (true);

-- ---------------------------------------------------------------------------
-- Media storage bucket (images + videos, served from the Supabase CDN)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('gallery-media', 'gallery-media', true)
on conflict (id) do nothing;

create policy "public read gallery media"
  on storage.objects for select
  using (bucket_id = 'gallery-media');

create policy "demo anon upload gallery media"
  on storage.objects for insert
  with check (bucket_id = 'gallery-media');

create policy "demo anon delete gallery media"
  on storage.objects for delete
  using (bucket_id = 'gallery-media');
