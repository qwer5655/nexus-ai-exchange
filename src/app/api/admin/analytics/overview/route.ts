import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET(req: Request) {
  var auth = await verifyAdmin(req)
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    var [totalQ, activeQ, depositRevQ, unlockRevQ, commQ, referredQ] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('deposits').select('user_id', { count: 'exact', head: true }).eq('status', 'approved'),
      supabaseAdmin.from('deposits').select('amount').eq('status', 'approved'),
      supabaseAdmin.from('unlocks').select('unlock_price'),
      supabaseAdmin.from('referrals').select('commission'),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).not('referred_by', 'is', null),
    ])

    var total = totalQ.count || 0
    var active = activeQ.count || 0
    var referred = referredQ.count || 0
    var despositAmount = (depositRevQ.data || []).reduce(function(s, d) { return s + (d.amount || 0) }, 0)
    var unlockAmount = (unlockRevQ.data || []).reduce(function(s, u) { return s + (u.unlock_price || 0) }, 0)
    var commAmount = (commQ.data || []).reduce(function(s, c) { return s + (c.commission || 0) }, 0)

    return NextResponse.json({
      users: { total, active, dormant: total - active, referred },
      revenue: { deposit: despositAmount, unlock: unlockAmount, commission_cost: commAmount, net: despositAmount + unlockAmount - commAmount },
      funnels: {
        register_to_deposit_rate: total > 0 ? Math.round(active / total * 10000) / 100 : 0,
        invite_to_signup_rate: total > 0 ? Math.round(referred / total * 10000) / 100 : 0,
        signup_to_active_rate: total > 0 ? Math.round(active / total * 10000) / 100 : 0
      }
    })
  } catch(e: any) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
