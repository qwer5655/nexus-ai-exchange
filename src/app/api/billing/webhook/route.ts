import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function POST(req: Request) {
  var stripeKey = process.env.STRIPE_SECRET_KEY
  var webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (stripeKey && webhookSecret) {
    try {
      var buf = await req.text()
      var { default: Stripe } = await import('stripe')
      var stripe = new Stripe(stripeKey, { apiVersion: '2026-05-27.dahlia' })
      var sig = req.headers.get('stripe-signature') || ''
      var event = stripe.webhooks.constructEvent(buf, sig, webhookSecret)
      // Stripe event dedup
      try {
        var { data: existingEvent } = await supabaseAdmin.from('stripe_events').select('id').eq('event_id', event.id).maybeSingle()
        if (existingEvent) return NextResponse.json({ received: true, dedup: true })
      } catch {}
      try { await supabaseAdmin.from('stripe_events').insert({ event_id: event.id, type: event.type }) } catch {}

      if (event.type === 'checkout.session.completed') {
        var session = event.data.object as any
        var userId = session.metadata?.user_id || session.client_reference_id
        if (userId) {
          var subscriptionId = session.subscription
          var endDate: string | null = null
          if (subscriptionId) {
            try {
              var subRes = await stripe.subscriptions.retrieve(subscriptionId); var subData: any = subRes
              endDate = new Date(subData.current_period_end * 1000).toISOString()
            } catch {}
          }
          await supabaseAdmin.from('profiles').update({
            vip_level: 2, vip_src: 'stripe', vip_expires_at: endDate,
            stripe_customer_id: session.customer || null,
            stripe_subscription_id: subscriptionId || null
          }).eq('id', userId)
          try {
            var { data: existing } = await supabaseAdmin.from('user_credits').select('id').eq('user_id', userId).maybeSingle()
            if (!existing) await supabaseAdmin.from('user_credits').insert({ user_id: userId, credits: 100 })
          } catch {}
          await supabaseAdmin.from('system_events').insert({
            user_id: userId, event_type: 'subscription_created',
            metadata: { stripe_session_id: session.id, plan: 'vip' }
          })
        }
      }

      if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
        var sub = event.data.object as any
        var metadata = sub.metadata || {}
        var uid = metadata.user_id
        if (!uid && sub.customer) {
          var sessions = await stripe.checkout.sessions.list({ customer: sub.customer, limit: 1 })
          uid = sessions.data[0]?.metadata?.user_id
        }
        if (uid) {
          var active = event.type !== 'customer.subscription.deleted' && (sub.status === 'active' || sub.status === 'trialing')
          await supabaseAdmin.from('profiles').update({
            vip_level: active ? 2 : 0,
            vip_src: active ? 'stripe' : 'manual',
            vip_expires_at: active ? new Date(subData.current_period_end * 1000).toISOString() : null,
            stripe_subscription_id: active ? sub.id : null
          }).eq('id', uid)
          await supabaseAdmin.from('system_events').insert({
            user_id: uid, event_type: event.type === 'customer.subscription.deleted' ? 'subscription_cancelled' : 'subscription_updated',
            metadata: { stripe_subscription_id: sub.id, status: sub.status }
          })
        }
      }

      return NextResponse.json({ received: true })
    } catch(e: any) {
      return NextResponse.json({ error: (e as Error).message }, { status: 400 })
    }
  }

  // Dev mode: mock webhook
  try {
    var body = await req.json()
    var userId = body.user_id || body.metadata?.user_id
    if (userId) {
      var endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      await supabaseAdmin.from('profiles').update({
        vip_level: 2, vip_src: 'stripe', vip_expires_at: endDate
      }).eq('id', userId)
      try {
        var { data: existing } = await supabaseAdmin.from('user_credits').select('id').eq('user_id', userId).maybeSingle()
        if (!existing) await supabaseAdmin.from('user_credits').insert({ user_id: userId, credits: 100 })
      } catch {}
      await supabaseAdmin.from('system_events').insert({
        user_id: userId, event_type: 'subscription_created',
        metadata: { source: 'dev_webhook', plan: 'vip' }
      })
    }
    return NextResponse.json({ received: true, dev_mode: true })
  } catch(e: any) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}


