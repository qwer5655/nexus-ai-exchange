import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { verifyAuth } from '@/lib/admin-auth'

export async function GET(req: Request) {
  try {
    var auth = await verifyAuth(req)
    if (!auth.authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    var { data: wallet } = await supabaseAdmin
      .from('user_wallets')
      .select('balance, updated_at')
      .eq('user_id', auth.userId)
      .single()
    return NextResponse.json({
      balance: wallet?.balance || 0,
      updated_at: wallet?.updated_at || null
    })
  } catch(e: any) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
