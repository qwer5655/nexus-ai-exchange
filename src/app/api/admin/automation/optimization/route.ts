import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdmin } from '@/lib/admin-auth'

export async function GET(req: Request) {
  var auth = await verifyAdmin(req)
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var rulesData = [
      { name: 'Dormant Activation', title: 'Come back bonus available' },
      { name: 'Deposit Conversion', title: 'First deposit bonus reminder' },
      { name: 'Referral Boost', title: 'Your referrals are waiting' }
    ]
    var results: any[] = []
    for (var ri = 0; ri < rulesData.length; ri++) {
      var rt = rulesData[ri].title
      var { data: notifs } = await supabaseAdmin.from('notifications').select('user_id,created_at').eq('title', rt)
      var trig = notifs || []
      var trigCnt = trig.length
      var affCnt = 0
      var rev = 0
      for (var ni = 0; ni < trig.length; ni++) {
        var n = trig[ni]
        var { data: dep } = await supabaseAdmin.from('deposits').select('amount').eq('user_id', n.user_id).eq('status', 'approved').gte('created_at', n.created_at)
        if (dep && dep.length > 0) { affCnt++; dep.forEach(function(d: any) { rev += d.amount || 0 }) }
      }
      var cr = trigCnt > 0 ? Math.round(affCnt / trigCnt * 10000) / 100 : 0
      results.push({ name: rulesData[ri].name, triggered_count: trigCnt, affected_users: affCnt, conversion_rate: cr, revenue_impact: Math.round(rev * 100) / 100 })
    }
    var { count: hv } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).gt('total_deposit', 1000)
    results.push({ name: 'High Value Detection', triggered_count: hv || 0, affected_users: hv || 0, conversion_rate: 100, revenue_impact: 0 })

    var maxRev = Math.max.apply(null, results.map(function(r: any) { return r.revenue_impact }).concat([1]))
    var enhanced = results.map(function(r: any) {
      var rn = maxRev > 0 ? r.revenue_impact / maxRev : 0
      var score = Math.round((r.conversion_rate * 0.5 + rn * 0.5) * 100) / 100
      var status = score > 50 ? 'strong' : score > 20 ? 'good' : 'weak'
      var rec = 'keep'
      if (r.conversion_rate < 10 && r.triggered_count > 0) rec = 'consider disable'
      else if (r.conversion_rate > 50) rec = 'enhance'
      return { name: r.name, triggered_count: r.triggered_count, affected_users: r.affected_users, conversion_rate: r.conversion_rate, revenue_impact: r.revenue_impact, score: score, status: status, recommendation: rec }
    })
    var sorted = enhanced.slice().sort(function(a: any, b: any) { return b.score - a.score })
    return NextResponse.json({
      rules: sorted,
      top_performing: sorted[0]?.name || null,
      weakest: sorted[sorted.length - 1]?.name || null,
      summary: {
        strong_count: enhanced.filter(function(r: any) { return r.status === 'strong' }).length,
        good_count: enhanced.filter(function(r: any) { return r.status === 'good' }).length,
        weak_count: enhanced.filter(function(r: any) { return r.status === 'weak' }).length
      }
    })
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
