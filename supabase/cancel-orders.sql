-- ============================================================================
-- CUSTOMER ORDER CANCELLATION
-- Run: Supabase Dashboard → SQL Editor → paste → Run
-- Lets a signed-in customer cancel their OWN order while it is still
-- 'pending' or 'confirmed'. They cannot touch anyone else's orders, cannot
-- change anything except setting status to 'cancelled', and cannot cancel
-- orders that already shipped.
-- ============================================================================

drop policy if exists "customers can cancel own orders" on public.orders;

create policy "customers can cancel own orders"
  on public.orders for update
  using (auth.uid() = user_id and status in ('pending', 'confirmed'))
  with check (auth.uid() = user_id and status = 'cancelled');
