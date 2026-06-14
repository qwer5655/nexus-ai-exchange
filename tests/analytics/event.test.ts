// P1 Verification — analytics/event/route.ts
// Usage: npx tsx tests/analytics/event.test.ts

var BASE = 'http://localhost:3000'

async function main() {
  console.log('=== P1-EVENT TEST ===')

  // POST /api/analytics/event — track an event
  var res = await fetch(BASE + '/api/analytics/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'p1-test-user',
      eventName: 'page_view',
      eventData: { page: '/home', referrer: 'test' }
    })
  })
  var data = await res.json()
  console.log('Status:', res.status)
  if (res.status === 200 && data.success) {
    console.log('✅ Event tracked')
  } else {
    console.log('❌ Failed:', JSON.stringify(data).slice(0, 200))
  }

  // Test without eventName (should 400)
  var bad = await fetch(BASE + '/api/analytics/event', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'p1-test-user' })
  })
  var badData = await bad.json()
  console.log('Missing eventName:', bad.status, bad.status === 400 ? '✅' : '❌')

  console.log('=== EVENT TEST COMPLETE ===')
}
main().catch(function(e) { console.error('FATAL:', e) })
