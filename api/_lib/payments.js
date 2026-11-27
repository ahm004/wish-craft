// Razorpay integration. Every "paid" decision is made here, on the server.
import crypto from 'node:crypto';
import { httpError } from './http.js';
import { updateCard } from './store.js';
import { CARD_LIFETIME_DAYS } from './rules.js';

const KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
// Test payments without Razorpay are only possible on your own computer, never on Vercel.
export const PAY_TEST_MODE = !KEY_ID && !process.env.VERCEL;
export const RAZORPAY_KEY_ID = KEY_ID;

async function rzp(pathname, { method = 'GET', body } = {}) {
  if (!KEY_ID || !KEY_SECRET) throw httpError(500, 'Payments are not configured yet (missing Razorpay keys).');
  const r = await fetch(`https://api.razorpay.com/v1${pathname}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64'),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Razorpay ${method} ${pathname} -> ${r.status}: ${json.error?.description || ''}`);
  return json;
}

export const createOrder = (amount, cardId) =>
  rzp('/orders', { method: 'POST', body: { amount, currency: 'INR', receipt: `card_${cardId}`, notes: { card_id: cardId } } });

export const fetchOrder = (orderId) => rzp(`/orders/${encodeURIComponent(orderId)}`);

// Razorpay Checkout returns signature = HMAC_SHA256(order_id|payment_id, key_secret).
export function signatureValid(orderId, paymentId, signature) {
  if (!KEY_SECRET || typeof signature !== 'string') return false;
  const expected = crypto.createHmac('sha256', KEY_SECRET).update(`${orderId}|${paymentId}`).digest('hex');
  return signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function markPaid(card, paymentId) {
  const now = Date.now();
  // The card (and its photos) are deleted automatically CARD_LIFETIME_DAYS after payment.
  const patch = { status: 'paid', paid_at: new Date(now).toISOString(), expires_at: new Date(now + CARD_LIFETIME_DAYS * 86400000).toISOString() };
  if (paymentId) patch.payment_id = String(paymentId).slice(0, 64);
  await updateCard(card.id, patch);
  return { ...card, ...patch };
}

// If someone paid but closed the browser before we heard back, ask Razorpay directly.
export async function reconcile(card) {
  if (!card || card.status === 'paid' || !card.order_id || PAY_TEST_MODE) return card;
  const order = await fetchOrder(card.order_id);
  if (order.status === 'paid' && order.amount_paid >= card.amount) return markPaid(card, null);
  return card;
}
