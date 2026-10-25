/* Supabase project used for published content, form submissions and the editor.
   The anon key is public by design: Row-Level Security means the public can only read
   published content and insert form submissions. Set the NEXT_PUBLIC_* variables per
   environment; the fallbacks are the production project, which was already public in
   the original site's editor/supabase-config.js. */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wiqebmrqwjlwcvypuwgf.supabase.co';
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpcWVibXJxd2psd2N2eXB1d2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMTU3MzAsImV4cCI6MjA4OTg5MTczMH0.qPlnW1sWKGCMz5lsF4cRtvhFb4KvE0A7q-LW7dVK_rU';

export const supabaseHeaders = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` };
