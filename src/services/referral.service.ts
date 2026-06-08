import { supabase } from '@/lib/supabase'
import type { DBReferral } from '@/types/database'

export async function getReferrals(userId: string) {
  var { data, error } = await supabase.from('referrals').select('*, referred_user_id!inner(username, avatar_url, created_at)').eq('referrer_id', userId).order('created_at', { ascending: false })
  if (error) throw error
  return data as any[]
}

export async function getReferralStats(userId: string) {
  var { data: referrals } = await supabase.from('referrals').select('commission').eq('referrer_id', userId)
  var { count: totalCount } = await supabase.from('referrals').select('*', { count: 'exact', head: true }).eq('referrer_id', userId)
  var todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  var { count: todayCount } = await supabase.from('referrals').select('*', { count: 'exact', head: true }).eq('referrer_id', userId).gte('created_at', todayStart.toISOString())
  var totalCommission = (referrals || []).reduce(function(s, r) { return s + (r.commission || 0) }, 0)
  return { totalReferrals: totalCount || 0, todayReferrals: todayCount || 0, totalCommission, activeReferrals: (referrals || []).length }
}

export async function createReferral(referrerId: string, referredUserId: string, commission: number) {
  var { data, error } = await supabase.from('referrals').insert({ referrer_id: referrerId, referred_user_id: referredUserId, commission }).select().single()
  if (error) throw error
  return data as DBReferral
}