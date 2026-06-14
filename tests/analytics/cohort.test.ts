// P1 Verification — analytics/cohort/route.ts
// Usage: npx tsx tests/analytics/cohort.test.ts

var BASE = 'http://localhost:3000'
var ADMIN_EMAIL = 'benjoka912@gmail.com'

async function main() {
  console.log('=== P1-COHORT TEST ===')

  // GET /api/analytics/cohort (admin required)
  var res = await fetch(BASE + '/api/analytics/cohort', {
    headers: { 'x-admin-email': ADMIN_EMAIL }
  })
  var data = await res.json()
  console.log('Status:', res.status)
  
  if (res.status === 200 && data.cohorts) {
    console.log('✅ Cohorts returned:', data.cohorts.length)
    if (data.cohorts.length > 0) {
      console.log('   Sample keys:', Object.keys(data.cohorts[0]).join(', '))
    }
  } else if (res.status === 401) {
    console.log('❌ Unauthorized — check admin email/role')
  } else {
    console.log('❌ Unexpected response:', JSON.stringify(data).slice(0, 200))
  }
  
  // Test without auth (should 401)
  var noAuth = await fetch(BASE + '/api/analytics/cohort')
  console.log('No-auth status:', noAuth.status, noAuth.status === 401 ? '✅' : '❌')
  
  console.log('=== COHORT TEST COMPLETE ===')
}
main().catch(function(e) { console.error('FATAL:', e) })
