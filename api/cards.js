// POST /api/cards: save a new (unpaid) card and hand back upload URLs for its photos.
import crypto from 'node:crypto';
import { route, readJson, send } from './_lib/http.js';
import { validateCard, newId, newToken, hashToken, AMOUNT_PAISE, PRICE_INR, CARD_LIFETIME_DAYS } from './_lib/rules.js';
import { insertCard, signUploads, purgeExpired } from './_lib/store.js';

export default route(['POST'], async (req, res) => {
  const { data, photoCount } = validateCard(await readJson(req));
  // Tidy up anything that has expired. The daily cron does this too; this makes sure it also
  // happens if the cron is not set up yet.
  await purgeExpired(10).catch((e) => console.error('purge failed', e));

  const id = newId();
  const token = newToken();
  const tag = () => crypto.randomBytes(5).toString('hex');
  const photoPaths = Array.from({ length: photoCount }, (_, i) => `${id}/photo-${i}-${tag()}.jpg`);

  await insertCard({
    id,
    token_hash: hashToken(token),
    data,
    photo_paths: photoPaths,
    song_path: null, // songs are never uploaded
    amount: AMOUNT_PAISE,
  });
  const uploads = await signUploads(photoPaths);
  send(res, 200, { id, token, price: PRICE_INR, days: CARD_LIFETIME_DAYS, uploads });
});
