import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdmin } from '@/lib/admin-auth'

export async function GET(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var url = new URL(req.url)
    var userId = url.searchParams.get('user_id')
    if (!userId) return NextResponse.json({ error: 'user_id required' }, { status: 400 })
    var { data } = await supabaseAdmin.from('profiles').select('balance').eq('id', userId).single()
    return NextResponse.json({ balance: data?.balance || 0, user_id: userId })
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}