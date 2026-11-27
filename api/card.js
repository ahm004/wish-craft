// GET /api/card?id=...: what the recipient's browser loads. Only paid, unexpired cards are returned.
import { route, send, query, httpError } from './_lib/http.js';
import { ID_PATTERN, CARD_LIFETIME_DAYS } from './_lib/rules.js';
import { getCard, updateCard, signReads, deleteCards } from './_lib/store.js';
import { reconcile } from './_lib/payments.js';

export default route(['GET'], async (req, res) => {
  const id = query(req).get('id') || '';
  if (!ID_PATTERN.test(id)) throw httpError(404, 'not_found');
  let card = await getCard(id);
  if (!card) throw httpError(404, 'not_found');
  card = await reconcile(card);
  if (card.status !== 'paid') throw httpError(402, 'unpaid');

  // Expired: delete it for good and say so.
  if (card.expires_at && new Date(card.expires_at).getTime() < Date.now()) {
    await deleteCards([card]).catch((e) => console.error('delete expired failed', e));
    return send(res, 410, { error: 'expired', days: CARD_LIFETIME_DAYS });
  }

  const photos = (await signReads(card.photo_paths || [])).filter(Boolean);

  // Count opens (best effort, never blocks the card from showing).
  updateCard(id, {
    open_count: (card.open_count || 0) + 1,
    first_opened_at: card.first_opened_at || new Date().toISOString(),
  }).catch((e) => console.error('open count failed', e));

  send(res, 200, { data: card.data, photos, expires: card.expires_at || null });
});
