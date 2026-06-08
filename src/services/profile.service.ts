import { supabase } from '@/lib/supabase'
import type { DBProfile } from '@/types/database'

export async function getProfile(userId: string) {
  var { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (error) throw error
  return data as DBProfile
}

export async function updateProfile(userId: string, updates: Partial<Pick<DBProfile, 'username' | 'avatar_url' | 'country'>>) {
  var { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single()
  if (error) throw error
  return data as DBProfile
}

export async function getUserStats(userId: string) {
  var { data: profile } = await supabase.from('profiles').select('balance, total_profit, total_deposit, total_unlocks, vip_level').eq('id', userId).single()
  var { count: depositCount } = await supabase.from('deposits').select('*', { count: 'exact', head: true }).eq('user_id', userId)
  var { count: unlockCount } = await supabase.from('unlocks').select('*', { count: 'exact', head: true }).eq('user_id', userId)
  var { data: referrals } = await supabase.from('referrals').select('*').eq('referrer_id', userId)
  return { profile, depositCount, unlockCount, referralCount: referrals?.length || 0, totalCommission: referrals?.reduce(function(s, r) { return s + (r.commission || 0) }, 0) || 0 }
}