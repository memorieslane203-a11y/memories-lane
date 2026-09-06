-- ============================================================================
-- MEMORIES LANE — SUPABASE SCHEMA
-- ----------------------------------------------------------------------------
-- How to run:
--   1. Create a project at https://supabase.com
--   2. Open Dashboard → SQL Editor → New query
--   3. Paste this whole file and run it
--   4. Run the seed script (see README / package.json "supabase:seed")
--
-- IMPORTANT (production hardening):
--   The demo policies below allow the anon key to UPDATE/DELETE rows and
--   UPLOAD photos so the /admin page works without setting up login.
--   For a public store, replace them with `auth.uid() = ...` policies and
--   route admin writes through Supabase Auth + Row Level Security.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- 1. Products table
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id          text primary key,
  slug        text unique not null,
  name        text not null,
  category    text not null check (category in ('gift-boxes','magazines','hampers')),
  price       numeric not null default 0,
  compare_at  numeric,
  rating      numeric not null default 5,
  review_count integer not null default 0,
  badge       text,
  stock       integer not null default 0,
  occasion    text[] not null default '{}',
  recipient   text[] not null default '{}',
  theme       text not null default 'golden-hour',
  short       text not null default '',
  description text not null default '',
  what_inside jsonb not null default '[]'::jsonb,
  images      jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. Row Level Security
-- ---------------------------------------------------------------------------
alter table public.products enable row level security;

-- Anyone can read the catalogue (this is the storefront)
create policy "anon can read products"
  on public.products for select
  using (true);

-- DEMO: anon can update/insert/delete so the /admin page works without auth.
-- Replace these with `auth`-based policies before going live (see top note).
create policy "demo anon can insert products"
  on public.products for insert
  with check (true);

create policy "demo anon can update products"
  on public.products for update
  using (true)
  with check (true);

create policy "demo anon can delete products"
  on public.products for delete
  using (true);

-- ---------------------------------------------------------------------------
-- 3. Photo storage bucket
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Public read (the browser fetches photos straight from the CDN)
create policy "public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- DEMO: allow uploads/deletes without auth (harden with auth.uid() in prod)
create policy "demo anon upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images');

create policy "demo anon delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images');
