-- Migration: Atomic unlock_opportunity RPC
-- Ensures balance deduction + unlock record are executed as a single atomic transaction
-- Prevents race conditions and double-spend

create or replace function unlock_opportunity(
  p_user_id uuid,
  p_opportunity_id uuid,
  p_price numeric
)
returns jsonb
language plpgsql
security definer
set search_path = public
as 
declare
  v_balance numeric;
  v_unlock_id uuid;
  v_opportunity_title text;
begin
  -- Lock the user's profile row to prevent concurrent modifications
  select balance into v_balance
  from profiles
  where id = p_user_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'User not found');
  end if;

  -- Check balance
  if v_balance < p_price then
    return jsonb_build_object('success', false, 'error', 'Insufficient balance', 'balance', v_balance, 'required', p_price);
  end if;

  -- Prevent duplicate unlock (idempotency)
  if exists (select 1 from unlocks where user_id = p_user_id and opportunity_id = p_opportunity_id) then
    select unlock_price into p_price from unlocks where user_id = p_user_id and opportunity_id = p_opportunity_id;
    return jsonb_build_object('success', true, 'already_unlocked', true, 'unlock_price', p_price);
  end if;

  -- Deduct balance
  update profiles
  set balance = balance - p_price
  where id = p_user_id;

  -- Create unlock record
  insert into unlocks (user_id, opportunity_id, unlock_price)
  values (p_user_id, p_opportunity_id, p_price)
  returning id into v_unlock_id;

  -- Record balance transaction
  insert into balance_transactions (user_id, type, amount, balance_before, balance_after, reference_type, reference_id)
  values (p_user_id, 'unlock', -p_price, v_balance, v_balance - p_price, 'opportunity', p_opportunity_id);

  -- Create notification
  insert into notifications (user_id, title, message, type)
  values (p_user_id, 'Opportunity Unlocked', 'You have successfully unlocked an arbitrage opportunity.', 'success');

  return jsonb_build_object('success', true, 'unlock_id', v_unlock_id, 'unlock_price', p_price);
end;
;
