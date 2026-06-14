import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdmin } from '@/lib/admin-auth'

export async function GET(req: Request) {
  var auth = await verifyAdmin(req)
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var rules = ['Come back bonus available', 'First deposit bonus reminder', 'Your referrals are waiting']
    var ruleNames = ['Dormant Activation', 'Deposit Conversion', 'Referral Boost']
    var results: any[] = []

    for (var ri = 0; ri < rules.length; ri++) {
      var ruleTitle = rules[ri]
      var ruleName = ruleNames[ri]
      var { data: notifs } = await supabaseAdmin.from('notifications').select('user_id,created_at').eq('title', ruleTitle)
      var triggered = notifs || []
      var triggeredCount = triggered.length
      var affectedCount = 0
      var revenueImpact = 0

      for (var ni = 0; ni < triggered.length; ni++) {
        var n = triggered[ni]
        var { data: userDeposits } = await supabaseAdmin.from('deposits').select('amount').eq('user_id', n.user_id).eq('status', 'approved').gte('created_at', n.created_at)
        if (userDeposits && userDeposits.length > 0) {
          affectedCount++
          userDeposits.forEach(function(d: any) { revenueImpact += d.amount || 0 })
        }
      }
      var convRate = triggeredCount > 0 ? Math.round(affectedCount / triggeredCount * 10000) / 100 : 0
      results.push({ name: ruleName, triggered_count: triggeredCount, affected_users: affectedCount, conversion_rate: convRate, revenue_impact: Math.round(revenueImpact * 100) / 100 })
    }

    // High Value Detection
    var { count: hvCount } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).gt('total_deposit', 1000)
    results.push({ name: 'High Value Detection', triggered_count: hvCount || 0, affected_users: hvCount || 0, conversion_rate: 100, revenue_impact: 0 })

    var totalRev = results.reduce(function(s, r) { return s + r.revenue_impact }, 0)
    return NextResponse.json({ rules: results, total_revenue_impact: Math.round(totalRev * 100) / 100 })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}
