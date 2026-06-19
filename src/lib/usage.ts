// P3-3 Usage Tracking — trackUsage, getUsage, checkQuota
import { supabaseAdmin } from './supabase'

export async function getCurrentPeriod(userId: string) {
  var now = new Date()
  var start = new Date(now.getFullYear(), now.getMonth(), 1)
  var end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  return { start: start.toISOString(), end: end.toISOString() }
}

export async function trackUsage(userId: string, feature: string, amount = 1) {
  try {
    var period = await getCurrentPeriod(userId)
    var { data: existing } = await supabaseAdmin.from('user_usage')
      .select('id, usage_count')
      .eq('user_id', userId)
      .eq('feature', feature)
      .eq('period_start', period.start)
      .maybeSingle()

    if (existing) {
      await supabaseAdmin.from('user_usage')
        .update({ usage_count: existing.usage_count + amount })
        .eq('id', existing.id)
    } else {
      await supabaseAdmin.from('user_usage').insert({
        user_id: userId, feature: feature,
        usage_count: amount,
        period_start: period.start, period_end: period.end
      })
    }
    return true
  } catch { return false }
}

export async function getUsage(userId: string, feature: string) {
  try {
    var period = await getCurrentPeriod(userId)
    var { data } = await supabaseAdmin.from('user_usage')
      .select('usage_count')
      .eq('user_id', userId)
      .eq('feature', feature)
      .eq('period_start', period.start)
      .maybeSingle()
    return data?.usage_count || 0
  } catch { return 0 }
}

export async function checkQuota(userId: string, limit: string, maxUsage: number) {
  var usage = await getUsage(userId, limit)
  return { allowed: usage < maxUsage, current: usage, limit: maxUsage, remaining: Math.max(0, maxUsage - usage) }
}
