import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { checkRateLimit, cleanupRateStore, recordEvent } from '@/lib/rate-limit'

var SU = 'https://dcfwldxwyvvotvfdnywy.supabase.co'
var SK = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function middleware(req: NextRequest) {
  var path = req.nextUrl.pathname

  // Rate limit with tiers
  if (path.startsWith('/api/auth/') || path.startsWith('/api/unlocks') || path.startsWith('/api/deposits') || path.startsWith('/api/admin/') || path.startsWith('/api/billing/')) {
    var ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    var isAdmin = !!req.headers.get('x-admin-email')
    var result = checkRateLimit(path + ':' + ip, isAdmin ? 200 : 60)
    if (!result.allowed) {
      recordEvent(null, 'rate_limit', path)
      return NextResponse.json({ error: 'RATE_LIMIT_EXCEEDED', retry_after: result.retryAfter }, { status: 429 })
    }
  }

  // VIP check for analytics/automation/stats
  if (path.startsWith('/api/admin/analytics/') || path.startsWith('/api/admin/automation/') || path === '/api/admin/stats') {
    var email = req.headers.get('x-admin-email')
    if (email) {
      try {
        var r = await fetch(SU + '/rest/v1/profiles?select=vip_level,email&email=eq.' + encodeURIComponent(email), { headers: { apikey: SK, Authorization: 'Bearer ' + SK } })
        var profiles = await r.json()
        if (!profiles?.[0] || profiles[0].vip_level <= 0) {
          recordEvent(null, 'vip_block', path)
          return NextResponse.json({ error: 'VIP_REQUIRED' }, { status: 402 })
        }
      } catch(e) {}
    }
  }

  cleanupRateStore()
  return NextResponse.next()
}

export var config = { matcher: ['/api/:path*'] }
