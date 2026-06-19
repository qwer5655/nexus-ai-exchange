import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { evaluateVip } from '@/lib/vip-engine'

export async function POST(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var { user_id } = await req.json()
    if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 })
    var result = await evaluateVip(user_id)
    return NextResponse.json(result)
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function GET(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var url = new URL(req.url); var userId = url.searchParams.get('user_id')
    if (!userId) return NextResponse.json({ error: 'user_id required' }, { status: 400 })
    var result = await evaluateVip(userId)
    return NextResponse.json(result)
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
