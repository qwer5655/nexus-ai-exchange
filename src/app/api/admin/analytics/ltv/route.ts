import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/admin-auth'

export async function GET(req: Request) {
  var auth = await verifyAdmin(req)
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    // LTV: Average lifetime value per user (total deposits / total users)
    var { count: totalUsers } = await supabaseAdmin.from('profiles')
      .select('*', { count: 'exact', head: true })

    var { data: deposits } = await supabaseAdmin.from('deposits')
      .select('amount').eq('status', 'approved')

    var { data: unlocks } = await supabaseAdmin.from('unlocks')
      .select('unlock_price')

    var { data: referrals } = await supabaseAdmin.from('referrals')
      .select('commission')

    var totalDeposits = (deposits || []).reduce(function(s: number, d: any) { return s + (d.amount || 0) }, 0)
    var totalUnlocks = (unlocks || []).reduce(function(s: number, u: any) { return s + (u.unlock_price || 0) }, 0)
    var totalCommissions = (referrals || []).reduce(function(s: number, r: any) { return s + (r.commission || 0) }, 0)

    var totalRevenue = totalDeposits + totalUnlocks - totalCommissions
    var userCount = totalUsers || 1

    // CAC: Customer Acquisition Cost (simplified: estimated marketing cost / new users)
    // Assuming  monthly marketing cost (adjustable)
    var estMonthlyMarketingCost = 500
    var { count: newUsersCount } = await supabaseAdmin.from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString())
    /* count already destructured above */

    var ltv = Math.round(totalRevenue / userCount * 100) / 100
    var cac = Math.round(estMonthlyMarketingCost / newUsersCount * 100) / 100
    var ltvCacRatio = cac > 0 ? Math.round(ltv / cac * 10) / 10 : 0

    return NextResponse.json({
      ltv: ltv,
      cac: cac,
      ltv_cac_ratio: ltvCacRatio,
      total_revenue: totalRevenue,
      total_users: totalUsers || 0,
      new_users_30d: newUsersCount || 0,
      est_monthly_marketing: estMonthlyMarketingCost
    })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}
