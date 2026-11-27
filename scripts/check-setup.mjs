// npm run check:setup
// Checks the settings in your local .env file and tells you, in plain words, what is missing or wrong.
// It only READS from Supabase (it creates, changes and deletes nothing) and never prints your secret keys.
// Note: Vercel keeps its OWN copy of these settings (Project → Settings → Environment Variables).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const envFile = process.env.ENV_FILE || path.join(ROOT, '.env');
try {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (m && !line.trim().startsWith('#') && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
} catch { /* no .env file */ }

let bad = 0, warn = 0;
const good = (t) => console.log(`  \x1b[32m✓\x1b[0m ${t}`);
const fail = (t, fix) => { bad++; console.log(`  \x1b[31m✗\x1b[0m ${t}${fix ? `\n      → ${fix}` : ''}`); };
const note = (t, fix) => { warn++; console.log(`  \x1b[33m!\x1b[0m ${t}${fix ? `\n      → ${fix}` : ''}`); };
const mask = (s) => (s.length > 12 ? `${s.slice(0, 6)}…${s.slice(-3)}` : '…');
const env = (k) => String(process.env[k] || '').trim();

console.log('\nSupabase (where cards and photos are kept)');
const url = env('SUPABASE_URL'), key = env('SUPABASE_SERVICE_KEY'), bucket = env('SUPABASE_BUCKET') || 'wish-media';
let canCall = false;
if (!url && !key) {
  note('Supabase is not set up in this .env file, so the site runs in TEST MODE (files saved on this computer only).', 'That is fine for trying things out. For the real site, fill these in on Vercel (see README → "Set up Supabase").');
} else {
  if (!url) fail('SUPABASE_URL is empty.', 'Supabase → Project Settings → API → "Project URL". It looks like https://abcdefghijklmnopqrst.supabase.co');
  else if (!/^https:\/\//.test(url)) fail(`SUPABASE_URL must start with https:// (yours starts: ${url.slice(0, 12)}…)`);
  else if (/\/(rest|storage|auth)\b/.test(url) || /supabase\.co\/.+/.test(url)) fail('SUPABASE_URL has extra text after .supabase.co.', 'Use only the main address, for example https://abcdefghijklmnopqrst.supabase.co (no /rest/v1, no slash at the end).');
  else if (url.endsWith('/')) fail('SUPABASE_URL ends with "/".', 'Remove the slash at the end.');
  else if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)) note(`SUPABASE_URL (${url}) does not look like https://xxxx.supabase.co. Fine only if you use a custom domain.`);
  else good(`SUPABASE_URL looks right (${url})`);

  if (!key) fail('SUPABASE_SERVICE_KEY is empty.', 'Supabase → Project Settings → API → the SECRET key ("service_role"). Not the public/anon key.');
  else if (/^sb_publishable_/.test(key)) fail('SUPABASE_SERVICE_KEY is the PUBLIC (publishable) key.', 'Use the secret key instead: it starts with sb_secret_ (or the long "service_role" key).');
  else if (/^sb_secret_/.test(key)) good(`SUPABASE_SERVICE_KEY is a secret key (${mask(key)})`);
  else if (/^eyJ/.test(key)) {
    let role = '?';
    try { role = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString('utf8')).role; } catch { /* not a normal JWT */ }
    if (role === 'service_role') good(`SUPABASE_SERVICE_KEY is the service_role key (${mask(key)})`);
    else if (role === 'anon') fail('SUPABASE_SERVICE_KEY is the PUBLIC "anon" key.', 'Use the "service_role" key (click Reveal next to it).');
    else note(`SUPABASE_SERVICE_KEY is a JWT with role "${role}". Expected "service_role".`);
  } else note('SUPABASE_SERVICE_KEY has an unusual format. Make sure you copied the whole secret key.');

  canCall = bad === 0 && url && key;
}

async function sb(p) {
  const headers = { apikey: key };
  if (key.startsWith('eyJ')) headers.Authorization = `Bearer ${key}`;
  const r = await fetch(url + p, { headers, signal: AbortSignal.timeout(12000) });
  const text = await r.text();
  let json = null; try { json = JSON.parse(text); } catch { /* not JSON */ }
  return { status: r.status, json, text };
}

