import { supabase } from '@/lib/supabase/client'
import { api } from '@/lib/api-client'

export async function checkUnlocked(userId: string, oppId: string): Promise<boolean> {
  var { data } = await supabase.from('unlocks').select('id').eq('user_id', userId).eq('opportunity_id', oppId).maybeSingle()
  return !!data
}

export async function unlockOpportunity(userId: string, oppId: string, price: number) {
  // Delegates to the API route for secure server-side processing
  var result = await api.post('/unlocks', { userId, opportunityId: oppId })
  return result
}

export async function getMyUnlocks(userId: string) {
  var { data, error } = await supabase.from('unlocks').select('opportunity_id, created_at, unlock_price, opportunities(*)').eq('user_id', userId).order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}
