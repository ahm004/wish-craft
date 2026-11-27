import crypto from 'node:crypto';
import { httpError } from './http.js';

// PRICE_INR is what the customer is charged (the ₹35 list price minus the ₹5 discount).
export const PRICE_INR = Number(process.env.PRICE_INR || 30);
// LIST_PRICE_INR is only shown crossed out next to the real price.
export const LIST_PRICE_INR = Number(process.env.LIST_PRICE_INR || 35);
export const AMOUNT_PAISE = Math.round(PRICE_INR * 100);
export const MAX_PHOTOS = 5;
// Cards and their photos are deleted automatically this many days after payment (see api/cleanup.js).
export const CARD_LIFETIME_DAYS = Number(process.env.CARD_LIFETIME_DAYS || 7);
// Cards that were never paid for are deleted after this many hours.
export const UNPAID_HOURS = 24;

const OCCASIONS = ['birthday', 'valentine', 'proposal', 'anniversary', 'congrats', 'thanks', 'sorry'];
const MUSIC = ['romantic', 'happy', 'dreamy', 'none']; // built-in tunes only: songs are never uploaded or stored
const ID_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
export const ID_PATTERN = /^[A-Za-z0-9]{6,16}$/;

export function newId(len = 8) {
  let s = '';
  for (const b of crypto.randomBytes(len)) s += ID_ALPHABET[b % ID_ALPHABET.length];
  return s;
}
export const newToken = () => crypto.randomBytes(24).toString('base64url');
export const hashToken = (t) => crypto.createHash('sha256').update(String(t)).digest('hex');
export function tokenMatches(card, token) {
  if (!card || typeof token !== 'string' || !token) return false;
  const a = Buffer.from(hashToken(token)), b = Buffer.from(card.token_hash || '');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const str = (v, max, field, required = true) => {
  const s = typeof v === 'string' ? v.trim() : '';
  if (required && !s) throw httpError(400, `Please fill in ${field}.`);
  if (s.length > max) throw httpError(400, `${field} is too long (max ${max} characters).`);
  return s;
};

// Validates what the browser sends when creating a card. Returns the clean card
// data plus how many files the browser will upload.
export function validateCard(body) {
  if (!OCCASIONS.includes(body.o)) throw httpError(400, 'Pick an occasion.');
  const data = {
    o: body.o,
    t: str(body.t, 40, 'their name'),
    f: str(body.f, 40, 'your name'),
    m: str(body.m, 800, 'the message'),
    mu: MUSIC.includes(body.mu) ? body.mu : 'none',
    sg: body.sg === 'f' ? 'f' : 'm', // sender's teddy: m = boy, f = girl
    rg: body.rg === 'm' ? 'm' : 'f', // receiver's teddy
  };
  const q = str(body.q, 100, 'the question', false);
  if (q) data.q = q;
  if (Array.isArray(body.c)) data.c = body.c.slice(0, MAX_PHOTOS).map((c) => str(c, 30, 'a caption', false));

  const photoCount = Number(body.photoCount) || 0;
  if (!Number.isInteger(photoCount) || photoCount < 0 || photoCount > MAX_PHOTOS) throw httpError(400, `Up to ${MAX_PHOTOS} photos allowed.`);

  return { data, photoCount };
}
