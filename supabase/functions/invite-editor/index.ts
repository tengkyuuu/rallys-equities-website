// ════════════════════════════════════════════════════════════════
// Supabase Edge Function: invite-editor
// Lets a signed-in editor invite a new editor by email. The invitee gets
// an email with a link to set their own password, then can edit the site
// at /admin.
//
// Security: the request must carry a valid *logged-in user* token — the
// public anon key alone is rejected — so only existing editors can invite.
// The invite itself is sent with the service-role key (auto-injected by
// Supabase; never exposed to the browser).
//
// Deploy:  supabase functions deploy invite-editor
//          (JWT verification stays ON — the caller must be authenticated.)
// ════════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { ...CORS, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // 1) Confirm the caller is a signed-in editor (not just the public anon key).
    const jwt = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    const asUser = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: `Bearer ${jwt}` } } });
    const { data: { user }, error: uErr } = await asUser.auth.getUser(jwt);
    if (uErr || !user) return json({ error: "Please log in as an editor first." }, 401);

    // 2) Validate input.
    const { email, redirectTo } = await req.json().catch(() => ({}));
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return json({ error: "Please enter a valid email address." }, 400);

    // 3) Send the invite with the service role.
    const admin = createClient(SUPABASE_URL, SERVICE);
    const { error } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: redirectTo || Deno.env.get("SITE_URL") || undefined,
    });
    if (error) return json({ error: error.message }, 400);
    return json({ ok: true, invited: email });
  } catch (e) {
    return json({ error: String((e as Error).message) }, 500);
  }
});
