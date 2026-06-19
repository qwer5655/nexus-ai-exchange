import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/admin-auth'

export async function GET() {
  var auth = await verifyAdmin(arguments[0]); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var { data, error } = await supabaseAdmin.from('banners').select('*').order('sort_order', { ascending: true })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ banners: data || [] })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}

export async function POST(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var body = await req.json(); var { title, image_url, link_url, position, active, sort_order } = body
    if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 })
    var { data, error } = await supabaseAdmin.from('banners').insert({
      title, image_url: image_url || '', link_url: link_url || '',
      position: position || 'top', active: active !== false, sort_order: sort_order || 0
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ banner: data })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}

export async function PATCH(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var body = await req.json(); var { id, title, image_url, link_url, position, active, sort_order } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    var updates: any = { updated_at: new Date().toISOString() }
    if (title !== undefined) updates.title = title; if (image_url !== undefined) updates.image_url = image_url
    if (link_url !== undefined) updates.link_url = link_url; if (position !== undefined) updates.position = position
    if (active !== undefined) updates.active = active; if (sort_order !== undefined) updates.sort_order = sort_order
    var { data, error } = await supabaseAdmin.from('banners').update(updates).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ banner: data })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}

export async function DELETE(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var url = new URL(req.url); var id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    var { error } = await supabaseAdmin.from('banners').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}

