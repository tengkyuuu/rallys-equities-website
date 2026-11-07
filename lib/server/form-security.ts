import 'server-only';
import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { formRateLimit } from './rate-limit';
import type { UploadedFile } from '@/lib/forms/schema';

export async function guardFormRequest(req: Request, scope: string, limit: number) {
  const origin = req.headers.get('origin');
  if (req.headers.get('sec-fetch-site') === 'cross-site' || (origin && origin !== new URL(req.url).origin)) {
    return NextResponse.json({ error: 'Open this form on the Rallys Equities website and try again.' }, { status: 403 });
  }
  if (!req.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return NextResponse.json({ error: 'Please send a JSON request.' }, { status: 415 });
  }
  try {
    const result = await formRateLimit(req, scope, limit);
    if (!result.allowed)
      return NextResponse.json(
        { error: 'Too many attempts. Please wait before trying again.', retryAfter: result.retryAfter },
        { status: 429, headers: { 'Retry-After': String(result.retryAfter), 'Cache-Control': 'no-store' } },
      );
  } catch {
    return NextResponse.json({ error: 'Forms are temporarily unavailable. Please try again shortly.' }, { status: 503 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Forms are temporarily unavailable. Please contact our team by email.' }, { status: 503 });
  }
  return null;
}

/** Bound the actual stream too: Content-Length is optional and cannot be trusted. */
export async function readFormJson(req: Request): Promise<unknown> {
  const reader = req.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 32_768) {
        await reader.cancel();
        throw new Error('body-too-large');
      }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch (e) {
    if (e instanceof Error && e.message === 'body-too-large') throw e;
    return null;
  }
}

// A receipt authenticates the upload's metadata and expires after 30 minutes.
export function uploadReceipt(kind: string, file: Omit<UploadedFile, 'receipt'>, expires = Date.now() + 1_800_000) {
  const signature = createHmac('sha256', process.env.SUPABASE_SERVICE_ROLE_KEY!)
    .update(JSON.stringify([kind, file.field, file.path, file.name, file.type, file.size, expires]))
    .digest('hex');
  return `${expires}.${signature}`;
}

export function validUploadReceipt(kind: string, file: UploadedFile) {
  const [expiry, signature = ''] = (file.receipt || '').split('.');
  const expires = Number(expiry);
  if (!Number.isFinite(expires) || expires < Date.now() || expires > Date.now() + 1_800_000 || !/^[a-f0-9]{64}$/.test(signature))
    return false;
  const expected = uploadReceipt(kind, file, expires).split('.')[1];
  return timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
}
