import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET(req: Request) {
  var auth = await verifyAdmin(req)
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    var url = new URL(req.url)
    var userId = url.searchParams.get('userId')
    var search = url.searchParams.get('search') || ''
    var page = parseInt(url.searchParams.get('page') || '1')
    var limit = parseInt(url.searchParams.get('limit') || '50')
    var from = (page - 1) * limit
    var to = from + limit - 1

    var query = supabaseAdmin.from('admin_logs').select('*', { count: 'exact' }).eq('action', 'user_login')
    if (userId) query = query.eq('target_id', userId)
    query = query.order('created_at', { ascending: false }).range(from, to)
    var { data: logs, count: total, error: qErr } = await query
    if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 })

    return NextResponse.json({ logs: logs || [], total: total || 0, page, limit })
  } catch(e: any) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
