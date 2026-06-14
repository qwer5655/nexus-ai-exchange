import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdmin } from '@/lib/admin-auth'

export async function GET(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var now = new Date()
    var todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

    // Aggregate real data from existing tables
    var rateLimitEvents = 0; var abnormalLogins = 0; var dupIps = 0; var openTickets = 0
    try {
      var { count: rl } = await supabaseAdmin.from('system_events').select('*', { count: 'exact', head: true }).eq('event_type', 'rate_limit').gte('created_at', todayStart)
      rateLimitEvents = rl || 0
    } catch {}
    try {
      var { count: al } = await supabaseAdmin.from('admin_logs').select('*', { count: 'exact', head: true }).gte('created_at', todayStart)
      abnormalLogins = al || 0
    } catch {}
    try {
      var { count: tk } = await supabaseAdmin.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'open')
      openTickets = tk || 0
    } catch {}

    return NextResponse.json({
      metrics: [
        { type: 'Rate Limit', count: rateLimitEvents, status: rateLimitEvents > 100 ? 'WARNING' : 'OK' },
        { type: 'Admin Actions', count: abnormalLogins, status: abnormalLogins > 50 ? 'REVIEW' : 'OK' },
        { type: 'Open Tickets', count: openTickets, status: openTickets > 20 ? 'ATTENTION' : 'OK' }
      ],
      period: 'today',
      timestamp: now.toISOString()
    })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}
