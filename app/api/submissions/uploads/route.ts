import { NextResponse } from 'next/server';
import { UPLOAD_FIELDS, uploadRequestSchema } from '@/lib/forms/schema';
import { clientIp, rateLimit } from '@/lib/server/rate-limit';
import { FORM_BUCKET, SUPABASE_URL, serverHeaders } from '@/lib/server/supabase';

/* POST { kind, files: [{ field, name, type, size }] }
   → { uploads: [{ field, path, url }] } — one-time signed upload URLs. The browser PUTs
   each file straight to Supabase Storage, so documents never pass through (or hit the
   request-size limit of) this function. Type, size and field are checked here first. */

const safeName = (name: string) => (name || 'file').replace(/[^A-Za-z0-9.\-_]/g, '_').slice(-60);
const rand = () => Math.random().toString(36).slice(2, 8).padEnd(6, '0');

export async function POST(req: Request) {
  if (!rateLimit('upl:' + clientIp(req), 20, 10 * 60_000)) {
    return NextResponse.json({ error: 'Too many uploads. Please wait a few minutes and try again.' }, { status: 429 });
  }
  const parsed = uploadRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Please upload files smaller than 5 MB.' }, { status: 400 });
  const { kind, files } = parsed.data;

  const allowed = UPLOAD_FIELDS[kind] || {};
  for (const f of files) {
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
    });
    const j = r.ok ? ((await r.json()) as { url?: string }) : null;
    if (!j?.url) return NextResponse.json({ error: `We could not upload “${f.name}”. Please try again.` }, { status: 502 });
    uploads.push({ field: f.field, path, url: `${SUPABASE_URL}/storage/v1${j.url}` });
  }
  return NextResponse.json({ uploads });
}
