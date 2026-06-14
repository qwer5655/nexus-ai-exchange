import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdmin } from '@/lib/admin-auth'

export async function GET(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var { data } = await supabaseAdmin.from('site_settings').select('*').limit(1).maybeSingle()
    return NextResponse.json({ settings: data || {} })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}

export async function POST(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var body = await req.json()
    var { data: existing } = await supabaseAdmin.from('site_settings').select('id').limit(1).maybeSingle()
    if (existing) {
      var { data } = await supabaseAdmin.from('site_settings').update({ ...body, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single()
      return NextResponse.json({ settings: data })
    }
    var { data } = await supabaseAdmin.from('site_settings').insert(body).select().single()
    return NextResponse.json({ settings: data })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}


export async function PATCH(req) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var body = await req.json(); var { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    updates.updated_at = new Date().toISOString()
    var { data, error } = await supabaseAdmin.from('site_settings').update(updates).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data: data })
  } catch(e) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}

export async function DELETE(req) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var url = new URL(req.url); var id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    var { error } = await supabaseAdmin.from('site_settings').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch(e) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}