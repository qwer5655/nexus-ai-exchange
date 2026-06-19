import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function POST(req: Request) {
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

  var stripeKey = process.env.STRIPE_SECRET_KEY
  var priceId = process.env.STRIPE_PRICE_ID || 'price_vip_monthly'
  var appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4200'

  if (!stripeKey) {
    // Dev mode: mock checkout for testing
    try {
      await supabaseAdmin.from('profiles').update({ vip_level: 2, vip_src: 'stripe' }).eq('id', userId)
      await supabaseAdmin.from('system_events').insert({
        user_id: userId, event_type: 'subscription_created',
        metadata: { source: 'mock', plan: 'vip' }
      })
    } catch {}
    // Initialize credits
    try {
      var { data: existing } = await supabaseAdmin.from('user_credits').select('id').eq('user_id', userId).maybeSingle()
      if (!existing) await supabaseAdmin.from('user_credits').insert({ user_id: userId, credits: 100 })
    } catch {}
    return NextResponse.json({ url: appUrl + '/vip?success=true', mock: true, message: 'Dev mode: VIP activated' })
  }

  // Real Stripe integration
  try {
    var { default: Stripe } = await import('stripe')
    var stripe = new Stripe(stripeKey, { apiVersion: '2026-05-27.dahlia' })
    // Create Stripe customer
    var customer = await stripe.customers.create({ email: email || '', metadata: { user_id: userId } })
    try { await supabaseAdmin.from('profiles').update({ stripe_customer_id: customer.id }).eq('id', userId) } catch {}
    var session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: customer.id,
      customer_email: email || '',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: appUrl + '/vip?success=true',
      cancel_url: appUrl + '/vip?canceled=true',
      client_reference_id: userId,
      metadata: { user_id: userId }
    })
    if (session.subscription) {
      try { await supabaseAdmin.from('profiles').update({ stripe_subscription_id: session.subscription }).eq('id', userId) } catch {}
    }
    return NextResponse.json({ checkout_url: session.url, session_id: session.id, mode: 'stripe' })
  } catch(e: any) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
