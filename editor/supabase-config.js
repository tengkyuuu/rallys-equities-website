/* ════════════════════════════════════════════════════════════════
   Supabase configuration for the Rallys Equities content editor.

   Fill these in with YOUR Supabase project values (Project Settings →
   API). The anon (public) key is SAFE to expose in the browser — the
   database is protected by Row-Level Security so the public can only
   READ published content, never write.

   Until you paste real values here, the live site simply shows its
   built-in default content (nothing breaks).
   ════════════════════════════════════════════════════════════════ */
window.RE_SUPABASE = {
  url:     "https://gvzjwkfktovrzkabebrg.supabase.co",   // e.g. "https://abcdefgh.supabase.co"
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2emp3a2ZrdG92cnprYWJlYnJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMzIyODQsImV4cCI6MjA5NzcwODI4NH0.4z_x9RU74cb8nNu6BObcbGldLt6gZ3tox5QrTZH_AOA"    // e.g. "eyJhbGciOiJIUzI1NiІ..."  (the public "anon" key)
};

/* Helper: is Supabase configured yet? */
window.RE_SUPABASE_READY = !!(window.RE_SUPABASE.url && window.RE_SUPABASE.anonKey);
