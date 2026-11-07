import { NextResponse } from 'next/server';
import { MAX_PHOTO_BYTES, UPLOAD_FIELDS, uploadRequestSchema } from '@/lib/forms/schema';
import { randomBytes } from 'node:crypto';
import { guardFormRequest, readFormJson, uploadReceipt } from '@/lib/server/form-security';
import { FORM_BUCKET, SUPABASE_URL, serverHeaders } from '@/lib/server/supabase';

/* POST { kind, files: [{ field, name, type, size }] }
   → { uploads: [{ field, path, url }] } — one-time signed upload URLs. The browser PUTs
   each file straight to Supabase Storage, so documents never pass through (or hit the
   request-size limit of) this function. Type, size and field are checked here first. */

const safeName = (name: string) => (name || 'file').replace(/[^A-Za-z0-9.\-_]/g, '_').slice(-60);
const rand = () => randomBytes(16).toString('hex');

export async function POST(req: Request) {
  const blocked = await guardFormRequest(req, 'upload', 20);
  if (blocked) return blocked;
  let json: unknown;
  try {
    json = await readFormJson(req);
  } catch {
    return NextResponse.json({ error: 'Upload request too large.' }, { status: 413 });
  }
  const parsed = uploadRequestSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: 'Please upload files smaller than 5 MB.' }, { status: 400 });
  const { kind, files } = parsed.data;

  const allowed = UPLOAD_FIELDS[kind] || {};
  if (new Set(files.map((f) => f.field)).size !== files.length)
    return NextResponse.json({ error: 'Choose one file per upload field.' }, { status: 400 });
  for (const f of files) {
    if (kind === 'application' && f.field === 'photo' && f.size > MAX_PHOTO_BYTES)
      return NextResponse.json({ error: 'Choose a photograph smaller than 2 MB.' }, { status: 400 });
    const types = allowed[f.field];
    if (!types) return NextResponse.json({ error: 'Unexpected upload.' }, { status: 400 });
    if (!types.includes(f.type)) return NextResponse.json({ error: `“${f.name}” isn’t an accepted file type.` }, { status: 400 });
  }

  const uploads = [];
  for (const f of files) {
    const path = `${kind}/${Date.now()}-${rand()}-${f.field}-${safeName(f.name)}`;
    const r = await fetch(`${SUPABASE_URL}/storage/v1/object/upload/sign/${FORM_BUCKET}/${path}`, {
      method: 'POST',
      headers: { ...serverHeaders, 'Content-Type': 'application/json' },
      body: '{}',
      signal: AbortSignal.timeout(10_000),
    }).catch(() => null);
    const j = r?.ok ? ((await r.json()) as { url?: string }) : null;
    if (!j?.url) return NextResponse.json({ error: `We could not upload “${f.name}”. Please try again.` }, { status: 502 });
    uploads.push({ field: f.field, path, url: `${SUPABASE_URL}/storage/v1${j.url}`, receipt: uploadReceipt(kind, { ...f, path }) });
  }
  return NextResponse.json({ uploads }, { headers: { 'Cache-Control': 'no-store' } });
}
