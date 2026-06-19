import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { emitEvent } from '@/lib/business-events'

export async function GET(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var url = new URL(req.url); var status = url.searchParams.get('status')
    var query = supabaseAdmin.from('announcements').select('*').order('created_at', { ascending: false })
    if (status) query = query.eq('status', status)
    var { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ announcements: data || [] })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}

export async function POST(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var body = await req.json()
    var { title, content, status, pinned } = body
    if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 })
    var { data, error } = await supabaseAdmin.from('announcements').insert({
      title, content: content || '', status: status || 'draft', pinned: pinned || false, created_by: auth.userId
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        await emitEvent('announcement.created', auth.userId, { title: body.title, status: body.status })
return NextResponse.json({ announcement: data })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}

export async function PATCH(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var body = await req.json(); var { id, title, content, status, pinned } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    var updates: any = { updated_at: new Date().toISOString() }
    if (title !== undefined) updates.title = title; if (content !== undefined) updates.content = content
    if (status !== undefined) updates.status = status; if (pinned !== undefined) updates.pinned = pinned
    var { data, error } = await supabaseAdmin.from('announcements').update(updates).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await emitEvent('announcement.updated', auth.userId, { id: body.id, ...updates })
    return NextResponse.json({ announcement: data })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}

export async function DELETE(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var url = new URL(req.url); var id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    var { error } = await supabaseAdmin.from('announcements').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        await emitEvent('announcement.deleted', auth.userId, { id })
return NextResponse.json({ success: true })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}
