// P1 Verification — analytics/growth/route.ts
// Usage: npx tsx tests/analytics/growth.test.ts

var BASE = 'http://localhost:3000'
var ADMIN_EMAIL = 'benjoka912@gmail.com'

async function main() {
  console.log('=== P1-GROWTH TEST ===')

  // GET /api/analytics/growth (admin required)
  var res = await fetch(BASE + '/api/analytics/growth?days=90', {
    headers: { 'x-admin-email': ADMIN_EMAIL }
  })
  var data = await res.json()
  console.log('Status:', res.status)
  
  if (res.status === 200 && data.daily_registrations) {
    console.log('✅ Growth data returned')
    console.log('   Total registrations:', data.total_registrations)
    console.log('   Daily data points:', data.daily_registrations.length)
    console.log('   Acquisition sources:', data.acquisition_sources?.length || 0)
  } else if (res.status === 401) {
    console.log('❌ Unauthorized — check admin email/role')
  } else {
    console.log('❌ Unexpected:', JSON.stringify(data).slice(0, 200))
  }

  // Test without auth
  var noAuth = await fetch(BASE + '/api/analytics/growth')
  console.log('No-auth:', noAuth.status, noAuth.status === 401 ? '✅' : '❌')

  console.log('=== GROWTH TEST COMPLETE ===')
}
main().catch(function(e) { console.error('FATAL:', e) })
