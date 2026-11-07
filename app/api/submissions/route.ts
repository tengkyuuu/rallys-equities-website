import { NextResponse } from 'next/server';
import { SUBMISSION_SCHEMAS, UPLOAD_FIELDS, UPLOAD_PATH, submissionRequestSchema } from '@/lib/forms/schema';
import { guardFormRequest, readFormJson, validUploadReceipt } from '@/lib/server/form-security';
import { SUPABASE_URL, serverHeaders } from '@/lib/server/supabase';

/* POST { kind, data, files } — validates a form submission against its schema and saves
   it to `form_submissions`. The new-row alert email is sent by the notify-submission
   Supabase function, as before. */
export async function POST(req: Request) {
  const blocked = await guardFormRequest(req, 'submit', 8);
  if (blocked) return blocked;
  let json: unknown;
  try {
    json = await readFormJson(req);
  } catch {
    return NextResponse.json({ error: 'This form is too large. Please shorten your message.' }, { status: 413 });
  }
  const body = submissionRequestSchema.safeParse(json);
  if (!body.success) return NextResponse.json({ error: 'Invalid submission.' }, { status: 400 });
  const { kind, files } = body.data;

  const data = SUBMISSION_SCHEMAS[kind].safeParse(body.data.data);
  if (!data.success) {
    return NextResponse.json(
      {
        error: 'Please complete the highlighted fields.',
        fields: Object.fromEntries(data.error.issues.map((i) => [i.path.join('.'), i.message])),
      },
      { status: 400 },
    );
  }
  // only files this server signed for this form
  const allowed = UPLOAD_FIELDS[kind] || {};
  if (
    new Set(files.map((f) => f.field)).size !== files.length ||
    files.some(
      (f) =>
        !allowed[f.field]?.includes(f.type) || !UPLOAD_PATH.test(f.path) || !f.path.startsWith(kind + '/') || !validUploadReceipt(kind, f),
    )
  ) {
    return NextResponse.json({ error: 'Invalid upload reference.' }, { status: 400 });
  }

  const reference = 'reference' in data.data ? data.data.reference : null;
  const r = await fetch(`${SUPABASE_URL}/rest/v1/form_submissions`, {
    method: 'POST',
    headers: { ...serverHeaders, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ kind, reference, data: data.data, files }),
    signal: AbortSignal.timeout(15_000),
  }).catch(() => null);
  if (!r?.ok) {
    console.error('[submissions] insert failed', r?.status || 'network');
    return NextResponse.json({ error: 'save-failed' }, { status: 502 });
  }
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}
