// Small helpers shared by every API route. Uses only Node's built-in req/res,
// so the same handlers run on Vercel and on the local dev server.

export function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

export function httpError(status, message) {
  const e = new Error(message);
  e.status = status;
  e.expose = true;
  return e;
}

export async function readJson(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  let raw = req.body;
  if (raw == null) {
    raw = await new Promise((ok, bad) => {
      let d = '';
      req.on('data', (c) => { d += c; if (d.length > 100_000) bad(httpError(413, 'Request too large')); });
      req.on('end', () => ok(d));
      req.on('error', bad);
    });
  }
  if (Buffer.isBuffer(raw)) raw = raw.toString('utf8');
  try { return JSON.parse(raw || '{}'); } catch { throw httpError(400, 'Invalid JSON'); }
}

export const query = (req) => new URL(req.url, 'http://local').searchParams;

// Wraps a route: checks the method and turns thrown errors into JSON responses.
export function route(methods, fn) {
  return async (req, res) => {
    if (!methods.includes(req.method)) {
      res.setHeader('Allow', methods.join(', '));
      return send(res, 405, { error: 'Method not allowed' });
    }
    try {
      await fn(req, res);
    } catch (e) {
      if (!e.expose) console.error(e);
      send(res, e.status || 500, { error: e.expose ? e.message : 'Something went wrong. Please try again.' });
    }
  };
}
