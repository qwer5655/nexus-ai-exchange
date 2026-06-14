// P1 Verification — analytics/retention/route.ts
// Usage: npx tsx tests/analytics/retention.test.ts

var BASE = 'http://localhost:3000'
var ADMIN_EMAIL = 'benjoka912@gmail.com'

async function main() {
  console.log('=== P1-RETENTION TEST ===')

  // GET /api/analytics/retention (admin required)
  var res = await fetch(BASE + '/api/analytics/retention', {
    headers: { 'x-admin-email': ADMIN_EMAIL }
  })
  var data = await res.json()
  console.log('Status:', res.status)
  
  if (res.status === 200 && data.retention) {
    console.log('✅ Retention data returned')
    for (var r of data.retention) {
      console.log('   ' + r.period + ': cohort=' + r.cohort_size + ' retained=' + r.retained + ' rate=' + r.rate + '%')
    }
  } else if (res.status === 401) {
    console.log('❌ Unauthorized — check admin email/role')
  } else {
    console.log('❌ Unexpected:', JSON.stringify(data).slice(0, 200))
  }

  console.log('=== RETENTION TEST COMPLETE ===')
}
main().catch(function(e) { console.error('FATAL:', e) })
