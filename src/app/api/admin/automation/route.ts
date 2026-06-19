import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { verifyAdmin, logAdminAction } from '@/lib/admin-auth'

export async function GET(req: Request) {
  var auth = await verifyAdmin(req)
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()
    var oneDayAgo = new Date(Date.now() - 24 * 3600000).toISOString()
    var { data: allUsers } = await supabaseAdmin.from('profiles').select('id,created_at')
    var { data: depositors } = await supabaseAdmin.from('deposits').select('user_id').eq('status', 'approved')
    var { data: referrals } = await supabaseAdmin.from('referrals').select('referrer_id,commission')
    var { count: highValue } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).gt('total_deposit', 1000)
    var depositedSet = new Set<string>()
    ;(depositors || []).forEach(function(d: any) { depositedSet.add(d.user_id) })
    var dormant = 0, noDeposit = 0
    ;(allUsers || []).forEach(function(u: any) {
      if (u.created_at < sevenDaysAgo && !depositedSet.has(u.id)) dormant++
      if (u.created_at < oneDayAgo && !depositedSet.has(u.id)) noDeposit++
    })
    var refSet = new Set<string>()
    ;(referrals || []).forEach(function(r: any) { if (!r.commission || r.commission === 0) refSet.add(r.referrer_id) })
    return NextResponse.json({ rules: [
      { name: 'Dormant Activation', status: 'active', affected: dormant, desc: 'Users inactive 7+ days with no deposits' },
      { name: 'Deposit Conversion', status: 'active', affected: noDeposit, desc: 'Users registered 24h+ with no deposit' },
      { name: 'Referral Boost', status: 'active', affected: refSet.size, desc: 'Referrers with no commission earned' },
      { name: 'High Value Detection', status: 'active', affected: highValue || 0, desc: 'Users with total deposit > $1,000' }
    ], total_affected: dormant + noDeposit + refSet.size + (highValue || 0) })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}

export async function POST(req: Request) {
  var auth = await verifyAdmin(req)
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()
    var oneDayAgo = new Date(Date.now() - 24 * 3600000).toISOString()
    var t = { dormant: 0, noDeposit: 0, referral: 0, highValue: 0 }
    var { data: allUsers } = await supabaseAdmin.from('profiles').select('id,created_at')
    var { data: depositors } = await supabaseAdmin.from('deposits').select('user_id').eq('status', 'approved')
    var depositedSet = new Set<string>()
    ;(depositors || []).forEach(function(d: any) { depositedSet.add(d.user_id) })
    ;(allUsers || []).forEach(function(u: any) {
      if (u.created_at < sevenDaysAgo && !depositedSet.has(u.id) && t.dormant < 20) {
        try { supabaseAdmin.from('notifications').insert({ user_id: u.id, title: 'Come back bonus available', message: 'You have a welcome back bonus waiting. Log in to claim it!' }) } catch(e) {}; t.dormant++
      }
      if (u.created_at < oneDayAgo && !depositedSet.has(u.id) && t.noDeposit < 20) {
        try { supabaseAdmin.from('notifications').insert({ user_id: u.id, title: 'First deposit bonus reminder', message: 'Make your first deposit today and get a bonus reward!' }) } catch(e) {}; t.noDeposit++
      }
    })
    var { data: referrals } = await supabaseAdmin.from('referrals').select('referrer_id,commission')
    var refSet = new Set<string>()
    ;(referrals || []).forEach(function(r: any) { if (!r.commission || r.commission === 0) refSet.add(r.referrer_id) })
    var refArr = Array.from(refSet).slice(0, 20)
    refArr.forEach(function(refId: string) {
      try { supabaseAdmin.from('notifications').insert({ user_id: refId, title: 'Your referrals are waiting', message: 'Your referrals need activation. Encourage them to deposit!' }) } catch(e) {}; t.referral++
    })
    var { data: highValueUsers } = await supabaseAdmin.from('profiles').select('id').gt('total_deposit', 1000)
    ;(highValueUsers || []).forEach(function(u: any) {
      try { supabaseAdmin.auth.admin.updateUserById(u.id, { user_metadata: { vip: true, vip_level: 'high_value' } }) } catch(e) {}; t.highValue++
    })
    await logAdminAction(auth.userId!, 'run_automation', null, null, t)
    return NextResponse.json({ success: true, triggered: t, total: t.dormant + t.noDeposit + t.referral + t.highValue })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}
