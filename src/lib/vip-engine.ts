import { supabaseAdmin } from './supabase'
import { emitEvent } from './business-events'

// VIP tier definitions
export var VIP_TIERS = [
  { level: 0, name: 'Free', min_deposit: 0, min_referrals: 0, min_activity: 0 },
  { level: 1, name: 'VIP1', min_deposit: 100, min_referrals: 1, min_activity: 5 },
  { level: 2, name: 'VIP2', min_deposit: 500, min_referrals: 3, min_activity: 20 },
  { level: 3, name: 'VIP3', min_deposit: 2000, min_referrals: 5, min_activity: 50 },
  { level: 4, name: 'VIP4', min_deposit: 5000, min_referrals: 10, min_activity: 100 },
  { level: 5, name: 'VIP5', min_deposit: 10000, min_referrals: 20, min_activity: 200 },
  { level: 6, name: 'VIP6', min_deposit: 50000, min_referrals: 50, min_activity: 500 },
]

export async function evaluateVip(userId: string): Promise<{ current: number; calculated: number; upgraded: boolean }> {
  try {
    // Get user stats
    var { data: deposits } = await supabaseAdmin.from('deposits')
      .select('amount').eq('user_id', userId).eq('status', 'approved')
    var totalDeposit = (deposits || []).reduce(function(s: number, d: any) { return s + (d.amount || 0) }, 0)

    var { data: referrals } = await supabaseAdmin.from('referrals')
      .select('id').eq('referrer_id', userId)
    var referralCount = (referrals || []).length

    var { data: profile } = await supabaseAdmin.from('profiles')
      .select('vip_level').eq('id', userId).maybeSingle()
    var currentLevel = profile?.vip_level || 0

    // Calculate target level
    var calculatedLevel = 0
    for (var i = VIP_TIERS.length - 1; i >= 0; i--) {
      var tier = VIP_TIERS[i]
      if (totalDeposit >= tier.min_deposit && referralCount >= tier.min_referrals) {
        calculatedLevel = tier.level
        break
      }
    }

    // Upgrade if needed
    var upgraded = false
    if (calculatedLevel > currentLevel) {
      await supabaseAdmin.from('profiles').update({
        vip_level: calculatedLevel, vip_src: 'auto', vip_expires_at: null
      }).eq('id', userId)
      await emitEvent('vip.upgraded', userId, { from: currentLevel, to: calculatedLevel, reason: 'auto_evaluate' })
      upgraded = true
    }

    return { current: currentLevel, calculated: calculatedLevel, upgraded: upgraded }
  } catch { return { current: 0, calculated: 0, upgraded: false } }
}
