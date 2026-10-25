import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { CONTENT_TAG, invalidatePosts } from '@/lib/content';
import { clientIp, rateLimit } from '@/lib/server/rate-limit';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase-config';

/* POST, Authorization: Bearer <editor's Supabase access token>
   Called by the editor right after Publish so visitors see the change on their next
   page load instead of after the 60-second cache window. Only signed-in editors can
   trigger it; Supabase verifies the token. */
export async function POST(req: Request) {
  if (!rateLimit('rv:' + clientIp(req), 30, 60_000)) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  const token = /^Bearer (.+)$/.exec(req.headers.get('authorization') || '')?.[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!user.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  revalidateTag(CONTENT_TAG, { expire: 0 });
  invalidatePosts();
  return NextResponse.json({ revalidated: true });
}
