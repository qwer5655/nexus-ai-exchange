// WALLET CRUD VERIFICATION 2.0
import http from 'node:http'

const HOST = 'localhost', PORT = 3000
const BASE = '/api/admin/payment/wallets'
const HDR = { 'x-admin-email': 'benjoka912@gmail.com', 'Content-Type': 'application/json' }

function apiReq(method, path, body) {
  return new Promise((resolve, reject) => {
    const opts = { hostname: HOST, port: PORT, path: BASE + (path || ''), method, headers: HDR, timeout: 8000 }
    const req = http.request(opts, (res) => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }) }
        catch(e) { resolve({ status: res.statusCode, body: data, parseError: e.message }) }
      })
    })
    req.on('error', e => reject(e.message))
    req.setTimeout(8000, () => { req.destroy(); reject('TIMEOUT') })
    if (body) req.write(JSON.stringify(body))
    req.end()
  })
}

const report = { checks: [], passed: 0, failed: 0, status: 'RUNNING' }
function ok(name) { report.checks.push({ name, passed: true }); report.passed++; process.stdout.write('  ✅ ' + name + '\n') }
function fail(name, detail) { report.checks.push({ name, passed: false, detail }); report.failed++; process.stdout.write('  ❌ ' + name + (detail ? ': ' + detail : '') + '\n') }

process.stdout.write('=== WALLET CRUD VERIFICATION ===\n\n')

// 1. GET initial list
const g1 = await apiReq('GET')
g1.status === 200 ? ok('GET wallets returns 200') : fail('GET returns 200', g1.status + ' ' + JSON.stringify(g1.body).slice(0,100))
const wl = g1.body?.wallets || []
const c0 = wl.length
process.stdout.write('  Current wallets: ' + c0 + '\n\n')

// 2. POST create
const addr = 'T' + Date.now()
const p1 = await apiReq('POST', '', { name: 'CRUDTest', currency: 'ETH', network: 'ERC20', address: addr, provider: 'crypto', enabled: true, sort_order: 5 })
const wid = p1.body?.wallet?.id
p1.status === 200 && wid ? ok('POST creates wallet: ' + wid) : fail('POST creates wallet', (p1.status||'?') + ' ' + JSON.stringify(p1.body).slice(0,120))
process.stdout.write('\n')

// 3. GET after POST
const g2 = await apiReq('GET')
g2.body?.wallets?.length === c0 + 1 ? ok('GET after POST: +1 wallet') : fail('GET after POST count', (g2.body?.wallets?.length||0) + ' vs expected ' + (c0+1))
g2.body?.wallets?.some(w => w.id === wid) ? ok('New wallet in list') : fail('New wallet not found')
process.stdout.write('\n')

// 4. PATCH edit
const p2 = await apiReq('PATCH', '', { id: wid, name: 'EditedWallet', sort_order: 999 })
p2.status === 200 ? ok('PATCH returns 200') : fail('PATCH returns 200', p2.status+'')
p2.body?.wallet?.name === 'EditedWallet' ? ok('PATCH updates name') : fail('PATCH name update', JSON.stringify(p2.body?.wallet).slice(0,100))
process.stdout.write('\n')

// 5. GET after PATCH
const g3 = await apiReq('GET')
const pw = g3.body?.wallets?.find(w => w.id === wid)
pw?.name === 'EditedWallet' ? ok('GET shows edited name') : fail('GET edited name', pw?.name)
pw?.sort_order === 999 ? ok('GET shows edited sort_order') : fail('GET edited sort_order', pw?.sort_order+'')
process.stdout.write('\n')

// 6. DELETE
const d1 = await apiReq('DELETE', '?id=' + wid)
d1.status === 200 ? ok('DELETE returns 200') : fail('DELETE returns 200', d1.status+'')
process.stdout.write('\n')

// 7. GET after DELETE
const g4 = await apiReq('GET')
g4.body?.wallets?.length === c0 ? ok('GET after DELETE: count restored') : fail('GET after DELETE count', (g4.body?.wallets?.length||0)+' vs '+c0)
!g4.body?.wallets?.some(w => w.id === wid) ? ok('Deleted wallet gone') : fail('Wallet still exists after DELETE')
process.stdout.write('\n')

// 8. Toggle status
if (g1.body?.wallets?.length > 0) {
  const tw = g1.body.wallets[0]
  const t1 = await apiReq('PATCH', '', { id: tw.id, enabled: !tw.enabled })
  t1.status === 200 ? ok('TOGGLE returns 200') : fail('TOGGLE returns 200', t1.status+'')
  const g5 = await apiReq('GET')
  g5.body?.wallets?.find(w => w.id === tw.id)?.enabled === !tw.enabled ? ok('TOGGLE flips enabled') : fail('TOGGLE enabled state')
  // Restore
  await apiReq('PATCH', '', { id: tw.id, enabled: tw.enabled })
} else { ok('SKIP toggle (no wallets)') }
process.stdout.write('\n')

// Summary
report.status = report.failed > 0 ? 'PARTIAL FAILURE' : 'ALL PASSED'
process.stdout.write('=== RESULTS ===\n')
process.stdout.write('Passed: ' + report.passed + ' / Failed: ' + report.failed + '\n')
process.stdout.write('Status: ' + report.status + '\n')

const fs = await import('node:fs')
fs.writeFileSync('outputs/wallet-crud-report.json', JSON.stringify(report, null, 2))
process.stdout.write('\nReport: outputs/wallet-crud-report.json\n')