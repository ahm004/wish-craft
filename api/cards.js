// POST /api/cards: save a new (unpaid) card and hand back upload URLs for its files.
import crypto from 'node:crypto';
import { route, readJson, send } from './_lib/http.js';
import { validateCard, newId, newToken, hashToken, AMOUNT_PAISE, PRICE_INR } from './_lib/rules.js';
import { insertCard, signUploads } from './_lib/store.js';

export default route(['POST'], async (req, res) => {
  const { data, photoCount, songExt } = validateCard(await readJson(req));
  const id = newId();
  const token = newToken();
  const tag = () => crypto.randomBytes(5).toString('hex');
  const photoPaths = Array.from({ length: photoCount }, (_, i) => `${id}/photo-${i}-${tag()}.jpg`);
  const songPath = songExt ? `${id}/song-${tag()}.${songExt}` : null;

  await insertCard({
    id,
    token_hash: hashToken(token),
    data,
    photo_paths: photoPaths,
    song_path: songPath,
    amount: AMOUNT_PAISE,
  });
  const uploads = await signUploads([...photoPaths, ...(songPath ? [songPath] : [])]);
  send(res, 200, { id, token, price: PRICE_INR, uploads });
});
