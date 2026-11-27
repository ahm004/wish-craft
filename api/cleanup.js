// GET /api/cleanup: deletes expired cards (and their photos) for good.
// Vercel runs this once a day (see "crons" in vercel.json). It must be called with the header
//   Authorization: Bearer <CRON_SECRET>
// Vercel adds that header by itself when a CRON_SECRET environment variable is set.
import crypto from 'node:crypto';
import { route, send, httpError } from './_lib/http.js';
import { purgeExpired } from './_lib/store.js';

export default route(['GET', 'POST'], async (req, res) => {
  const secret = process.env.CRON_SECRET || '';
  const got = Buffer.from(String(req.headers.authorization || ''));
  const want = Buffer.from(`Bearer ${secret}`);
  if (!secret || got.length !== want.length || !crypto.timingSafeEqual(got, want)) throw httpError(401, 'Unauthorized');

  let deleted = 0;
  for (let i = 0; i < 20; i++) {
    const n = await purgeExpired(100);
    deleted += n;
    if (n < 100) break;
  }
  send(res, 200, { deleted });
});
