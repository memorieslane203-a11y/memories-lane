-- ============================================================================
-- SITE SETTINGS — occasion theme picked in /admin (Valentine's, Rakhi…)
-- Run: Supabase Dashboard → SQL Editor → paste → Run
-- Single row (id = 1). Public can read it; writes follow the same demo
-- pattern as products/gallery (harden with auth-based policies before live).
-- ============================================================================

create table if not exists public.site_settings (
  id              integer primary key check (id = 1),
  theme           text not null default 'default',
  banner_text     text not null default '',
  banner_enabled  boolean not null default true,
  starts_at       timestamptz,
  ends_at         timestamptz,
  updated_at      timestamptz not null default now()
);

insert into public.site_settings (id) values (1) on conflict (id) do nothing;

alter table public.site_settings enable row level security;

create policy "anon can read site settings"
  on public.site_settings for select
  using (true);

create policy "demo anon can upsert site settings"
  on public.site_settings for insert
  with check (true);

create policy "demo anon can update site settings"
  on public.site_settings for update
  using (true)
  with check (true);
