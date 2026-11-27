// GET /api/price: the real price, so the pages can never show a different amount than is charged.
import { route, send } from './_lib/http.js';
import { PRICE_INR, LIST_PRICE_INR } from './_lib/rules.js';

export default route(['GET'], async (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=60');
  send(res, 200, { price: PRICE_INR, listPrice: Math.max(LIST_PRICE_INR, PRICE_INR), discount: Math.max(0, LIST_PRICE_INR - PRICE_INR), currency: 'INR' });
});
