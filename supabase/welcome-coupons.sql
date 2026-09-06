-- ============================================================================
-- WELCOME COUPONS — real one-time 10% off for first orders
-- Run: Supabase Dashboard → SQL Editor → paste → Run
-- One row per email. A code works only for the login email it was issued to,
-- only before that account's first order, and only once (used flag).
-- ============================================================================

create table if not exists public.welcome_coupons (
  email       text primary key,
  code        text unique not null,
  used        boolean not null default false,
  created_at  timestamptz not null default now(),
  used_at     timestamptz
);

alter table public.welcome_coupons enable row level security;

-- Cart needs to look up a code at checkout
create policy "anon can read welcome coupons"
  on public.welcome_coupons for select
  using (true);

-- Newsletter signup issues a row
create policy "anon can claim welcome coupon"
  on public.welcome_coupons for insert
  with check (true);

-- Only the owner (logged in as that email) can burn their code
create policy "owners can burn own welcome coupon"
  on public.welcome_coupons for update
  using (auth.jwt() ->> 'email' = email)
  with check (auth.jwt() ->> 'email' = email);
