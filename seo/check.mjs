// SEO health check:  node seo/check.mjs
// Reads every page in public/ and reports problems search engines care about.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PUB = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
const pages = fs.readdirSync(PUB).filter((f) => f.endsWith('.html'));
let problems = 0, warnings = 0;
const bad = (page, msg) => { problems++; console.log(`  ✗ ${page}: ${msg}`); };
const warn = (page, msg) => { warnings++; console.log(`  ! ${page}: ${msg}`); };
const titles = new Map(), descs = new Map();

for (const f of pages) {
  const h = fs.readFileSync(path.join(PUB, f), 'utf8');
  const get = (re) => (h.match(re) || [])[1];
  const title = get(/<title>([^<]*)<\/title>/), desc = get(/<meta name="description" content="([^"]*)"/);
  if (!title) bad(f, 'no <title>'); else {
    if (title.length > 65) warn(f, `title is ${title.length} characters (Google shows about 60)`);
    if (title.length < 20) warn(f, 'title is very short');
    if (titles.has(title)) bad(f, `same title as ${titles.get(title)}`); titles.set(title, f);
  }
  if (!desc) bad(f, 'no meta description'); else {
    if (desc.length > 165) warn(f, `description is ${desc.length} characters (about 155 are shown)`);
    if (desc.length < 70) warn(f, 'description is short');
    if (descs.has(desc)) bad(f, `same description as ${descs.get(desc)}`); descs.set(desc, f);
  }
  const h1 = (h.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) bad(f, `${h1} <h1> tags (should be exactly 1)`);
  if (!/<html lang="/.test(h)) bad(f, 'no lang attribute on <html>');
  if (!/<meta name="viewport"/.test(h)) bad(f, 'no viewport meta');
  if (!/<link rel="canonical" href="https:\/\/[^"]+">/.test(h)) warn(f, 'no absolute canonical link (set "website" in legal/business.json, run npm run seo)');
  if (!/property="og:image" content="https:\/\//.test(h)) warn(f, 'no absolute og:image');
  if (/<main[^>]*\shidden/.test(h) || /id="creator"[^>]*\shidden/.test(h)) bad(f, 'main content is hidden in the raw HTML');
  if (/<mark class="todo">/.test(h)) warn(f, 'still has yellow [placeholder] boxes (fill legal/business.json)');
  (h.match(/<img\b[^>]*>/g) || []).forEach((img) => { if (!/\salt=/.test(img)) bad(f, 'image without alt text'); });
  const ldBlocks = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  ldBlocks.forEach((m) => { try { JSON.parse(m[1]); } catch (e) { bad(f, 'JSON-LD is not valid JSON: ' + e.message); } });
  if ((f === 'index.html' || /-card\.html$/.test(f)) && !ldBlocks.length) warn(f, 'no JSON-LD structured data');
  // internal links must point at real files
  [...h.matchAll(/<a [^>]*href="(\/[^"#?]*)/g)].forEach((m) => {
    const p = m[1] === '/' ? 'index.html' : m[1].replace(/^\//, '');
    if (p.startsWith('w/') || p.startsWith('api/')) return;
    if (!fs.existsSync(path.join(PUB, p)) && !fs.existsSync(path.join(PUB, p + '.html'))) bad(f, `broken link ${m[1]}`);
  });
}
for (const need of ['robots.txt', 'favicon.svg', 'og.jpg', 'manifest.webmanifest', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png']) {
  if (!fs.existsSync(path.join(PUB, need))) bad(need, 'file missing');
}
if (!fs.existsSync(path.join(PUB, 'sitemap.xml'))) warn('sitemap.xml', 'missing (needs your web address)');
else {
  const sm = fs.readFileSync(path.join(PUB, 'sitemap.xml'), 'utf8');
  [...sm.matchAll(/<loc>https:\/\/[^/]+(\/[^<]*)<\/loc>/g)].forEach((m) => {
    const p = m[1] === '/' ? 'index.html' : m[1].replace(/^\//, '') + '.html';
    if (!fs.existsSync(path.join(PUB, p))) bad('sitemap.xml', `lists ${m[1]} but the page does not exist`);
  });
}
const og = path.join(PUB, 'og.jpg');
if (fs.existsSync(og) && fs.statSync(og).size > 300 * 1024) warn('og.jpg', 'larger than 300 KB; WhatsApp may skip big preview images');

console.log(`\n${pages.length} pages checked: ${problems} problem(s), ${warnings} warning(s)`);
process.exitCode = problems ? 1 : 0;
