import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var { data, error } = await supabaseAdmin.from('enterprise_customers')
      .select('*, profiles!enterprise_customers_admin_user_id_fkey(email,username)')
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ customers: data || [] })
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function POST(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var body = await req.json()
    var { company_name, admin_user_id, status } = body
    if (!company_name || !admin_user_id) return NextResponse.json({ error: 'company_name and admin_user_id required' }, { status: 400 })
    var { data, error } = await supabaseAdmin.from('enterprise_customers').insert({
      company_name, admin_user_id, status: status || 'active'
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ customer: data })
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function PATCH(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var body = await req.json()
    var { id, company_name, status } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    var updates: any = { updated_at: new Date().toISOString() }
    if (company_name !== undefined) updates.company_name = company_name
    if (status !== undefined) updates.status = status
    var { data, error } = await supabaseAdmin.from('enterprise_customers').update(updates).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ customer: data })
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function DELETE(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var url = new URL(req.url)
    var id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    var { error } = await supabaseAdmin.from('enterprise_customers').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

