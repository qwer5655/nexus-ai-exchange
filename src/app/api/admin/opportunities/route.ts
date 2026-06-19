import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { verifyAdmin, logAdminAction } from '@/lib/admin-auth'

export async function GET(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var { data } = await supabaseAdmin.from('opportunities').select('*').order('created_at', { ascending: false }).limit(100)
    return NextResponse.json({ opportunities: data || [] })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}
export async function POST(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var body = await req.json()
    var required = ['title','match_name','league','roi','confidence','risk_level','required_capital']
    for (var f of required) { if (!body[f]) return NextResponse.json({ error: f + ' required' }, { status: 400 }) }
    var { data } = await supabaseAdmin.from('opportunities').insert({ title: body.title, match_name: body.match_name, league: body.league, home_team: body.home_team || '', away_team: body.away_team || '', roi: body.roi, confidence: body.confidence, risk_level: body.risk_level, required_capital: body.required_capital, description: body.description || '', status: body.status || 'published', is_locked: true }).select().single()
    await logAdminAction(auth.userId!, 'create_opportunity', 'opportunity', data?.id, { title: body.title, roi: body.roi })
    return NextResponse.json({ opportunity: data })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}
export async function PUT(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var body = await req.json()
    if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    var fields = ['title','match_name','league','roi','confidence','risk_level','required_capital','description','status','is_locked','home_team','away_team']
    var updates: any = {}
    for (var k of fields) { if (body[k] !== undefined) updates[k] = body[k] }
    var { data } = await supabaseAdmin.from('opportunities').update(updates).eq('id', body.id).select().single()
    await logAdminAction(auth.userId!, 'update_opportunity', 'opportunity', body.id, { updates: Object.keys(updates) })
    return NextResponse.json({ opportunity: data })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}
export async function DELETE(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var body = await req.json()
    if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    await supabaseAdmin.from('opportunities').delete().eq('id', body.id)
    await logAdminAction(auth.userId!, 'delete_opportunity', 'opportunity', body.id, {})
    return NextResponse.json({ success: true })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}
