// POST /api/checkout { id, token }: create (or reuse) the Razorpay order for a card.
import { route, readJson, send, httpError } from './_lib/http.js';
import { tokenMatches, ID_PATTERN, PRICE_INR, CARD_LIFETIME_DAYS } from './_lib/rules.js';
import { getCard, updateCard } from './_lib/store.js';
import { PAY_TEST_MODE, RAZORPAY_KEY_ID, createOrder, reconcile } from './_lib/payments.js';

export default route(['POST'], async (req, res) => {
  const { id, token } = await readJson(req);
  if (!ID_PATTERN.test(String(id))) throw httpError(400, 'Invalid card.');
  let card = await getCard(id);
  if (!tokenMatches(card, token)) throw httpError(404, 'Card not found.');

  card = await reconcile(card);
  if (card.status === 'paid') return send(res, 200, { paid: true });
  if (PAY_TEST_MODE) return send(res, 200, { testMode: true, amount: card.amount, price: PRICE_INR, days: CARD_LIFETIME_DAYS });

  let orderId = card.order_id;
  if (!orderId) {
    const order = await createOrder(card.amount, card.id);
    orderId = order.id;
    await updateCard(card.id, { order_id: orderId });
  }
  send(res, 200, { keyId: RAZORPAY_KEY_ID, orderId, amount: card.amount, currency: 'INR', price: PRICE_INR, days: CARD_LIFETIME_DAYS });
});
