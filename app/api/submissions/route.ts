import { NextResponse } from 'next/server';
import { SUBMISSION_SCHEMAS, UPLOAD_FIELDS, UPLOAD_PATH, submissionRequestSchema } from '@/lib/forms/schema';
import { clientIp, rateLimit } from '@/lib/server/rate-limit';
import { SUPABASE_URL, serverHeaders } from '@/lib/server/supabase';

/* POST { kind, data, files } — validates a form submission against its schema and saves
   it to `form_submissions`. The new-row alert email is sent by the notify-submission
   Supabase function, as before. */
export async function POST(req: Request) {
  if (!rateLimit('sub:' + clientIp(req), 8, 10 * 60_000)) {
    return NextResponse.json({ error: 'Too many submissions. Please wait a few minutes and try again.' }, { status: 429 });
  }
  const body = submissionRequestSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: 'Invalid submission.' }, { status: 400 });
  const { kind, files } = body.data;

  const data = SUBMISSION_SCHEMAS[kind].safeParse(body.data.data);
  if (!data.success) {
    return NextResponse.json(
      { error: 'Please complete the highlighted fields.', fields: data.error.issues.map((i) => i.path.join('.')) },
      { status: 400 },
    );
  }
  // only files this server signed for this form
  const allowed = UPLOAD_FIELDS[kind] || {};
  if (files.some((f) => !allowed[f.field] || !UPLOAD_PATH.test(f.path) || !f.path.startsWith(kind + '/'))) {
    return NextResponse.json({ error: 'Invalid upload reference.' }, { status: 400 });
  }

  const reference = 'reference' in data.data ? data.data.reference : null;
  const r = await fetch(`${SUPABASE_URL}/rest/v1/form_submissions`, {
    method: 'POST',
    headers: { ...serverHeaders, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ kind, reference, data: data.data, files }),
  });
  if (!r.ok) {
    console.error('[submissions] insert failed', r.status, (await r.text().catch(() => '')).slice(0, 200));
    return NextResponse.json({ error: 'save-failed' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
