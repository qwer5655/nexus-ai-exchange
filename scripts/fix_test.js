var fs = require('fs');
var p = 'C:/Users/benjo/Documents/Codex/2026-06-07/codex-claude-code-cursor-devin-50/fifa-arbitrage/scripts/full-flow-acceptance.ts';
var c = fs.readFileSync(p, 'utf-8');

// Add environment check function
var envCheckFunc = 
async function checkEnvironment() {
  console.log('=== ENVIRONMENT CHECK ===')
  var env = { server_running: false, add_balance_rpc: false }

  // Check server
  try {
    var r = await fetch(BASE + '/api/health')
    if (r.status === 200) {
      env.server_running = true
      console.log('  SERVER: running')
    } else {
      console.log('  SERVER: status ' + r.status + ' - SERVER_NOT_RESTARTED')
      console.log('  Build has changed - restart required')
      process.exit(1)
    }
  } catch(e) {
    console.log('  SERVER: not reachable - ' + e.message)
    console.log('  SERVER_NOT_RESTARTED - start server on port 3000 first')
    process.exit(1)
  }

  // Check add_balance RPC
  try {
    var rpcR = await fetch(SU + '/rest/v1/rpc/add_balance', {
      method: 'POST',
      headers: { 'apikey': SK, 'Authorization': 'Bearer ' + SK, 'Content-Type': 'application/json' },
      body: '{}'
    })
    env.add_balance_rpc = rpcR.status < 500
    if (env.add_balance_rpc) {
      console.log('  RPC add_balance: exists')
    } else {
      console.log('  RPC add_balance: MISSING (status ' + rpcR.status + ')')
      console.log('  environment_error - ADD_BALANCE_RPC_MISSING')
      console.log('  Create RPC in Supabase Dashboard before running tests')
    }
  } catch(e) {
    console.log('  RPC add_balance: check failed - ' + e.message)
  }

  console.log('  Server running:', env.server_running)
  console.log('  RPC exists:', env.add_balance_rpc)
  return env
}
;

// Insert after function sleep() and before async function main()
c = c.replace('async function main()', envCheckFunc + '\nasync function main()');

// Add env check call at the beginning of main()
c = c.replace("  var report: any = { timestamp: new Date().toISOString(), tests: {}, passed: 0, failed: 0, status: 'PASS', failed_tests: [] }",
"  var report: any = { timestamp: new Date().toISOString(), tests: {}, passed: 0, failed: 0, status: 'PASS', failed_tests: [] }\n  var environment = await checkEnvironment()");

// Add environment to report output
c = c.replace("report.status = report.failed === 0 ? 'PASS' : 'FAIL'",
"  report.environment = environment\n  report.status = report.failed === 0 ? 'PASS' : 'FAIL'");

fs.writeFileSync(p, c, 'utf-8');
console.log('Done');
