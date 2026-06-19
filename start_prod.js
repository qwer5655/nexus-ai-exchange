const { spawn } = require('child_process');
const p = spawn('node', ['node_modules/next/dist/bin/next', 'start', '-p', '4200'], {
  cwd: 'C:/Users/benjo/Documents/Codex/2026-06-07/codex-claude-code-cursor-devin-50/fifa-arbitrage',
  detached: true,
  stdio: 'ignore'
});
p.unref();
console.log('PID: ' + p.pid);
