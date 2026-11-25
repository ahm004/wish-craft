// POST /api/razorpay-webhook: optional backup in case the buyer closes the tab right after paying.
// We never trust the webhook body itself: we only take the order id from it and ask
// Razorpay's API directly whether that order is really paid.
import { route, readJson, send } from './_lib/http.js';
import { getCardByOrder } from './_lib/store.js';
import { reconcile } from './_lib/payments.js';

export default route(['POST'], async (req, res) => {
  const body = await readJson(req).catch(() => ({}));
  const p = body.payload || {};
  const orderId = p.payment?.entity?.order_id || p.order?.entity?.id;
  if (typeof orderId === 'string' && /^order_[A-Za-z0-9]+$/.test(orderId)) {
    const card = await getCardByOrder(orderId);
    if (card) await reconcile(card);
  }
  send(res, 200, { ok: true });
});
