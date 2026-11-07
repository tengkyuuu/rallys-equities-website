import 'server-only';
import { SUPABASE_URL } from '@/lib/supabase-config';

/* Form handlers reject requests when this server-only key is absent. Never fall
   back to the public anonymous key: writes must pass through our guarded APIs. */
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const serverHeaders = { apikey: KEY, Authorization: `Bearer ${KEY}` };
export { SUPABASE_URL };
export const FORM_BUCKET = 'form-uploads';
