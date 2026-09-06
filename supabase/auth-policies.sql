-- ============================================================================
-- MEMORIES LANE — AUTH-ONLY ADMIN POLICIES
-- ----------------------------------------------------------------------------
-- Run this AFTER your storefront is working and you have set up Supabase Auth.
-- It replaces the "demo" anon write policies with ones that require a signed-in
-- user, so only logged-in store owners can edit products / upload photos.
--
-- The storefront (anon SELECT on products + public photo reads) stays open.
--
-- How to run: Supabase Dashboard → SQL Editor → paste → Run.
-- ============================================================================

-- 1. Products: allow writes only for authenticated users
drop policy if exists "demo anon can insert products" on public.products;
drop policy if exists "demo anon can update products" on public.products;
drop policy if exists "demo anon can delete products" on public.products;

create policy "authenticated can insert products"
  on public.products for insert
  with check (auth.role() = 'authenticated');

create policy "authenticated can update products"
  on public.products for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "authenticated can delete products"
  on public.products for delete
  using (auth.role() = 'authenticated');

-- 2. Photo uploads / deletes: only authenticated users
drop policy if exists "demo anon upload product images" on storage.objects;
drop policy if exists "demo anon delete product images" on storage.objects;

create policy "authenticated can upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "authenticated can delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and auth.role() = 'authenticated');
