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
    var result = checkRateLimit(path + ':' + ip, 60)
    if (!result.allowed) {
      recordEvent(null, 'rate_limit', path)
      return NextResponse.json({ error: 'RATE_LIMIT_EXCEEDED', retry_after: result.retryAfter }, { status: 429 })
    }
  }

  cleanupRateStore()
  return NextResponse.next()
}

export var config = { matcher: ['/api/:path*'] }
