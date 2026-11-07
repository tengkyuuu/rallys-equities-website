/* Supabase project used for published content, form submissions and the editor.
   The anon key is public by design: Row-Level Security means the public can only read
   published content and insert form submissions. Set the NEXT_PUBLIC_* variables per
   environment; the fallbacks point to the restored production project. */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vlclduwwlqmenevmgiof.supabase.co';
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsY2xkdXd3bHFtZW5ldm1naW9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQwNjAzMjcsImV4cCI6MjEwOTYzNjMyN30.BUOZZ6G71tuSBh5poM7auCZHCS2M8ITZCzTIVap-MQo';

export const supabaseHeaders = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` };
