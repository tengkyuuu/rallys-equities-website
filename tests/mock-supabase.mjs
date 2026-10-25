// In-memory stand-in for the parts of Supabase the site and editor use: PostgREST tables
// (site_content, form_submissions, invites), password auth, storage signed uploads and
// edge functions. Lets the e2e suite exercise real round trips (publish in the editor →
// a visitor sees it) without touching the production project.
//
//   GET  /__test/state   → current tables + uploaded object paths
//   POST /__test/reset   → back to tests/fixtures/content.json
import http from 'node:http';
import fs from 'node:fs';
import crypto from 'node:crypto';

const PORT = Number(process.env.MOCK_SUPABASE_PORT || 54321);
const FIXTURE = new URL('./fixtures/content.json', import.meta.url);
export const EDITOR = { email: 'editor@example.com', password: 'correct-horse-battery' };

let db, objects, tokens;
const now = () => new Date().toISOString();
const clone = (x) => JSON.parse(JSON.stringify(x));
function reset() {
  const content = JSON.parse(fs.readFileSync(FIXTURE, 'utf8'));
  db = {
    site_content: [
      { scope: 'published', data: clone(content), version: 1, updated_at: now() },
      { scope: 'draft', data: clone(content), version: 1, updated_at: now() },
    ],
    form_submissions: [],
    invites: [],
  };
  objects = new Map();
  tokens = new Map();
}
reset();

const KEYS = { site_content: 'scope' };
const user = {
  id: '00000000-0000-4000-8000-000000000001',
  aud: 'authenticated',
  role: 'authenticated',
  email: EDITOR.email,
  app_metadata: { provider: 'email' },
  user_metadata: {},
  created_at: now(),
};

function session() {
  const access_token = crypto.randomUUID(),
    refresh_token = crypto.randomUUID();
  tokens.set(access_token, user);
  tokens.set('r:' + refresh_token, user);
  return { access_token, refresh_token, token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user };
}
const bearerUser = (req) => tokens.get((req.headers.authorization || '').replace(/^Bearer /, ''));

/* ── tiny PostgREST ── */
const RESERVED = new Set(['select', 'order', 'limit', 'offset', 'on_conflict', 'columns']);
function matches(row, params) {
  for (const [k, v] of params) {
    if (RESERVED.has(k)) continue;
    if (v.startsWith('eq.') && String(row[k]) !== v.slice(3)) return false;
    if (v === 'is.null' && row[k] != null) return false;
  }
  return true;
}
function project(row, select) {
  if (!select || select === '*') return row;
  const out = {};
  for (const item of select.split(',')) {
    const [alias, path] = item.includes(':') ? item.split(':') : [null, item];
    const parts = path.split('->');
    let v = row[parts[0]];
    for (const p of parts.slice(1)) v = v == null ? null : v[p];
    out[alias || parts[parts.length - 1]] = v ?? null;
  }
  return out;
}
function rest(req, res, table, url, body) {
  const rows = db[table];
  if (!rows) return send(res, 404, { message: 'relation does not exist' });
  const p = url.searchParams;
  const prefer = req.headers.prefer || '';
  const representation = /return=representation/.test(prefer);
  if (req.method === 'GET') {
    let out = rows.filter((r) => matches(r, p));
    const order = p.get('order');
    if (order) {
      const [col, dir] = order.split('.');
      out = [...out].sort((a, b) => String(a[col]).localeCompare(String(b[col])) * (dir === 'desc' ? -1 : 1));
    }
    if (p.get('limit')) out = out.slice(0, +p.get('limit'));
    return send(
      res,
      200,
      out.map((r) => project(r, p.get('select'))),
    );
  }
  if (req.method === 'POST') {
    const items = Array.isArray(body) ? body : [body];
    const key = p.get('on_conflict') || KEYS[table] || 'id';
    const written = items.map((it) => {
      const existing = /merge-duplicates/.test(prefer) && rows.find((r) => r[key] === it[key]);
      if (existing) return Object.assign(existing, it);
      const row = { id: crypto.randomUUID(), created_at: now(), ...it };
      rows.push(row);
      return row;
    });
    return send(res, 201, representation ? written : '');
  }
  if (req.method === 'PATCH') {
    const hit = rows.filter((r) => matches(r, p));
    hit.forEach((r) => Object.assign(r, body));
    return send(res, representation ? 200 : 204, representation ? hit : '');
  }
  if (req.method === 'DELETE') {
    db[table] = rows.filter((r) => !matches(r, p));
    return send(res, 204, '');
  }
  send(res, 405, {});
}

