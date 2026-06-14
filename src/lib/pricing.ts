import { supabaseAdmin } from './supabase'

export type Tier = 'free' | 'pro' | 'enterprise'

export var TIER_THRESHOLDS = {
  pro: { minCredits: 1000 },
  enterprise: { vipRequired: true, minCredits: 5000 }
}

export var DEFAULT_PRICING: Record<string, Record<string, number>> = {
  free: {
    automation_run: 5,
    analytics_export: 3,
    bulk_user_action: 10,
  },
  pro: {
    automation_run: 3,
    analytics_export: 2,
    bulk_user_action: 5,
  },
  enterprise: {
    automation_run: 1,
    analytics_export: 1,
    bulk_user_action: 2,
  }
}

// Calculate tier based on credits and VIP status
export function calculateTier(credits: number, vipLevel: number): Tier {
  if (vipLevel > 0 || credits >= TIER_THRESHOLDS.enterprise.minCredits) return 'enterprise'
  if (credits >= TIER_THRESHOLDS.pro.minCredits) return 'pro'
  return 'free'
}

// Get pricing for a specific tier
export function getPricing(tier: Tier): Record<string, number> {
  return DEFAULT_PRICING[tier] || DEFAULT_PRICING.free
}

// Get cost for a specific API feature based on user's tier
export function getFeatureCost(tier: Tier, feature: string): number {
  var pricing = getPricing(tier)
  return pricing[feature] || DEFAULT_PRICING.free[feature] || 5
}

// Update user's tier based on current credits and VIP
export async function updateUserTier(userId: string): Promise<Tier> {
  try {
    var { data: profile } = await supabaseAdmin.from('profiles').select('vip_level,vip_expires_at').eq('id', userId).maybeSingle()
    if (!profile) return 'free'
    var credits = profile.credits || 0
    var vipLevel = profile.vip_level || 0

    // Get actual credits from user_credits table
    var { data: uc } = await supabaseAdmin.from('user_credits').select('credits').eq('user_id', userId).maybeSingle()
    if (uc) credits = uc.credits

    var newTier = calculateTier(credits, vipLevel)
    await supabaseAdmin.from('profiles').update({ tier: newTier }).eq('id', userId)
    return newTier
  } catch { return 'free' }
}

// Get tier with user info
export async function getUserTier(userId: string): Promise<{ tier: Tier; credits: number; vipLevel: number }> {
  try {
    var { data: profile } = await supabaseAdmin.from('profiles').select('vip_level,vip_expires_at').eq('id', userId).maybeSingle()
    var credits = 0
    var { data: uc } = await supabaseAdmin.from('user_credits').select('credits').eq('user_id', userId).maybeSingle()
    if (uc) credits = uc.credits
    var vipLevel = profile?.vip_level || 0
    var currentTier: Tier = calculateTier(credits, vipLevel)
    return { tier: currentTier, credits, vipLevel }
  } catch { return { tier: 'free', credits: 0, vipLevel: 0 } }
}


export function calculatePrice(base: number) { return base }
