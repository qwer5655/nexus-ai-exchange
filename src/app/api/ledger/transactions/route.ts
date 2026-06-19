import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { verifyAuth } from '@/lib/admin-auth'

export async function GET(req: Request) {
  try {
    var auth = await verifyAuth(req)
    if (!auth.authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    var url = new URL(req.url)
    var limit = parseInt(url.searchParams.get('limit') || '20')
    var type = url.searchParams.get('type') || ''
    var from = url.searchParams.get('from') || ''
    var to = url.searchParams.get('to') || ''

    var query = supabaseAdmin
      .from('ledger_entries')
      .select('*', { count: 'exact' })
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (type) query = query.eq('type', type)
    if (from) query = query.gte('created_at', from)
    if (to) query = query.lte('created_at', to)

    var { data, count, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ transactions: data || [], total: count || 0 })
  } catch(e: any) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    var auth = await verifyAuth(req)
    if (!auth.authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    var body = await req.json()
    var { type, amount, direction, description, reference_type, reference_id } = body
    if (!type || !amount || !direction) {
      return NextResponse.json({ error: 'Missing required fields: type, amount, direction' }, { status: 400 })
    }
    if (direction === 'credit') {
      var { data, error } = await supabaseAdmin.rpc('ledger_credit', {
        p_user_id: auth.userId,
        p_amount: amount,
        p_type: type,
        p_description: description || null,
        p_reference_type: reference_type || null,
        p_reference_id: reference_id || null
      })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ result: data })
    } else if (direction === 'debit') {
      var { data, error } = await supabaseAdmin.rpc('ledger_debit', {
        p_user_id: auth.userId,
        p_amount: amount,
        p_type: type,
        p_description: description || null,
        p_reference_type: reference_type || null,
        p_reference_id: reference_id || null
      })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ result: data })
    }
    return NextResponse.json({ error: 'Invalid direction' }, { status: 400 })
  } catch(e: any) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
