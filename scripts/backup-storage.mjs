#!/usr/bin/env node
// Download every file in the Supabase Storage buckets into a folder, for backups.
// Used by .github/workflows/backup.yml; also runs locally.
//
//   SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… node scripts/backup-storage.mjs <out-dir>
//
// Writes <out-dir>/<bucket>/<path> for each file and <out-dir>/manifest.json (bucket,
// path, size, content type, sha256), so a restore can be checked file by file.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const URL_ = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const OUT = process.argv[2];
if (!URL_ || !KEY || !OUT) {
  console.error('Usage: SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… node scripts/backup-storage.mjs <out-dir>');
  process.exit(1);
}
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

async function api(p, init = {}) {
  for (let attempt = 1; ; attempt++) {
    try {
      const r = await fetch(`${URL_}/storage/v1/${p}`, {
        ...init,
        headers: { ...H, ...(init.headers || {}) },
        signal: AbortSignal.timeout(60_000),
      });
      if (!r.ok) throw new Error(`${p} → HTTP ${r.status} ${(await r.text()).slice(0, 200)}`);
      return r;
    } catch (e) {
      if (attempt >= 3) throw e;
      await new Promise((res) => setTimeout(res, 2000 * attempt));
    }
  }
}

/** Every file under a prefix (folders are listed recursively). */
async function listAll(bucket, prefix = '') {
  const files = [];
  for (let offset = 0; ; offset += 1000) {
    const r = await api(`object/list/${bucket}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix, limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } }),
    });
    const items = await r.json();
    for (const it of items) {
      const full = prefix ? `${prefix}/${it.name}` : it.name;
      if (it.id == null)
        files.push(...(await listAll(bucket, full))); // a folder
      else files.push({ path: full, size: it.metadata?.size ?? null, type: it.metadata?.mimetype ?? null });
    }
    if (items.length < 1000) break;
  }
  return files;
}

const buckets = await (await api('bucket')).json();
const manifest = [];
let bytes = 0;
const LIST_ONLY = process.argv.includes('--list'); // count files, download nothing
for (const b of buckets) {
  const files = await listAll(b.id);
  if (LIST_ONLY) {
    console.log(`${b.id}: ${files.length} files, ${(files.reduce((s, f) => s + (f.size || 0), 0) / 1e6).toFixed(1)} MB`);
    continue;
  }
  for (const f of files) {
    const r = await api(`object/authenticated/${b.id}/${f.path.split('/').map(encodeURIComponent).join('/')}`);
    const buf = Buffer.from(await r.arrayBuffer());
    const dest = path.join(OUT, b.id, ...f.path.split('/'));
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, buf);
    bytes += buf.length;
    manifest.push({
      bucket: b.id,
      path: f.path,
      size: buf.length,
      type: f.type,
      sha256: crypto.createHash('sha256').update(buf).digest('hex'),
    });
  }
  console.log(`${b.id}: ${files.length} files`);
}
if (LIST_ONLY) process.exit(0);
fs.writeFileSync(
  path.join(OUT, 'manifest.json'),
  JSON.stringify({ at: new Date().toISOString(), buckets: buckets.map((b) => ({ id: b.id, public: b.public })), files: manifest }, null, 2),
);
console.log(`Downloaded ${manifest.length} files, ${(bytes / 1e6).toFixed(1)} MB`);
if (!manifest.length) {
  console.error('No files found — refusing to call this a backup.');
  process.exit(1);
}
