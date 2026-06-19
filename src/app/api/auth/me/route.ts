import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: Request) {
  try {
    var authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    var token = authHeader.slice(7)
    var { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    var { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', user.id).single()
    return NextResponse.json({ id: user.id, email: user.email, username: profile?.username || user.email?.split('@')[0], country: profile?.country || 'USA', role: profile?.role || 'user', balance: profile?.balance || 0, vip_level: profile?.vip_level || 0, total_profit: profile?.total_profit || 0, total_deposit: profile?.total_deposit || 0, total_unlocks: profile?.total_unlocks || 0, referral_code: profile?.referral_code || '', created_at: profile?.created_at || user.created_at })
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
