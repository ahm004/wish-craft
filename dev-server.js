// Local server: `npm run dev`, then open http://localhost:3000
// Serves public/ and runs the same api/*.js handlers that Vercel runs online.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(ROOT, 'public');

// Load .env (if any) before the API modules read process.env
try {
  for (const line of fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (m && !line.trim().startsWith('#') && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
} catch { /* no .env: test mode */ }

const PORT = Number(process.env.PORT || 3000);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp' };

function readBody(req, limit) {
  return new Promise((ok, bad) => {
    const chunks = []; let size = 0;
    req.on('data', (c) => { size += c.length; if (size > limit) { bad(new Error('too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => ok(Buffer.concat(chunks)));
    req.on('error', bad);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  try {
    if (url.pathname.startsWith('/api/')) {
      const name = url.pathname.slice(5);
      const file = path.join(ROOT, 'api', `${name}.js`);
      if (!/^[a-z-]+$/.test(name) || !fs.existsSync(file)) { res.statusCode = 404; return res.end('Not found'); }
      const raw = await readBody(req, 11 * 1024 * 1024);
      const isJson = (req.headers['content-type'] || '').includes('application/json');
      req.body = isJson ? JSON.parse(raw.toString('utf8') || '{}') : raw;
      const mod = await import(pathToFileURL(file).href);
      return mod.default(req, res);
    }
    let rel = url.pathname === '/' || /^\/w\/[A-Za-z0-9]+\/?$/.test(url.pathname) ? '/index.html' : decodeURIComponent(url.pathname);
    if (/^\/[a-z-]+$/.test(rel) && fs.existsSync(path.join(PUBLIC, `${rel}.html`))) rel += '.html'; // clean URLs like /terms
    const file = path.normalize(path.join(PUBLIC, rel));
    if (!file.startsWith(PUBLIC + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.statusCode = 404; return res.end('Not found'); }
    res.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-cache');
    fs.createReadStream(file).pipe(res);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) { res.statusCode = 500; res.end('Server error'); }
  }
});

server.listen(PORT, () => {
  const testPay = !process.env.RAZORPAY_KEY_ID, local = !process.env.SUPABASE_URL;
  console.log(`\n  WishCraft running → http://localhost:${PORT}\n`);
  console.log(`  Storage : ${local ? 'LOCAL test files in .data/' : 'Supabase'}`);
  console.log(`  Payments: ${testPay ? 'TEST MODE (no real money; add Razorpay keys to .env)' : process.env.RAZORPAY_KEY_ID.startsWith('rzp_test_') ? 'Razorpay TEST keys' : 'Razorpay LIVE keys'}\n`);
});
