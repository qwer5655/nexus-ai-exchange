import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { getUserTier, DEFAULT_PRICING } from '@/lib/pricing'

export async function GET(req: Request) {
  var email = req.headers.get('x-admin-email')
  var userId: string | null = null

  if (email) {
    var { data: profile } = await supabaseAdmin.from('profiles').select('id').eq('email', email).maybeSingle()
    if (profile) userId = profile.id
  }

  var userTier = userId ? (await getUserTier(userId)).tier : 'free'
  var pricing = DEFAULT_PRICING[userTier] || DEFAULT_PRICING.free

  return NextResponse.json({
    tier: userTier,
    pricing: pricing,
    all_tiers: DEFAULT_PRICING
  })
}
