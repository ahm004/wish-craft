// PUT /api/upload: LOCAL TEST MODE ONLY. Stands in for Supabase's signed upload URLs.
// Online (with Supabase configured) this route always returns 404.
import fs from 'node:fs';
import path from 'node:path';
import { route, send, query, httpError } from './_lib/http.js';
import { devVerify, MEDIA_DIR } from './_lib/store.js';

export default route(['PUT'], async (req, res) => {
  const p = devVerify(query(req));
  if (!p) throw httpError(404, 'Not found');
  const body = req.body;
  if (!Buffer.isBuffer(body) || !body.length || body.length > 10 * 1024 * 1024) throw httpError(400, 'Bad upload');
  const file = path.join(MEDIA_DIR, p);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body);
  send(res, 200, { ok: true });
});
