import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function checkUnlocked(userId: string, oppId: string): Promise<boolean> {
  var { data } = await supabase.from('unlocks').select('id').eq('user_id', userId).eq('opportunity_id', oppId).maybeSingle()
  return !!data
}

export async function unlockOpportunity(userId: string, oppId: string, price: number) {
  var already = await checkUnlocked(userId, oppId)
  if (already) throw new Error('Already Unlocked')
  var { data: profile, error: pErr } = await supabaseAdmin.from('profiles').select('balance').eq('id', userId).single()
  if (pErr || !profile) throw new Error('User not found')
  if (profile.balance < price) throw new Error("Insufficient Balance")
  var { error: dErr } = await supabaseAdmin.rpc('deduct_balance', { user_id: userId, amount: price })
  if (dErr) throw dErr
  var { data: unlock, error: uErr } = await supabaseAdmin.from('unlocks').insert({ user_id: userId, opportunity_id: oppId, unlock_price: price }).select().single()
  if (uErr) throw uErr
  await supabaseAdmin.from('activity_feed').insert({ type: 'opportunity_unlock', message: 'User unlocked opportunity ' + oppId })
  await supabaseAdmin.from('notifications').insert({ user_id: userId, title: 'Opportunity Unlocked', message: 'You have successfully unlocked a report.' })
  return unlock
}

export async function getMyUnlocks(userId: string) {
  var { data, error } = await supabase.from('unlocks').select('opportunity_id, created_at, unlock_price, opportunities(*)').eq('user_id', userId).order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}