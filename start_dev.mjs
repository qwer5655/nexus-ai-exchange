
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const child = spawn('cmd.exe', ['/c', 'npx next dev --port 3002'], {
  cwd: __dirname,
  detached: true,
  stdio: ['ignore', 'pipe', 'pipe']
});
const log = fs.createWriteStream(path.join(__dirname, 'server3_log.txt'));
child.stdout.pipe(log);
child.stderr.pipe(log);
child.unref();
