import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var url = new URL(req.url)
    var userId = url.searchParams.get('user_id')
    var action = url.searchParams.get('action')
    var fromDate = url.searchParams.get('from')
    var toDate = url.searchParams.get('to')
    var limit = parseInt(url.searchParams.get('limit') || '50')

    var query = supabaseAdmin.from('enterprise_audit_log')
      .select('*, profiles!enterprise_audit_log_user_id_fkey(email,username)')
    if (userId) query = query.eq('user_id', userId)
    if (action) query = query.eq('action', action)
    if (fromDate) query = query.gte('created_at', fromDate)
    if (toDate) query = query.lte('created_at', toDate)
    var { data, error } = await query.order('created_at', { ascending: false }).limit(limit)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ logs: data || [], total: (data || []).length })
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function POST(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var body = await req.json()
    var { user_id, action, resource, details } = body
    if (!user_id || !action || !resource) return NextResponse.json({ error: 'user_id, action, resource required' }, { status: 400 })
    var { data, error } = await supabaseAdmin.from('enterprise_audit_log').insert({
      user_id, action, resource, details: details || {}
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ log: data })
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}



export async function PATCH(req) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var body = await req.json(); var { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    updates.updated_at = new Date().toISOString()
    var { data, error } = await supabaseAdmin.from('enterprise_audit_log').update(updates).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data: data })
  } catch(e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function DELETE(req) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var url = new URL(req.url); var id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    var { error } = await supabaseAdmin.from('enterprise_audit_log').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch(e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}