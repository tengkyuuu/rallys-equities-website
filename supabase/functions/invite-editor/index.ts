// ════════════════════════════════════════════════════════════════
// Supabase Edge Function: invite-editor
// Server-side (service-role) invite flow — the "own mailer via generateLink"
// pattern, adapted: instead of sending email, we RETURN the invite link so the
// admin can share it themselves (works with no email provider / no domain).
//
// Only a signed-in editor may call this (the anon key alone is rejected).
//
// POST body:
//   { email }                → create/refresh an invite; returns { link, email, expires_at }
//   { action:"revoke", id }  → cancel an invite (deletes the unconfirmed user if unaccepted)
//
// Deploy:  supabase functions deploy invite-editor   (JWT verification stays ON)
// ════════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { ...CORS, "Content-Type": "application/json" } });

// Find an existing auth user by email (small user base → a couple of pages max).
async function findUser(admin: ReturnType<typeof createClient>, email: string) {
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data?.users?.length) break;
    const u = data.users.find((x) => (x.email || "").toLowerCase() === email);
    if (u) return u;
    if (data.users.length < 200) break;
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // 1) Caller must be a signed-in editor (not just the public anon key).
    const jwt = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    const asUser = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: `Bearer ${jwt}` } } });
    const { data: { user }, error: uErr } = await asUser.auth.getUser(jwt);
    if (uErr || !user) return json({ error: "Please log in as an editor first." }, 401);

    const body = await req.json().catch(() => ({}));
    const admin = createClient(SUPABASE_URL, SERVICE);

    // 2) Revoke an invite.
    if (body.action === "revoke") {
      if (!body.id) return json({ error: "Missing invite id." }, 400);
      const { data: inv } = await admin.from("invites").select("*").eq("id", body.id).maybeSingle();
      if (inv && !inv.accepted_at && inv.auth_user_id)
        await admin.auth.admin.deleteUser(inv.auth_user_id).catch(() => {});
      await admin.from("invites").delete().eq("id", body.id);
      return json({ ok: true });
    }

    // 3) Create (or refresh) an invite and return the link.
    const email = String(body.email || "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return json({ error: "Please enter a valid email address." }, 400);

    const existing = await findUser(admin, email);
    if (existing) {
      if (existing.email_confirmed_at || existing.confirmed_at)
        return json({ error: "That email is already an active editor." }, 409);
      // orphaned unconfirmed invitee → remove so we can issue a fresh link
      await admin.auth.admin.deleteUser(existing.id).catch(() => {});
    }
    // clear any prior pending invite rows for this email
    await admin.from("invites").delete().eq("email", email).is("accepted_at", null);

    const redirectTo = body.redirectTo || Deno.env.get("SITE_URL") || undefined;
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: "invite",
      email,
      options: { redirectTo, data: { role: "editor" } },
    });
    if (linkErr) return json({ error: linkErr.message }, 400);

    const link = (linkData as { properties?: { action_link?: string } })?.properties?.action_link || null;
    const newUserId = (linkData as { user?: { id?: string } })?.user?.id || null;
    const expires_at = new Date(Date.now() + 24 * 3600 * 1000).toISOString();

    await admin.from("invites").insert({
      email, role: "editor", invited_by: user.id, auth_user_id: newUserId, expires_at,
    });

    return json({ ok: true, email, link, expires_at });
  } catch (e) {
    return json({ error: String((e as Error).message) }, 500);
  }
});
