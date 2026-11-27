// POST /api/status { id, token }: lets the creator check whether their card is paid.
import { route, readJson, send, httpError } from './_lib/http.js';
import { tokenMatches, ID_PATTERN } from './_lib/rules.js';
import { getCard } from './_lib/store.js';
import { reconcile } from './_lib/payments.js';

export default route(['POST'], async (req, res) => {
  const { id, token } = await readJson(req);
  if (!ID_PATTERN.test(String(id))) throw httpError(400, 'Invalid card.');
  const card = await getCard(id);
  if (!tokenMatches(card, token)) throw httpError(404, 'Card not found.');
  const fresh = await reconcile(card);
  send(res, 200, { status: fresh.status, opens: fresh.open_count || 0, expires: fresh.expires_at || null });
});
