import { supabaseAdmin } from '@/lib/supabase/server'

export async function unlockOpportunity(userId: string, opportunityId: string, price: number) {
  // Uses PostgreSQL RPC for atomic transaction with row-level locking
  var { data, error } = await supabaseAdmin.rpc('unlock_opportunity', {
    p_user_id: userId,
    p_opportunity_id: opportunityId,
    p_price: price
  })

  if (error) throw new Error(error.message)
  return data
}

export async function checkUnlocked(userId: string, opportunityId: string): Promise<boolean> {
  var { data } = await supabaseAdmin
    .from('unlocks')
    .select('id')
    .eq('user_id', userId)
    .eq('opportunity_id', opportunityId)
    .maybeSingle()
  return !!data
}

export async function getMyUnlocks(userId: string) {
  var { data } = await supabaseAdmin
    .from('unlocks')
    .select('*, opportunities(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return data || []
}
