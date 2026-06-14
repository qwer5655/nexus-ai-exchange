import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdmin } from '@/lib/admin-auth'
import { emitEvent } from '@/lib/business-events'

export async function GET(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var url = new URL(req.url); var status = url.searchParams.get('status'); var userId = url.searchParams.get('user_id')
    var query = supabaseAdmin.from('tickets').select('*, profiles!tickets_user_id_fkey(email,username)').order('created_at', { ascending: false })
    if (status) query = query.eq('status', status)
    if (userId) query = query.eq('user_id', userId)
    var { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ tickets: data || [] })
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function POST(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var body = await req.json(); var { user_id, subject, message, priority, assigned_to } = body
    if (!subject || !message) return NextResponse.json({ error: 'subject and message required' }, { status: 400 })
    var { data, error } = await supabaseAdmin.from('tickets').insert({
      user_id: user_id || auth.userId, subject, message, priority: priority || 'normal', assigned_to
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        await emitEvent('ticket.created', auth.userId, { subject: body.subject, priority: body.priority })
return NextResponse.json({ ticket: data })
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function PATCH(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var body = await req.json(); var { id, status, priority, assigned_to, message } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    var updates: any = { updated_at: new Date().toISOString() }
    if (status !== undefined) updates.status = status
    if (status === 'resolved' || status === 'closed') updates.resolved_at = new Date().toISOString()
    if (priority !== undefined) updates.priority = priority
    if (assigned_to !== undefined) updates.assigned_to = assigned_to
    if (message !== undefined) updates.message = message
    var { data, error } = await supabaseAdmin.from('tickets').update(updates).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await emitEvent('ticket.updated', auth.userId, { id: body.id, status: body.status })
    return NextResponse.json({ ticket: data })
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function DELETE(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var url = new URL(req.url); var id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    var { error } = await supabaseAdmin.from('tickets').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        await emitEvent('ticket.deleted', auth.userId, { id })
return NextResponse.json({ success: true })
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