if (canCall) {
  try {
    const t = await sb('/rest/v1/cards?select=id,expires_at&limit=1');
    if (t.status === 200) good('Connected. The "cards" table exists and is up to date.');
    else if (t.status === 401 || t.status === 403) fail('Supabase refused the key (401/403).', 'The key is wrong, or belongs to a different project than SUPABASE_URL. Copy both again from the same project.');
    else if (t.json && (t.json.code === 'PGRST205' || t.json.code === '42P01' || t.status === 404)) fail('Connected, but the "cards" table does not exist yet.', 'Supabase → SQL Editor → New query → paste everything from supabase/schema.sql → Run.');
    else if (t.json && (t.json.code === '42703' || /expires_at/.test(t.text))) fail('The "cards" table is missing the newer "expires_at" column.', 'Run supabase/schema.sql again in the SQL Editor (it is safe to run twice).');
    else fail(`Supabase answered ${t.status}: ${t.text.slice(0, 140)}`);

    const b = await sb(`/storage/v1/bucket/${encodeURIComponent(bucket)}`);
    if (b.status === 200 && b.json) {
      good(`Photo bucket "${bucket}" exists.`);
      if (b.json.public) fail(`The bucket "${bucket}" is PUBLIC, so anyone could see photos.`, 'Run supabase/schema.sql again, or in Storage → the bucket → edit → turn "Public bucket" off.');
      else good('The bucket is private (photos are only shown through temporary links).');
    } else if (b.status === 404 || (b.json && /not found/i.test(String(b.json.message || b.json.error)))) fail(`The photo bucket "${bucket}" does not exist yet.`, 'Run supabase/schema.sql in the SQL Editor: it creates the bucket.');
    else if (b.status === 401 || b.status === 403) fail('Supabase refused the key when checking the bucket.', 'Use the secret/service_role key.');
    else fail(`Checking the bucket gave ${b.status}: ${b.text.slice(0, 140)}`);
  } catch (e) {
    fail(`Could not reach ${url} (${e.cause?.code || e.name}).`, 'Check SUPABASE_URL for typos and that the project is not paused (Supabase dashboard → Restore).');
  }
}

console.log('\nRazorpay (payments)');
const kid = env('RAZORPAY_KEY_ID'), ksec = env('RAZORPAY_KEY_SECRET');
if (!kid && !ksec) note('Razorpay is not set up in this .env, so payments run in TEST MODE ("Pretend to pay").', 'For real payments add the keys on Vercel.');
else {
  if (!/^rzp_(test|live)_[A-Za-z0-9]+$/.test(kid)) fail('RAZORPAY_KEY_ID should look like rzp_test_xxxx or rzp_live_xxxx.');
  else if (kid.startsWith('rzp_live_')) note('RAZORPAY_KEY_ID is a LIVE key: payments made with it move real money, also when you test on this computer.', 'Use a rzp_test_ key in this local .env and keep the live key on Vercel only.');
  else good('RAZORPAY_KEY_ID is a test key (no real money).');
  if (ksec.length < 10) fail('RAZORPAY_KEY_SECRET is missing or too short.'); else good('RAZORPAY_KEY_SECRET is set.');
}

console.log('\nPrice and clean-up');
const price = Number(env('PRICE_INR') || 30), list = Number(env('LIST_PRICE_INR') || 35);
good(`You charge ₹${price}${list > price ? ` (usual price ₹${list}, a ₹${list - price} discount)` : ''}.`);
if (!(price >= 1)) fail('PRICE_INR must be at least 1.');
good(`Cards and photos are deleted ${env('CARD_LIFETIME_DAYS') || 7} days after payment.`);
if (!env('CRON_SECRET')) note('CRON_SECRET is empty in this .env.', 'Add CRON_SECRET (any long random text) on Vercel so the daily clean-up can run.');
else good('CRON_SECRET is set.');

console.log(`\n${bad ? `\x1b[31m${bad} problem(s) to fix.\x1b[0m` : '\x1b[32mNo problems found.\x1b[0m'}${warn ? ` ${warn} note(s).` : ''}`);
console.log('Remember: this checks the .env file on THIS computer. Vercel has its own copy: Project → Settings → Environment Variables.\n');
process.exitCode = bad ? 1 : 0;
