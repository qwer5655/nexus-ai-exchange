import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdmin } from '@/lib/admin-auth'
import { emitEvent } from '@/lib/business-events'

export async function GET(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var { data, error } = await supabaseAdmin.from('categories').select('*').order('name', { ascending: true })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ categories: data || [] })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}

export async function POST(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var body = await req.json(); var { name, enabled } = body
    if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
    var { data, error } = await supabaseAdmin.from('categories').insert({ name, enabled: enabled !== false }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await emitEvent('category.created', auth.userId, { name })
    return NextResponse.json({ category: data })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}

export async function PATCH(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var body = await req.json(); var { id, name, enabled } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    var updates: any = { updated_at: new Date().toISOString() }
    if (name !== undefined) updates.name = name
    if (enabled !== undefined) updates.enabled = enabled
    var { data, error } = await supabaseAdmin.from('categories').update(updates).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await emitEvent('category.updated', auth.userId, { id, name })
    return NextResponse.json({ category: data })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}

export async function DELETE(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var url = new URL(req.url); var id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    var { error } = await supabaseAdmin.from('categories').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await emitEvent('category.deleted', auth.userId, { id })
    return NextResponse.json({ success: true })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}
