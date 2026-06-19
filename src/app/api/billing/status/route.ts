import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserTier } from '@/lib/pricing'

export async function GET(req: Request) {
  var authHeader = req.headers.get('authorization')
  var email = req.headers.get('x-admin-email')
  var userId: string | null = null

  if (authHeader?.startsWith('Bearer ')) {
    var token = authHeader.slice(7)
    var { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (user) userId = user.id
  }
  if (!userId && email) {
    var { data: profile } = await supabaseAdmin.from('profiles').select('id').eq('email', email).maybeSingle()
    if (profile) userId = profile.id
  }
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    var { data: profile } = await supabaseAdmin.from('profiles').select('vip_level,vip_expires_at,vip_src,stripe_customer_id,stripe_subscription_id')
      .eq('id', userId).maybeSingle()
    var vipLevel = profile?.vip_level || 0
    var expiresAt = profile?.vip_expires_at || null
    var src = profile?.vip_src || 'manual'
    var expired = expiresAt ? new Date(expiresAt) < new Date() : false
    var active = vipLevel > 0 && !expired

    // Get credits and tier
    var credits = 0
    try {
      var { data: cr } = await supabaseAdmin.from('user_credits').select('credits').eq('user_id', userId).maybeSingle()
      credits = cr?.credits ?? 0
    } catch {}

    var tierData = await getUserTier(userId)

    return NextResponse.json({
      plan: tierData.tier,
      active: active,
      vip_level: vipLevel,
      tier: tierData.tier,
      expires_at: expiresAt,
      source: active ? (src || 'manual') : null,
      credits: credits,
      stripe_customer_id: profile?.stripe_customer_id || null,
      subscription_id: profile?.stripe_subscription_id || null
    })
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

