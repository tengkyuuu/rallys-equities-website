import { CONTACT_EMAIL } from '@/lib/site';
import { SUPABASE_ANON_KEY } from '@/lib/supabase-config';
import { MAX_UPLOAD_BYTES, type SubmissionKind, type UploadedFile } from './schema';

/* Browser side of a form submission: sign uploads → PUT files to Storage → save. */

export class SubmitError extends Error {}

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

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new SubmitError(j.error || 'save-failed'), { status: r.status });
  return j as T;
}

async function uploadFiles(kind: SubmissionKind, files: [string, File][]): Promise<UploadedFile[]> {
  for (const [, f] of files) {
    if (f.size > MAX_UPLOAD_BYTES) throw new SubmitError(`“${f.name}” is larger than 5 MB. Please upload a smaller file.`);
  }
  const meta = files.map(([field, f]) => ({ field, name: f.name, type: fileType(f), size: f.size }));
  const { uploads } = await postJson<{ uploads: { field: string; path: string; url: string }[] }>('/api/submissions/uploads', {
    kind,
    files: meta,
  });
  return Promise.all(
    uploads.map(async (u, i) => {
      const file = files[i][1];
      const r = await fetch(u.url, {
        method: 'PUT',
        headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': meta[i].type, 'x-upsert': 'false' },
        body: file,
      });
      if (!r.ok) throw new SubmitError(`We could not upload “${file.name}”. Please try again.`);
      return { field: u.field, path: u.path, name: file.name, type: meta[i].type, size: file.size };
    }),
  );
}

export async function submitForm(kind: SubmissionKind, data: Record<string, unknown>, files: [string, File][] = []) {
  const uploaded = files.length ? await uploadFiles(kind, files) : [];
  await postJson('/api/submissions', { kind, data, files: uploaded });
}

/** The message to show for a failed submission. Upload/limit problems are specific;
    anything else gets the generic apology with a fallback address. */
export function submitErrorMessage(e: unknown, what = 'send your details') {
  const msg = e instanceof Error ? e.message : '';
  if (/larger than 5 MB|could not upload|accepted file type|Too many/.test(msg)) return msg;
  return `Sorry, we couldn’t ${what} just now. Please try again in a moment, or email ${CONTACT_EMAIL}.`;
}
