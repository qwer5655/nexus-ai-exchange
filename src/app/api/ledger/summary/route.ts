import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { verifyAuth } from '@/lib/admin-auth'

export async function GET(req: Request) {
  try {
    var auth = await verifyAuth(req)
    if (!auth.authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    var userId = auth.userId!

    // Get wallet balance
    var { data: wallet } = await supabaseAdmin
      .from('user_wallets')
      .select('balance')
      .eq('user_id', userId)
      .single()
    var balance = wallet?.balance || 0

    // Get ledger summaries
    var { data: profitRows } = await supabaseAdmin
      .from('ledger_entries')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'profit')
      .eq('direction', 'credit')

    var { data: depositRows } = await supabaseAdmin
      .from('ledger_entries')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'deposit')
      .eq('direction', 'credit')

    var { data: countData } = await supabaseAdmin
      .from('ledger_entries')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)

    var totalProfit = (profitRows || []).reduce(function(s: number, r: any) { return s + Number(r.amount) }, 0)
    var totalDeposit = (depositRows || []).reduce(function(s: number, r: any) { return s + Number(r.amount) }, 0)
    var transactionCount = countData || 0
    var profitPercent = totalDeposit > 0 ? Number(((totalProfit / totalDeposit) * 100).toFixed(2)) : 0

    // Get VIP level from profiles
    var { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('vip_level')
      .eq('id', userId)
      .single()

    return NextResponse.json({
      balance: balance,
      totalDeposit: totalDeposit,
      totalProfit: totalProfit,
      profitPercent: profitPercent,
      transactionCount: transactionCount,
      vipLevel: profile?.vip_level || 0,
      targetProfit: Math.max(totalDeposit, 1000)
    })
  } catch(e: any) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
