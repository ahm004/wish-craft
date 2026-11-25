// GET /api/card?id=...: what the recipient's browser loads. Only paid cards are returned.
import { route, send, query, httpError } from './_lib/http.js';
import { ID_PATTERN } from './_lib/rules.js';
import { getCard, updateCard, signReads } from './_lib/store.js';
import { reconcile } from './_lib/payments.js';

export default route(['GET'], async (req, res) => {
  const id = query(req).get('id') || '';
  if (!ID_PATTERN.test(id)) throw httpError(404, 'not_found');
  let card = await getCard(id);
  if (!card) throw httpError(404, 'not_found');
  card = await reconcile(card);
  if (card.status !== 'paid') throw httpError(402, 'unpaid');

  const paths = [...(card.photo_paths || []), ...(card.song_path ? [card.song_path] : [])];
  const urls = await signReads(paths);
  const photos = urls.slice(0, (card.photo_paths || []).length).filter(Boolean);
  const song = card.song_path ? urls[urls.length - 1] : null;

  // Count opens (best effort, never blocks the card from showing).
  updateCard(id, {
    open_count: (card.open_count || 0) + 1,
    first_opened_at: card.first_opened_at || new Date().toISOString(),
  }).catch((e) => console.error('open count failed', e));

  send(res, 200, { data: card.data, photos, song });
});
