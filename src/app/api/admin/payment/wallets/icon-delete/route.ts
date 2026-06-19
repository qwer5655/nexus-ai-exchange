import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { emitEvent } from '@/lib/business-events'

var SU = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dcfwldxwyvvotvfdnywy.supabase.co'

export async function POST(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var { wallet_id } = await req.json()
    if (!wallet_id) return NextResponse.json({ error: 'wallet_id required' }, { status: 400 })
    await supabaseAdmin.from('wallets').update({ icon_url: '', updated_at: new Date().toISOString() }).eq('id', wallet_id)
    await emitEvent('wallet.icon_deleted', auth.userId, { wallet_id })
    return NextResponse.json({ success: true })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}

