// P1 Verification — analytics/export/route.ts
// Usage: npx tsx tests/analytics/export.test.ts

var BASE = 'http://localhost:3000'

async function main() {
  console.log('=== P1-EXPORT TEST ===')

  var types = ['users', 'deposits', 'unlocks', 'audit', 'invalid']
  for (var t of types) {
    var res = await fetch(BASE + '/api/analytics/export?type=' + t + '&since=2026-01-01')
    if (t === 'invalid') {
      console.log('Invalid type:', res.status, res.status === 400 ? '✅' : '❌')
    } else {
      var text = await res.text()
      var contentType = res.headers.get('content-type') || ''
      var isCsv = contentType.includes('text/csv') || text.startsWith('id')
      console.log(t + ' export:', res.status, isCsv ? '✅ CSV' : '❌', '(' + text.slice(0, 40) + '...)')
    }
  }

  console.log('=== EXPORT TEST COMPLETE ===')
}
main().catch(function(e) { console.error('FATAL:', e) })
