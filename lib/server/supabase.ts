import 'server-only';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase-config';

/* Key used for server-side writes. With SUPABASE_SERVICE_ROLE_KEY set (server-only env,
   never NEXT_PUBLIC_), the database can stop accepting anonymous inserts entirely so the
   API routes become the only way in. Without it, writes fall back to the public anon key
   under the existing Row-Level Security policies. */
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

export const serverHeaders = { apikey: KEY, Authorization: `Bearer ${KEY}` };
export { SUPABASE_URL };
export const FORM_BUCKET = 'form-uploads';