function send(res, status, body) {
  const isObj = body !== '' && typeof body === 'object';
  res.writeHead(status, isObj ? { 'Content-Type': 'application/json' } : {});
  res.end(isObj ? JSON.stringify(body) : body);
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || '*');
  res.setHeader('Access-Control-Expose-Headers', 'content-range');
  if (req.method === 'OPTIONS') return send(res, 204, '');

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks);
  const json = () => {
    try {
      return JSON.parse(raw.toString() || 'null');
    } catch {
      return null;
    }
  };
  const path = url.pathname;

  if (path === '/__test/state') return send(res, 200, { ...db, objects: [...objects.keys()] });
  if (path === '/__test/reset' && req.method === 'POST') {
    reset();
    return send(res, 200, { ok: true });
  }

  let m;
  if ((m = /^\/rest\/v1\/([a-z_]+)$/.exec(path))) return rest(req, res, m[1], url, json());

  if (path === '/auth/v1/token') {
    const b = json() || {};
    if (url.searchParams.get('grant_type') === 'password') {
      if (b.email === EDITOR.email && b.password === EDITOR.password) return send(res, 200, session());
      return send(res, 400, { error: 'invalid_grant', error_description: 'Invalid login credentials', msg: 'Invalid login credentials' });
    }
    if (url.searchParams.get('grant_type') === 'refresh_token' && tokens.get('r:' + b.refresh_token)) return send(res, 200, session());
    return send(res, 400, { error: 'invalid_grant' });
  }
  if (path === '/auth/v1/user') {
    const u = bearerUser(req);
    if (!u) return send(res, 401, { msg: 'invalid JWT', code: 401 });
    return send(res, 200, u);
  }
  if (path === '/auth/v1/logout') return send(res, 204, '');
  if (path === '/auth/v1/recover') return send(res, 200, {});

  if ((m = /^\/storage\/v1\/object\/upload\/sign\/([^/]+)\/(.+)$/.exec(path))) {
    const key = `${m[1]}/${decodeURIComponent(m[2])}`;
    if (req.method === 'POST') {
      const token = crypto.randomUUID();
      tokens.set('u:' + key, token);
      return send(res, 200, { url: `/object/upload/sign/${m[1]}/${m[2]}?token=${token}`, token });
    }
    if (req.method === 'PUT') {
      if (tokens.get('u:' + key) !== url.searchParams.get('token')) return send(res, 400, { error: 'invalid signature' });
      objects.set(key, { type: req.headers['content-type'], bytes: raw.length });
      return send(res, 200, { Key: key });
    }
  }
  if ((m = /^\/storage\/v1\/object\/public\/(.+)$/.exec(path))) return objects.has(m[1]) ? send(res, 200, '') : send(res, 404, {});
  if ((m = /^\/storage\/v1\/object\/(?!sign|upload|public)(.+)$/.exec(path)) && req.method === 'POST') {
    objects.set(decodeURIComponent(m[1]), { type: req.headers['content-type'], bytes: raw.length });
    return send(res, 200, { Key: m[1] });
  }
  if (path.startsWith('/functions/v1/')) return bearerUser(req) ? send(res, 200, { ok: true }) : send(res, 401, { error: 'Unauthorized' });

  send(res, 404, { message: 'not mocked: ' + req.method + ' ' + path });
});

server.listen(PORT, '127.0.0.1', () => console.log(`mock supabase on http://127.0.0.1:${PORT}`));
