import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { verifyAuth } from '@/lib/admin-auth'

export async function GET(req: Request) {
  try {
    var auth = await verifyAuth(req)
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
    var url = new URL(req.url)
    var queryUserId = url.searchParams.get('userId')
    var userId = auth.userId!

    var { data: referrals } = await supabaseAdmin.from('referrals').select('*').eq('referrer_id', userId).order('created_at', { ascending: false })
    var { data: profile } = await supabaseAdmin.from('profiles').select('referral_code, total_profit').eq('id', userId).single()

    // Enrich with referred user profile info
    var referredIds = (referrals || []).map(function(r) { return r.referred_user_id })
    var referredProfiles: Record<string, any> = {}
    if (referredIds.length > 0) {
      var { data: profiles } = await supabaseAdmin.from('profiles').select('id,username,email,created_at,balance,total_deposit').in('id', referredIds)
      ;(profiles || []).forEach(function(p) { referredProfiles[p.id] = p })
    }

    var enriched = (referrals || []).map(function(r) {
      var rp = referredProfiles[r.referred_user_id] || {}
      return {
        ...r,
        referred_username: rp.username || null,
        referred_email: rp.email || null,
        referred_created_at: rp.created_at || null,
        is_active: (rp.balance || 0) > 0 || (rp.total_deposit || 0) > 0
      }
    })

    var totalCommission = (referrals || []).reduce(function(sum, r) { return sum + (r.commission || 0) }, 0)
    var activeReferrals = enriched.filter(function(r) { return r.is_active }).length

    return NextResponse.json({
      referral_code: profile?.referral_code || '',
      total_referrals: (referrals || []).length,
      active_referrals: activeReferrals,
      total_commission: totalCommission,
      pending_commission: 0,
      paid_commission: totalCommission,
      referrals: enriched
    })
  } catch(e: any) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

