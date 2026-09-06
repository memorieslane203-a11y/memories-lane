-- ============================================================================
-- MEMORIES LANE — OWNER-ONLY ADMIN POLICIES
-- ----------------------------------------------------------------------------
-- Run this ONCE. It replaces ALL previous write policies (the "demo anon"
-- ones from schema.sql and the "authenticated" ones from auth-policies.sql)
-- so that ONLY the store owner's email can edit products or upload photos.
--
-- Customers can still sign up, browse and order — the storefront (anon
-- SELECT + public photo reads) stays open.
--
-- How to run: Supabase Dashboard → SQL Editor → paste → Run.
-- ============================================================================

-- 1. Drop every old write policy (safe if some don't exist)
drop policy if exists "demo anon can insert products" on public.products;
drop policy if exists "demo anon can update products" on public.products;
drop policy if exists "demo anon can delete products" on public.products;
drop policy if exists "authenticated can insert products" on public.products;
drop policy if exists "authenticated can update products" on public.products;
drop policy if exists "authenticated can delete products" on public.products;

drop policy if exists "demo anon upload product images" on storage.objects;
drop policy if exists "demo anon delete product images" on storage.objects;
drop policy if exists "authenticated can upload product images" on storage.objects;
drop policy if exists "authenticated can delete product images" on storage.objects;

-- 2. Admin list — ONLY this email is the store owner
create table if not exists public.admin_users (
  email      text primary key,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create policy "owner can read own admin row"
  on public.admin_users for select
  using (auth.jwt() ->> 'email' = email);

insert into public.admin_users (email)
values ('memories.lane.203@gmail.com')
on conflict (email) do nothing;

-- 3. Product writes: only the owner
create policy "owner can insert products"
  on public.products for insert
  with check (exists (select 1 from public.admin_users where email = auth.jwt() ->> 'email'));

create policy "owner can update products"
  on public.products for update
  using (exists (select 1 from public.admin_users where email = auth.jwt() ->> 'email'))
  with check (exists (select 1 from public.admin_users where email = auth.jwt() ->> 'email'));

create policy "owner can delete products"
  on public.products for delete
  using (exists (select 1 from public.admin_users where email = auth.jwt() ->> 'email'));

-- 4. Photo uploads / deletes: only the owner
create policy "owner can upload product images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and exists (select 1 from public.admin_users where email = auth.jwt() ->> 'email')
  );

create policy "owner can delete product images"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and exists (select 1 from public.admin_users where email = auth.jwt() ->> 'email')
  );
