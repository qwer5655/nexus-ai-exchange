import { supabaseAdmin } from '@/lib/supabase/server'
import { updateUserTier } from './pricing'
import type { Tier } from './pricing'

// Credit costs for premium API usage
export var CREDIT_COSTS: Record<string, number> = {
  '/api/admin/automation': 5,
  '/api/admin/analytics/overview': 3,
  '/api/admin/analytics': 3,
  '/api/admin/users': 2,
}

export async function getCredits(userId: string): Promise<number> {
  try {
    var { data } = await supabaseAdmin.from('user_credits').select('credits').eq('user_id', userId).maybeSingle()
    return data?.credits ?? 0
  } catch { return 0 }
}

export async function deductCredits(userId: string, cost: number): Promise<{ success: boolean; remaining: number; error?: string }> {
  try {
    var { data: row } = await supabaseAdmin.from('user_credits').select('credits').eq('user_id', userId).maybeSingle()
    if (!row) return { success: false, remaining: 0, error: 'No credit account' }
    if (row.credits < cost) return { success: false, remaining: row.credits, error: 'Insufficient credits' }
    var newBalance = row.credits - cost
    var { error } = await supabaseAdmin.from('user_credits').update({ credits: newBalance, updated_at: new Date().toISOString() }).eq('user_id', userId)
    if (error) return { success: false, remaining: row.credits, error: error.message }
    // Record event
    try {
      await supabaseAdmin.from('system_events').insert({
        user_id: userId, event_type: 'credits_deducted',
        metadata: { cost: cost, remaining: newBalance }
      })
    } catch {}
    // Update tier after credit change
    try { await updateUserTier(userId) } catch {}
    return { success: true, remaining: newBalance }
  } catch(e: any) { return { success: false, remaining: 0, error: (e as Error).message } }
}

export async function addCredits(userId: string, amount: number, reason = 'topup'): Promise<{ success: boolean; balance: number }> {
  try {
    var { data: row } = await supabaseAdmin.from('user_credits').select('credits').eq('user_id', userId).maybeSingle()
    var newBalance = (row?.credits ?? 0) + amount
    if (row) {
      await supabaseAdmin.from('user_credits').update({ credits: newBalance, updated_at: new Date().toISOString() }).eq('user_id', userId)
    } else {
      await supabaseAdmin.from('user_credits').insert({ user_id: userId, credits: newBalance })
    }
    try {
      await supabaseAdmin.from('system_events').insert({
        user_id: userId, event_type: 'credits_added',
        metadata: { amount: amount, reason: reason, balance: newBalance }
      })
    } catch {}
    // Update tier after credit change
    try { await updateUserTier(userId) } catch {}
    return { success: true, balance: newBalance }
  } catch(e: any) { return { success: false, balance: 0 } }
}


export function processAbuseScore(score: number) { return Math.min(100, Math.max(0, score)) }
