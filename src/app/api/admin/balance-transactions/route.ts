import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdmin } from '@/lib/admin-auth'

export async function GET(req: Request) {
  var auth = await verifyAdmin(req)
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    var url = new URL(req.url)
    var page = parseInt(url.searchParams.get('page') || '1')
    var limit = parseInt(url.searchParams.get('limit') || '50')
    var type = url.searchParams.get('type') || ''
    var from = (page - 1) * limit; var to = from + limit - 1

    // Use simple select without join to avoid FK ambiguity
    var query = supabaseAdmin.from('balance_transactions').select('*', { count: 'exact' })
    if (type) query = query.eq('type', type)
    query = query.order('created_at', { ascending: false }).range(from, to)
    var { data, count, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Get user info separately
    var userIds = [...new Set((data || []).map(function(t) { return t.user_id }))]
    var userMap: Record<string, any> = {}
    if (userIds.length > 0) {
      var { data: users } = await supabaseAdmin.from('profiles').select('id,username,email').in('id', userIds)
      ;(users || []).forEach(function(u) { userMap[u.id] = u })
    }
    var enriched = (data || []).map(function(t) { return { ...t, profiles: userMap[t.user_id] || null } })

    // Summary stats
    var { data: totals } = await supabaseAdmin.from('balance_transactions').select('type,amount')
    var summary: Record<string, number> = { deposit: 0, unlock: 0, topup: 0, adjustment: 0, refund: 0, commission: 0 }
    ;(totals || []).forEach(function(t: any) { if (summary[t.type] !== undefined) summary[t.type] += t.amount })

    return NextResponse.json({ transactions: enriched, total: count || 0, page, limit, summary })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}
