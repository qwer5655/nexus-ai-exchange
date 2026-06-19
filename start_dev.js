
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const dir = 'C:\\Users\\benjo\\Documents\\Codex\\2026-06-07\\codex-claude-code-cursor-devin-50\\fifa-arbitrage';
const logFile = path.join(dir, 'server3_log.txt');
const child = spawn('cmd.exe', ['/c', 'npx next dev --port 3002'], {
  cwd: dir,
  detached: true,
  stdio: ['ignore', 'pipe', 'pipe']
});
const log = fs.createWriteStream(logFile);
child.stdout.pipe(log);
child.stderr.pipe(log);
child.unref();
