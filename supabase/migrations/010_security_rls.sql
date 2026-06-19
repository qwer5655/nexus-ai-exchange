-- Migration: Add unique constraint on unlocks to prevent duplicate entries
-- Combined with row-level locking in unlock_opportunity RPC

-- Ensure no duplicate unlocks per user per opportunity
alter table unlocks 
  add constraint unlocks_user_opportunity_unique 
  unique (user_id, opportunity_id);

-- Verify RLS is enabled on key tables
-- (Run in Supabase SQL editor if not already applied)

-- Profiles RLS
alter table profiles enable row level security;
drop policy if exists profiles_self_access on profiles;
create policy profiles_self_access on profiles
  for all using (auth.uid() = id);

-- Unlocks RLS
alter table unlocks enable row level security;
drop policy if exists unlocks_self_select on unlocks;
create policy unlocks_self_select on unlocks
  for select using (auth.uid() = user_id);
drop policy if exists unlocks_admin_all on unlocks;
create policy unlocks_admin_all on unlocks
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

-- Balance transactions RLS
alter table balance_transactions enable row level security;
drop policy if exists balance_tx_self_select on balance_transactions;
create policy balance_tx_self_select on balance_transactions
  for select using (auth.uid() = user_id);
drop policy if exists balance_tx_admin_all on balance_transactions;
create policy balance_tx_admin_all on balance_transactions
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );
