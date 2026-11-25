// POST /api/verify: confirm a payment after Razorpay Checkout succeeds.
// Body: { id, token, razorpay_order_id, razorpay_payment_id, razorpay_signature }
//   or, on a local test setup only: { id, token, test: true }
import { route, readJson, send, httpError } from './_lib/http.js';
import { tokenMatches, ID_PATTERN } from './_lib/rules.js';
import { getCard } from './_lib/store.js';
import { PAY_TEST_MODE, signatureValid, markPaid } from './_lib/payments.js';

export default route(['POST'], async (req, res) => {
  const b = await readJson(req);
  if (!ID_PATTERN.test(String(b.id))) throw httpError(400, 'Invalid card.');
  const card = await getCard(b.id);
  if (!tokenMatches(card, b.token)) throw httpError(404, 'Card not found.');
  if (card.status === 'paid') return send(res, 200, { paid: true });

  if (b.test) {
    if (!PAY_TEST_MODE) throw httpError(400, 'Test payments are disabled.');
    await markPaid(card, `test_${Date.now()}`);
    return send(res, 200, { paid: true });
  }

  if (!card.order_id || b.razorpay_order_id !== card.order_id) throw httpError(400, 'This payment does not belong to this card.');
  if (!signatureValid(b.razorpay_order_id, b.razorpay_payment_id, b.razorpay_signature)) {
    throw httpError(400, 'We could not verify this payment. If money was deducted, it will be confirmed automatically in a few minutes.');
  }
  await markPaid(card, b.razorpay_payment_id);
  send(res, 200, { paid: true });
});
