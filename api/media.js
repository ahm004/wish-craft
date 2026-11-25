// GET /api/media: LOCAL TEST MODE ONLY. Serves uploaded files using a signed link.
// Online (with Supabase configured) this route always returns 404.
import fs from 'node:fs';
import path from 'node:path';
import { route, query, httpError } from './_lib/http.js';
import { devVerify, MEDIA_DIR } from './_lib/store.js';

const TYPES = { jpg: 'image/jpeg', mp3: 'audio/mpeg', m4a: 'audio/mp4', ogg: 'audio/ogg', wav: 'audio/wav' };

export default route(['GET'], async (req, res) => {
  const p = devVerify(query(req));
  if (!p) throw httpError(404, 'Not found');
  const file = path.join(MEDIA_DIR, p);
  if (!fs.existsSync(file)) throw httpError(404, 'Not found');
  res.statusCode = 200;
  res.setHeader('Content-Type', TYPES[p.split('.').pop()] || 'application/octet-stream');
  res.setHeader('Cache-Control', 'private, max-age=3600');
  res.end(fs.readFileSync(file));
});
