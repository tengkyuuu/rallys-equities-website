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

// Only the site owner(s) may add or remove editors. OWNER_EMAILS is a comma/space
// separated allowlist. If unset, behaviour is unchanged (any signed-in editor) so
// deploying can't lock anyone out — set it to actually restrict management.
function isOwner(user: { email?: string | null }): boolean {
  const raw = (Deno.env.get("OWNER_EMAILS") || "").trim();
  if (!raw) return true;
  const allow = raw.split(/[,\s]+/).map((s: string) => s.toLowerCase()).filter(Boolean);
  return allow.includes((user.email || "").toLowerCase());
}

const esc = (v: unknown) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

// Send the invite as a branded email via Resend. Best-effort: returns an error
// string on failure so the caller can still fall back to sharing the link.
async function sendInviteEmail(email: string, link: string): Promise<string | null> {
  const KEY = Deno.env.get("RESEND_API_KEY") || "";
  // Reuse the submission-alert sender if a dedicated one isn't set; last resort is Resend's sandbox address.
  const FROM = Deno.env.get("INVITE_FROM") || Deno.env.get("NOTIFY_FROM") || "Rallys Equities <onboarding@resend.dev>";
  if (!KEY) return "RESEND_API_KEY secret is not set";
  const subject = "You're invited to edit the Rallys Equities website";
  const safeLink = esc(link);
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light"></head>
<body style="margin:0;padding:0;background:#E9E4D8;-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#E9E4D8;">Set your password to start managing the Rallys Equities website.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#E9E4D8;padding:34px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:544px;background:#ffffff;border:1px solid #E7DFC9;border-radius:18px;overflow:hidden;">
        <tr><td style="height:5px;line-height:5px;font-size:0;background:#0A6B4B;">&nbsp;</td></tr>
        <tr><td style="padding:32px 38px 0;">
          <img src="https://www.rallysequities.com/assets/img/logo.png" width="48" height="48" alt="Rallys Equities" style="display:block;border:0;outline:none;text-decoration:none;border-radius:11px;margin-bottom:15px;">
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:25px;font-weight:bold;color:#9A7B1F;letter-spacing:.3px;line-height:1.1;">Rallys Equities</div>
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:#AAB1BB;margin-top:6px;">Website Editor Invite</div>
        </td></tr>
        <tr><td style="padding:22px 38px 4px;font-family:Arial,Helvetica,sans-serif;color:#243244;">
          <p style="margin:0 0 12px;font-size:16px;line-height:1.65;">You've been invited to help manage the <b>Rallys Equities</b> website.</p>
          <p style="margin:0;font-size:14px;line-height:1.7;color:#5B6674;">Set your password below and you're ready to edit content, publish posts, and update the site — no technical setup needed.</p>
        </td></tr>
        <tr><td style="padding:26px 38px 4px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:12px;background:#0A6B4B;">
            <a href="${safeLink}" style="display:inline-block;padding:15px 32px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:12px;">Set my password &rarr;</a>
          </td></tr></table>
        </td></tr>
        <tr><td style="padding:4px 38px 22px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8A93A0;">
          For your security, this invite expires in about 24 hours.
        </td></tr>
        <tr><td style="padding:0 38px;"><div style="border-top:1px solid #F1ECDF;font-size:0;line-height:0;">&nbsp;</div></td></tr>
        <tr><td style="padding:16px 38px 4px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#8A93A0;">
          Button not working? Copy and paste this link into your browser:<br>
          <a href="${safeLink}" style="color:#0A6B4B;word-break:break-all;">${safeLink}</a>
        </td></tr>
        <tr><td style="padding:18px 38px 30px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.7;color:#AAB1BB;">
          If you weren't expecting this invite, you can safely ignore this email.<br>
          <span style="color:#C3B27A;font-weight:bold;">Rallys Equities (Pvt) Ltd</span> · Lahore, Pakistan
        </td></tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:544px;"><tr>
        <td style="padding:16px 8px 0;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:10.5px;letter-spacing:.4px;color:#AEA890;">SECP-licensed brokerage · PSX TREC holder</td>
      </tr></table>
    </td></tr>
  </table>
</body></html>`;
  const text = `You've been invited to help manage the Rallys Equities website.\n\nSet your password and get started (valid ~24 hours):\n${link}\n\nIf you weren't expecting this, you can ignore this email.`;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: email, subject, html, text }),
    });
    if (!r.ok) return `Resend ${r.status}: ${(await r.text().catch(() => "")).slice(0, 200)}`;
    return null;
  } catch (e) {
    return String((e as Error).message);
  }
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

    // Owner gate. `me` lets the admin UI check its own status; everything that
    // adds or removes editors requires an owner (see isOwner / OWNER_EMAILS).
    const owner = isOwner(user);
    if (body.action === "me") return json({ owner });
    if (!owner) return json({ error: "Only the site owner can add or remove editors." }, 403);

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

    // Email the invite (best-effort). On failure we still return the link so the
    // admin can share it manually — the copy-link flow stays as a fallback.
    const emailError = link ? await sendInviteEmail(email, link) : "No link was generated";
    return json({ ok: true, email, link, expires_at, emailed: !emailError, emailError: emailError || undefined });
  } catch (e) {
    return json({ error: String((e as Error).message) }, 500);
  }
});
