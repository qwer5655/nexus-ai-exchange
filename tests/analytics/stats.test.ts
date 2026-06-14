// P1 Verification — analytics/stats/route.ts
// Usage: npx tsx tests/analytics/stats.test.ts

var BASE = 'http://localhost:3000'

async function main() {
  console.log('=== P1-STATS TEST ===')

  // GET /api/analytics/stats (no auth required)
  var res = await fetch(BASE + '/api/analytics/stats?days=30')
  var data = await res.json()
  console.log('Status:', res.status)
  
  if (res.status === 200) {
    console.log('✅ Stats returned')
    console.log('   Registrations:', JSON.stringify(data.registrations || {}).slice(0, 80))
    console.log('   Deposits:', JSON.stringify(data.deposits || {}).slice(0, 80))
    console.log('   Unlocks:', JSON.stringify(data.unlocks || {}).slice(0, 80))
    console.log('   Referrals:', JSON.stringify(data.referrals || {}).slice(0, 80))
  } else {
    console.log('❌ Failed:', JSON.stringify(data).slice(0, 200))
  }

  console.log('=== STATS TEST COMPLETE ===')
}
main().catch(function(e) { console.error('FATAL:', e) })
