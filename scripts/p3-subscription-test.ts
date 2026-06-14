export {}
﻿// P3-1 Stripe Subscription Test
// Usage: npx tsx scripts/p3-subscription-test.ts

var BASE = 'http://localhost:3000'
var ADMIN_EMAIL = 'benjoka912@gmail.com'

async function main() {
  console.log('=== P3-1 STRIPE SUBSCRIPTION TEST ===')

  // Step 1: Check dev mode (no real Stripe key)
  console.log('\\n--- Step 1: Dev Mode Check ---')
  var stripeKey = process.env.STRIPE_SECRET_KEY
  console.log('  STRIPE_SECRET_KEY:', stripeKey?.includes('sk_test') ? 'set (placeholder)' : stripeKey || 'not set')
  console.log('  STRIPE_MODE:', process.env.STRIPE_MODE || 'not set')

  // Step 2: Call subscribe API
  console.log('\\n--- Step 2: Create Checkout Session ---')
  try {
    var res = await fetch(BASE + '/api/billing/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-email': ADMIN_EMAIL },
      body: JSON.stringify({
        userId: 'test-user',
        email: 'test@example.com'
      })
    })
    var data = await res.json()
    console.log('  Status:', res.status)
    console.log('  Response:', JSON.stringify(data, null, 2))
    
    if (data.url) {
      console.log('  ✅ Checkout URL returned:', data.url)
    } else if (data.mock) {
      console.log('  ✅ Dev mode mock activated')
    } else {
      console.log('  ❌ No checkout URL returned')
    }
  } catch(e: any) {
    console.log('  ❌ Error:', e.message)
  }

  // Step 3: Test dev webhook
  console.log('\\n--- Step 3: Dev Webhook Test ---')
  try {
    var whRes = await fetch(BASE + '/api/billing/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'checkout.session.completed',
        metadata: { user_id: 'test-user' }
      })
    })
    var whData = await whRes.json()
    console.log('  Status:', whRes.status)
    console.log('  Response:', JSON.stringify(whData, null, 2))
    if (whData.received) {
      console.log('  ✅ Webhook received')
    }
  } catch(e: any) {
    console.log('  ❌ Error:', e.message)
  }

  console.log('\\n=== P3-1 TEST COMPLETE ===')
}

main().catch(function(e) { console.error('FATAL:', e) })
