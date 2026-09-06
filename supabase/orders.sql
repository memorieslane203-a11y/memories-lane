-- ============================================================================
-- ORDERS — stores every checkout so you can see who ordered what
-- Run: Supabase Dashboard → SQL Editor → paste → Run
-- ============================================================================
create extension if not exists "pgcrypto";

create table if not exists public.admin_users (
  email text primary key,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'owner can read own admin row' and tablename = 'admin_users') then
    create policy "owner can read own admin row" on public.admin_users for select using (auth.jwt() ->> 'email' = email);
  end if;
end $$;

create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  email         text not null,
  customer      jsonb not null default '{}'::jsonb,
  items         jsonb not null default '[]'::jsonb,
  totals        jsonb not null default '{}'::jsonb,
  gift_note     text,
  gift_wrap     boolean not null default false,
  delivery_date text,
  status        text not null default 'confirmed',
  created_at    timestamptz not null default now()
);

alter table public.orders enable row level security;

drop policy if exists "customers can insert own orders" on public.orders;
create policy "customers can insert own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

drop policy if exists "customers can read own orders" on public.orders;
create policy "customers can read own orders"
  on public.orders for select
  using (auth.uid() = user_id);

drop policy if exists "owners can read all orders" on public.orders;
create policy "owners can read all orders"
  on public.orders for select
  using (exists (select 1 from public.admin_users where email = auth.jwt() ->> 'email'));

drop policy if exists "owners can delete orders" on public.orders;
create policy "owners can delete orders"
  on public.orders for delete
  using (exists (select 1 from public.admin_users where email = auth.jwt() ->> 'email'));

drop policy if exists "owners can update orders" on public.orders;
create policy "owners can update orders"
  on public.orders for update
  using (exists (select 1 from public.admin_users where email = auth.jwt() ->> 'email'))
  with check (exists (select 1 from public.admin_users where email = auth.jwt() ->> 'email'));
