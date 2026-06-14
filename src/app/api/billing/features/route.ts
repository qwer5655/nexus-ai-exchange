import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getPlan, getFeatureAccess, checkLimit } from '@/lib/plans'

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
    var { data: profile } = await supabaseAdmin.from('profiles').select('vip_level').eq('id', userId).maybeSingle()
    var vipLevel = profile?.vip_level || 0
    var planName = vipLevel >= 2 ? 'enterprise' : vipLevel >= 1 ? 'pro' : 'free'
    var plan = getPlan(planName)
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 500 })

    return NextResponse.json({
      plan: planName,
      features: plan.features,
      limits: plan.limits
    })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}
