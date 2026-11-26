// Makes the favicon PNGs, app icons and the link-preview image (og.jpg) using your local Chrome.
// Run once (or after changing the artwork):  node seo/make-images.mjs
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUB = path.join(ROOT, 'public');
const CHROME = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find((p) => p && fs.existsSync(p));
if (!CHROME) { console.error('Chrome not found. Set CHROME_PATH to your chrome.exe'); process.exit(1); }

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wc-seo-'));
const css = pathToFileURL(path.join(PUB, 'style.css')).href, ted = pathToFileURL(path.join(PUB, 'teddy.js')).href;
const fonts = '<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=DM+Sans:wght@500;700&family=Fraunces:ital,opsz,wght@0,9..144,900;1,9..144,700&display=swap" rel="stylesheet">';
const bearSvg = fs.readFileSync(path.join(PUB, 'favicon.svg'), 'utf8');

const pages = {
  icon: `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;width:100%;height:100%}body{display:grid;place-items:center;background:radial-gradient(circle at 30% 20%,#ff6fa8 0,#6a1f7a 55%,#1d0b3a 100%)}svg{width:78%;height:78%;filter:drop-shadow(0 4px 6px rgba(0,0,0,.35))}</style>${bearSvg}`,
  og: `<!doctype html><meta charset="utf-8">${fonts}<link rel="stylesheet" href="${css}">
<style>html,body{margin:0;width:1200px;height:630px;overflow:hidden}
body{position:relative;background:radial-gradient(900px 600px at 85% 30%,#a3236a 0,transparent 60%),radial-gradient(700px 500px at 0% 100%,#4a1d7a 0,transparent 65%),#150b2b;color:#fff7fb;font-family:'DM Sans',sans-serif}
.brand{position:absolute;left:70px;top:56px;font:900 34px 'Fraunces',serif;display:flex;align-items:center;gap:12px}.brand i{color:#ffcc4d;font-style:normal}
h1{position:absolute;left:70px;top:170px;margin:0;width:620px;font:900 96px/0.98 'Fraunces',serif;letter-spacing:-.03em}
h1 em{font-style:italic;font-weight:700;background:linear-gradient(100deg,#ffcc4d,#ff6fa8);-webkit-background-clip:text;color:transparent}
p{position:absolute;left:70px;top:430px;margin:0;width:600px;font:500 31px/1.35 'DM Sans',sans-serif;color:rgba(255,247,251,.85)}
.pill{position:absolute;left:70px;top:536px;padding:14px 28px;border-radius:99px;background:linear-gradient(135deg,#ffcc4d,#ff6fa8);color:#1a0b18;font:700 28px 'DM Sans',sans-serif}
#stage{position:absolute;right:30px;bottom:0;width:520px;height:480px}
#stage .mascot{position:absolute;bottom:20px;width:250px;margin:0}#stage .him{left:0}#stage .her{left:240px}
.ring{position:absolute;right:60px;top:90px;width:420px;height:420px;border-radius:50%;border:3px dashed rgba(255,204,77,.45)}
.glow{position:absolute;right:20px;top:50px;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(255,111,168,.55),transparent 68%)}
</style>
<body data-theme="proposal"><div class="glow"></div><div class="ring"></div>
<div class="brand"><i>✦</i> WishCraft</div>
<h1>Say it with a <em>little magic.</em></h1>
<p>Animated birthday, proposal &amp; Valentine cards with teddies, photos and music.</p>
<div class="pill">Preview free · just ₹35</div>
<div id="stage"></div>
<script src="${ted}"></script>
<script>const s=document.getElementById('stage');const a=Teddy.make({gender:'m',mood:'happy',prop:'rose'}),b=Teddy.make({gender:'f',mood:'shy'});a.el.classList.add('him');b.el.classList.add('her');s.append(b.el,a.el);document.querySelectorAll('*').forEach(e=>e.style.animation='none');document.fonts.ready.then(()=>document.title='ready')</script>`,
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const port = 9600 + Math.floor(Math.random() * 300);
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(tmp, 'profile')}`, '--allow-file-access-from-files', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
let ws, seq = 0; const pending = new Map();
for (let i = 0; i < 80; i++) { try { const l = await (await fetch(`http://localhost:${port}/json/list`)).json(); const p = l.find((t) => t.type === 'page'); if (p) { ws = new WebSocket(p.webSocketDebuggerUrl); break; } } catch {} await sleep(250); }
await new Promise((r) => ws.addEventListener('open', r));
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const cdp = (method, params = {}) => new Promise((r) => { const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
await cdp('Page.enable');

async function render(html, w, h, file, format = 'png') {
  const f = path.join(tmp, `${Math.random().toString(36).slice(2)}.html`);
  fs.writeFileSync(f, html);
  await cdp('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false });
  await cdp('Page.navigate', { url: pathToFileURL(f).href });
  await sleep(3500); // fonts + artwork
  const r = await cdp('Page.captureScreenshot', format === 'jpeg' ? { format, quality: 88 } : { format });
  fs.writeFileSync(path.join(PUB, file), Buffer.from(r.result.data, 'base64'));
  console.log('  ✓ public/' + file, Math.round(fs.statSync(path.join(PUB, file)).size / 1024) + ' KB');
}

await render(pages.icon, 180, 180, 'apple-touch-icon.png');
await render(pages.icon, 192, 192, 'icon-192.png');
await render(pages.icon, 512, 512, 'icon-512.png');
await render(pages.icon, 48, 48, 'favicon-48.png');
await render(pages.og, 1200, 630, 'og.jpg', 'jpeg');
ws.close(); chrome.kill();
await sleep(1200);
try { fs.rmSync(tmp, { recursive: true, force: true }); } catch { /* temp folder is cleaned up by the OS later */ }
