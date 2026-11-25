// Storage for cards and their media.
//  - With SUPABASE_URL set: Supabase Postgres (table "cards") + a private Storage bucket.
//  - Without it (local only): JSON file + files in ./.data so you can try everything offline.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { httpError } from './http.js';

const SB_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SB_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const BUCKET = process.env.SUPABASE_BUCKET || 'wish-media';
export const LOCAL_MODE = !SB_URL;
const READ_TTL = 60 * 60 * 24 * 7; // signed media links last 7 days (refreshed on every open)

function assertConfigured() {
  if (LOCAL_MODE && process.env.VERCEL) throw httpError(500, 'Server is not configured yet (missing SUPABASE_URL).');
  if (!LOCAL_MODE && !SB_KEY) throw httpError(500, 'Server is not configured yet (missing SUPABASE_SERVICE_KEY).');
}

/* ---------------- Supabase ---------------- */
function sbHeaders(extra = {}) {
  const h = { apikey: SB_KEY, ...extra };
  if (SB_KEY.startsWith('eyJ')) h.Authorization = `Bearer ${SB_KEY}`; // legacy service_role JWT
  return h;
}
async function sb(pathname, { method = 'GET', body, headers = {} } = {}) {
  const r = await fetch(`${SB_URL}${pathname}`, {
    method,
    headers: sbHeaders({ 'Content-Type': 'application/json', ...headers }),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`Supabase ${method} ${pathname} -> ${r.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

/* ---------------- Local (dev only) ---------------- */
const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'cards.json');
export const MEDIA_DIR = path.join(DATA_DIR, 'media');
const DEV_SECRET = process.env.DEV_SECRET || 'local-dev-only-secret';
const loadDb = () => { try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch { return {}; } };
const saveDb = (db) => { fs.mkdirSync(DATA_DIR, { recursive: true }); fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); };
const devSig = (p, exp) => crypto.createHmac('sha256', DEV_SECRET).update(`${p}|${exp}`).digest('hex');
function devSigned(base, p) {
  const exp = Date.now() + READ_TTL * 1000;
  return `${base}?${new URLSearchParams({ path: p, exp: String(exp), sig: devSig(p, exp) })}`;
}
export const MEDIA_PATH = /^[A-Za-z0-9]{6,16}\/[a-z0-9-]+\.(jpg|mp3|m4a|ogg|wav)$/;
export function devVerify(params) {
  const p = params.get('path') || '', exp = Number(params.get('exp')), sig = params.get('sig') || '';
  if (!LOCAL_MODE || !MEDIA_PATH.test(p) || !(exp > Date.now())) return null;
  const want = devSig(p, exp);
  return sig.length === want.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(want)) ? p : null;
}

/* ---------------- Public API ---------------- */
export async function insertCard(row) {
  assertConfigured();
  const full = { status: 'pending', open_count: 0, ...row, created_at: new Date().toISOString() };
  if (LOCAL_MODE) { const db = loadDb(); db[row.id] = full; saveDb(db); return; }
  await sb('/rest/v1/cards', { method: 'POST', body: full, headers: { Prefer: 'return=minimal' } });
}

export async function getCard(id) {
  assertConfigured();
  if (LOCAL_MODE) return loadDb()[id] || null;
  const rows = await sb(`/rest/v1/cards?id=eq.${encodeURIComponent(id)}&select=*`);
  return rows[0] || null;
}

export async function getCardByOrder(orderId) {
  assertConfigured();
  if (LOCAL_MODE) return Object.values(loadDb()).find((c) => c.order_id === orderId) || null;
  const rows = await sb(`/rest/v1/cards?order_id=eq.${encodeURIComponent(orderId)}&select=*`);
  return rows[0] || null;
}

export async function updateCard(id, patch) {
  assertConfigured();
  if (LOCAL_MODE) { const db = loadDb(); if (db[id]) { Object.assign(db[id], patch); saveDb(db); } return; }
  await sb(`/rest/v1/cards?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', body: patch, headers: { Prefer: 'return=minimal' } });
}

// One-time upload URLs the browser PUTs files to directly (keeps big files off our server).
export async function signUploads(paths) {
  assertConfigured();
  if (LOCAL_MODE) return paths.map((p) => ({ url: devSigned('/api/upload', p) }));
  return Promise.all(paths.map(async (p) => {
    const r = await sb(`/storage/v1/object/upload/sign/${BUCKET}/${p}`, { method: 'POST', body: {} });
    return { url: `${SB_URL}/storage/v1${r.url}` };
  }));
}

// Temporary read URLs for a paid card's photos/song (the bucket itself is private).
export async function signReads(paths) {
  if (!paths.length) return [];
  assertConfigured();
  if (LOCAL_MODE) return paths.map((p) => devSigned('/api/media', p));
  const rows = await sb(`/storage/v1/object/sign/${BUCKET}`, { method: 'POST', body: { expiresIn: READ_TTL, paths } });
  return rows.map((r) => (r.signedURL ? `${SB_URL}/storage/v1${r.signedURL}` : null));
}
