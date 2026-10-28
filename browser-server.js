const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

const HOST = '127.0.0.1';
const PORT = 4173;
const ROOT = path.join(__dirname, 'renderer');
const TYPES = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.md':'text/markdown; charset=utf-8', '.png':'image/png', '.svg':'image/svg+xml' };

function openGame(url) {
  if (process.env.FART_NO_OPEN) return;
  if (process.env.FART_BROWSER === 'brave') {
    const locations = [
      path.join(process.env.LOCALAPPDATA || '', 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'),
      path.join(process.env.PROGRAMFILES || '', 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'),
      path.join(process.env['PROGRAMFILES(X86)'] || '', 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe')
    ];
    const brave = locations.find((file) => file && fs.existsSync(file));
    if (brave) {
      spawn(brave, [`--app=${url}`, '--start-fullscreen', '--autoplay-policy=no-user-gesture-required', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'], { detached:true, stdio:'ignore' }).unref();
      return;
    }
    console.warn('Brave was not found in a standard location; opening the default browser.');
  }
  spawn('cmd.exe', ['/c', 'start', '', url], { detached:true, stdio:'ignore' }).unref();
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${HOST}:${PORT}`);
  if (url.pathname === '/shutdown' && request.method === 'POST') {
    response.writeHead(200, { 'Content-Type':'text/plain', 'Access-Control-Allow-Origin':'http://127.0.0.1:4173' });response.end('Fart Button stopped');
    setTimeout(() => server.close(() => process.exit(0)), 100);
    return;
  }
  const requested = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname.slice(1));
  const file = path.resolve(ROOT, requested);
  if (!file.startsWith(`${ROOT}${path.sep}`) && file !== path.join(ROOT, 'index.html')) { response.writeHead(403); return response.end('Forbidden'); }
  fs.readFile(file, (error, data) => {
    if (error) { response.writeHead(404); return response.end('Not found'); }
    response.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });response.end(data);
  });
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    openGame(`http://${HOST}:${PORT}`);
    return;
  }
  console.error(error);process.exit(1);
});

server.listen(PORT, HOST, () => {
  const url = `http://${HOST}:${PORT}`;
  console.log(`The Fart Button is running at ${url}`);
  console.log('Keep this window open while playing. Press Ctrl+C to stop.');
  openGame(url);
});
