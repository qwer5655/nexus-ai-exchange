import { supabaseAdmin } from './supabase'

// In-memory rate store for abuse detection
var abuseStore = new Map<string, { count: number; timestamp: number }>()

// Track an event and return risk assessment
export function trackAbuse(userId: string, eventType: string): { risk: 'low' | 'medium' | 'high'; action: 'allow' | 'throttle' | 'block'; reason?: string } {
  var now = Date.now()
  var key = userId + ':' + eventType
  var entry = abuseStore.get(key)

  // Clean old entries
  if (!entry || now - entry.timestamp > 60000) {
    abuseStore.set(key, { count: 1, timestamp: now })
    return { risk: 'low', action: 'allow' }
  }

  entry.count++

  // Automation abuse: > 20 runs/hour
  if (eventType === 'automation' && entry.count > 20) {
    return { risk: 'high', action: 'block', reason: 'Automation abuse: > 20 runs/hour' }
  }

  // High frequency: > 100 req/min
  if (entry.count > 100) {
    return { risk: 'high', action: 'throttle', reason: 'High frequency: > 100 req/min' }
  }

  // Moderate: > 50 req/min
  if (entry.count > 50) {
    return { risk: 'medium', action: 'throttle', reason: 'Moderate frequency: > 50 req/min' }
  }

  return { risk: 'low', action: 'allow' }
}

// Check credit consumption anomaly (> 50% credits consumed in 1 hour)
export async function checkCreditAbuse(userId: string): Promise<{ risk: 'low' | 'medium' | 'high'; action: 'allow' | 'throttle' | 'block'; reason?: string }> {
  try {
    var oneHourAgo = new Date(Date.now() - 3600000).toISOString()

    // Get credits at start of hour (approximate: use last credit_added event)
    var { data: addedEvents } = await supabaseAdmin.from('system_events')
      .select('metadata')
      .eq('user_id', userId)
      .eq('event_type', 'credits_added')
      .gte('created_at', oneHourAgo)
      .order('created_at', { ascending: false })
      .limit(1)

    // Get total credits deducted in last hour
    var { data: deductEvents } = await supabaseAdmin.from('system_events')
      .select('metadata')
      .eq('user_id', userId)
      .eq('event_type', 'credits_deducted')
      .gte('created_at', oneHourAgo)

    var totalDeducted = (deductEvents || []).reduce(function(sum: number, e: any) {
      return sum + (e.metadata?.cost || 0)
    }, 0)

    // Get current credits
    var { data: uc } = await supabaseAdmin.from('user_credits').select('credits').eq('user_id', userId).maybeSingle()
    var currentCredits = uc?.credits || 0
    var totalBefore = currentCredits + totalDeducted

    if (totalBefore > 0 && totalDeducted > totalBefore * 0.5) {
      return { risk: 'high', action: 'throttle', reason: 'Credit abuse: > 50% consumed in 1 hour' }
    }

    return { risk: 'low', action: 'allow' }
  } catch {
    return { risk: 'low', action: 'allow' }
  }
}

// Calculate user risk score (0-100)
export async function calculateRiskScore(userId: string): Promise<{ score: number; level: 'low' | 'medium' | 'high'; reasons: string[] }> {
  var score = 0
  var reasons: string[] = []

  // 1. Check rate abuse
  var rateCheck = trackAbuse(userId, 'general')
  if (rateCheck.risk === 'high') { score += 30; reasons.push('High request rate') }
  else if (rateCheck.risk === 'medium') { score += 15; reasons.push('Elevated request rate') }

  // 2. Check credit abuse
  try {
    var creditCheck = await checkCreditAbuse(userId)
    if (creditCheck.risk === 'high') { score += 25; reasons.push('Credit abuse detected') }
  } catch {}

  // 3. Check automation abuse
  var autoCheck = trackAbuse(userId, 'automation')
  if (autoCheck.risk === 'high') { score += 25; reasons.push('Automation abuse') }
  else if (autoCheck.risk === 'medium') { score += 10; reasons.push('High automation usage') }

  // 4. Check banned/suspended status
  try {
    var { data: profile } = await supabaseAdmin.from('profiles').select('banned').eq('id', userId).maybeSingle()
    if (profile?.banned) { score = 100; reasons.push('User already banned') }
  } catch {}

  var level: 'low' | 'medium' | 'high' = score > 80 ? 'high' : score > 50 ? 'medium' : 'low'
  return { score: Math.min(score, 100), level, reasons }
}

// Cleanup old entries periodically
export function cleanupAbuseStore() {
  var now = Date.now()
  for (var key of abuseStore.keys()) {
    var e = abuseStore.get(key)
    if (e && now - e.timestamp > 120000) abuseStore.delete(key)
  }
}
