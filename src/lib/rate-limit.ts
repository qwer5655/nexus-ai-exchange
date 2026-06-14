var rateStore = new Map<string, { count: number; resetAt: number }>()
var events: any[] = []

export function checkRateLimit(key: string, maxRequests: number, windowMs = 60000): { allowed: boolean; retryAfter: number } {
  var now = Date.now()
  var entry = rateStore.get(key)
  if (!entry || now > entry.resetAt) {
    rateStore.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfter: 0 }
  }
  if (entry.count >= maxRequests) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
  }
  entry.count++
  return { allowed: true, retryAfter: 0 }
}

export function cleanupRateStore() {
  if (Math.random() < 0.01) {
    var now = Date.now()
    for (var key of rateStore.keys()) {
      var e = rateStore.get(key)
      if (e && now > e.resetAt) rateStore.delete(key)
    }
  }
}

export function recordEvent(userId: string | null, eventType: string, route: string) {
  events.push({ user_id: userId, event_type: eventType, route: route, created_at: new Date().toISOString() })
  if (events.length > 1000) events.shift()
}

export function getRecentEvents(limit = 20) { return events.slice(-limit).reverse() }
