// NEXUS AI Exchange — Production Reverse Proxy
const http = require('http');
const TARGET = { host: '127.0.0.1', port: 3000 };
const PORT = 80;
http.createServer((req, res) => {
  const opts = { hostname: TARGET.host, port: TARGET.port, path: req.url, method: req.method, headers: req.headers };
  const pr = http.request(opts, (pr2) => { res.writeHead(pr2.statusCode, pr2.headers); pr2.pipe(res); });
  pr.on('error', (e) => { console.error('Proxy:', e.message); res.writeHead(502); res.end('Bad Gateway'); });
  req.pipe(pr);
}).on('error', (e) => {
  if (e.code === 'EACCES') console.error('Port 80 needs Administrator!');
  else console.error('Error:', e.message);
}).listen(PORT, '0.0.0.0', () => {
  console.log('Proxy: http://0.0.0.0:80 -> http://localhost:3000');
});
