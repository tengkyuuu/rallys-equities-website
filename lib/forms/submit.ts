import { CONTACT_EMAIL } from '@/lib/site';
import { SUPABASE_ANON_KEY } from '@/lib/supabase-config';
import { MAX_PHOTO_BYTES, MAX_UPLOAD_BYTES, UPLOAD_FIELDS, type SubmissionKind, type UploadedFile } from './schema';

/* Browser side of a form submission: sign uploads → PUT files to Storage → save. */

export class SubmitError extends Error {
  status?: number;
  retryAfter?: number;
  fields?: Record<string, string>;
}

const EXT_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};
// some browsers report an empty type for Office documents
const fileType = (f: File) => f.type || EXT_TYPES[f.name.split('.').pop()?.toLowerCase() || ''] || 'application/octet-stream';

export function uploadError(kind: SubmissionKind, field: string, file: File) {
  const max = kind === 'application' && field === 'photo' ? MAX_PHOTO_BYTES : MAX_UPLOAD_BYTES;
  if (!file.size) return 'This file is empty. Choose another file.';
  if (file.size > max) return `Choose a file smaller than ${max / 1024 / 1024} MB.`;
  if (!UPLOAD_FIELDS[kind]?.[field]?.includes(fileType(file))) return 'Choose one of the file types listed for this field.';
  return '';
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok)
    throw Object.assign(new SubmitError(j.error || 'save-failed'), {
      status: r.status,
      fields: j.fields,
      retryAfter: Number(r.headers.get('Retry-After') || j.retryAfter) || undefined,
    });
  return j as T;
}

async function uploadFiles(kind: SubmissionKind, files: [string, File][], progress?: (message: string) => void): Promise<UploadedFile[]> {
  for (const [field, f] of files) {
    if (f.size > MAX_UPLOAD_BYTES) throw new SubmitError(`“${f.name}” is larger than 5 MB. Please upload a smaller file.`);
    const problem = uploadError(kind, field, f);
    if (problem) throw new SubmitError(`We could not upload “${f.name}”. ${problem}`);
  }
  const meta = files.map(([field, f]) => ({ field, name: f.name, type: fileType(f), size: f.size }));
  progress?.('Preparing your documents for upload…');
  const { uploads } = await postJson<{ uploads: { field: string; path: string; url: string; receipt: string }[] }>(
    '/api/submissions/uploads',
    {
      kind,
      files: meta,
    },
  );
  let completed = 0;
  progress?.(`Uploading documents: 0 of ${files.length} complete…`);
  return Promise.all(
    uploads.map(async (u, i) => {
      const file = files[i][1];
      const r = await fetch(u.url, {
        method: 'PUT',
        headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': meta[i].type, 'x-upsert': 'false' },
        body: file,
        signal: AbortSignal.timeout(90_000),
      });
      if (!r.ok) throw new SubmitError(`We could not upload “${file.name}”. Please try again.`);
      progress?.(`Uploading documents: ${++completed} of ${files.length} complete…`);
      return { field: u.field, path: u.path, name: file.name, type: meta[i].type, size: file.size, receipt: u.receipt };
    }),
  );
}

export async function submitForm(
  kind: SubmissionKind,
  data: Record<string, unknown>,
  files: [string, File][] = [],
  progress?: (message: string) => void,
) {
  if (typeof navigator !== 'undefined' && !navigator.onLine)
    throw new SubmitError('You’re offline. Reconnect, then send again. Your details are still on this page.');
  const uploaded = files.length ? await uploadFiles(kind, files, progress) : [];
  progress?.('Sending your details and waiting for confirmation…');
  await postJson('/api/submissions', { kind, data, files: uploaded });
}

/** The message to show for a failed submission. Upload/limit problems are specific;
    anything else gets the generic apology with a fallback address. */
export function submitErrorMessage(e: unknown, what = 'send your details') {
  const msg = e instanceof Error ? e.message : '';
  if (e instanceof SubmitError && e.status === 403)
    return 'This request was blocked for security. Open the form on this website and try again, or contact our team.';
  if (e instanceof SubmitError && e.status === 401)
    return 'Your session has expired. Your details are still on this page. Sign in again before retrying.';
  if (e instanceof Error && /TimeoutError|AbortError/.test(e.name))
    return 'The connection took too long. Your details are still here. We could not confirm receipt; contact our team before resending if you are unsure.';
  if (/larger than 5 MB|could not upload|accepted file type|Too many|offline|highlighted fields|temporarily unavailable/.test(msg))
    return msg;
  return `Sorry, we couldn’t ${what} just now. Please try again in a moment, or email ${CONTACT_EMAIL}.`;
}
