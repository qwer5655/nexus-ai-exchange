import { spawn, execSync } from 'child_process'
var path = 'C:/Users/benjo/Documents/Codex/2026-06-07/codex-claude-code-cursor-devin-50/fifa-arbitrage'

// Kill old server
try { execSync('taskkill /f /im node.exe', { stdio: 'ignore' }) } catch(e) {}
await new Promise(function(r) { setTimeout(r, 2000) })

// Start server directly via node (avoids .cmd issues)
console.log('Starting server...')
var server = spawn('node', ['node_modules/next/dist/bin/next', 'start', '-p', '3000'], {
  cwd: path,
  stdio: 'pipe'
})

// Wait for server
var started = false
var output = ''
server.stdout.on('data', function(d) {
  output += d.toString()
  if (output.includes('Ready')) { started = true }
})
server.stderr.on('data', function(d) { output += d.toString() })

// Wait up to 15s
for (var i = 0; i < 15; i++) {
  if (started) break
  await new Promise(function(r) { setTimeout(r, 1000) })
}

if (!started) { console.log('SERVER_NOT_RUNNING'); console.log('Output:', output.slice(-200)); process.exit(1) }
console.log('SERVER: Running OK')

// Run acceptance test
console.log('Running acceptance test...')
try {
  var out = execSync('node --experimental-strip-types scripts/full-flow-acceptance.ts', {
    cwd: path,
    timeout: 120000,
    stdio: 'pipe',
    maxBuffer: 10 * 1024 * 1024
  })
  var txt = out.stdout?.toString() || ''
  console.log(txt)

  // Extract summary
  var summaryLines = txt.split('\n').filter(function(l) {
    return l.includes('Passed:') || l.includes('Failed:') || l.includes('Status:') || l.includes('TESTS')
  })
  console.log('\n=== FINAL RESULTS ===')
  summaryLines.forEach(function(l) { console.log(l) })
} catch(e) {
  var partial = e.stdout?.toString() || ''
  console.log('Test output (last 1000 chars):', partial.slice(-1000))
  var summary = partial.split('\n').filter(function(l) {
    return l.includes('Passed:') || l.includes('Failed:') || l.includes('Status:') || l.includes('FAIL')
  })
  console.log('\n=== FINAL RESULTS ===')
  summary.forEach(function(l) { console.log(l) })
}

// Done
server.kill()
console.log('\nP2 test complete')
