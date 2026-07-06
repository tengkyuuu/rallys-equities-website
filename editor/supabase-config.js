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
  url:     "https://wiqebmrqwjlwcvypuwgf.supabase.co",   // rallys-stock-ai-db (paid project)
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpcWVibXJxd2psd2N2eXB1d2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMTU3MzAsImV4cCI6MjA4OTg5MTczMH0.qPlnW1sWKGCMz5lsF4cRtvhFb4KvE0A7q-LW7dVK_rU"    // public "anon" key — safe to expose (RLS-protected)
};

/* Helper: is Supabase configured yet? */
window.RE_SUPABASE_READY = !!(window.RE_SUPABASE.url && window.RE_SUPABASE.anonKey);
