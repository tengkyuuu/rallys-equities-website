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

// ── Branded invite email ────────────────────────────────────────────────────
// Built to survive real mail clients, not just a browser preview:
//   · tables + inline styles only (no flex/grid), 600px with a mobile <style> override
//   · the logo keeps its native 140×99 aspect — served at 112×79 so it stays crisp
//     on retina. It sits on an ivory plate because the mark is dark ink on transparent.
//   · Outlook gets a VML roundrect so the CTA isn't a bare square, and
//     mso-line-height-rule:exactly keeps Word's line-height from drifting.
//   · "light only" color-scheme: Gmail/Outlook dark-mode inversion would wreck the
//     ivory-and-gold palette, so we opt out and ship one deliberate look.
const BRAND = {
  ink: "#12243A",       // primary text (navy)
  body: "#48586B",      // body copy
  dim: "#8B93A0",       // captions
  gold: "#9A7B1F",      // brand gold (AA on white)
  goldLt: "#C8A84B",    // decorative gold
  green: "#0A6B4B",     // emerald action
  page: "#EAE5D9",      // page backdrop
  cardLine: "#E4DCC6",
  ivory: "#FAF8F1",
  hair: "#EFE9D9",
  SANS: "-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif",
  SERIF: "Georgia,'Times New Roman',serif",
};
const LOGO = "https://www.rallysequities.com/assets/img/logo.png";

// One gold-dot bullet row of the "what you can do" list.
const perk = (title: string, desc: string) => `
            <tr>
              <td width="22" style="vertical-align:top;padding:8px 0 0;">
                <div style="width:6px;height:6px;border-radius:50%;background:${BRAND.goldLt};font-size:0;line-height:6px;">&nbsp;</div>
              </td>
              <td style="padding:0 0 11px;font-family:${BRAND.SANS};font-size:14px;line-height:1.55;color:${BRAND.body};mso-line-height-rule:exactly;">
                <b style="color:${BRAND.ink};font-weight:600;">${title}</b> &mdash; ${desc}
              </td>
            </tr>`;

function inviteHtml(email: string, link: string): string {
  const L = esc(link);
  const who = esc(email);
  return `<!doctype html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light">
<title>Your Rallys Equities editor invite</title>
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<style>
  body,table,td,a{ -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  table,td{ mso-table-lspace:0pt; mso-table-rspace:0pt; border-collapse:collapse; }
  img{ -ms-interpolation-mode:bicubic; border:0; outline:none; text-decoration:none; }
  @media only screen and (max-width:620px){
    .px{ padding-left:26px!important; padding-right:26px!important; }
    .h1{ font-size:24px!important; line-height:1.24!important; }
    .cta a{ display:block!important; padding-left:18px!important; padding-right:18px!important; }
    .stack{ display:block!important; width:100%!important; }
  }
</style>
</head>
<body style="margin:0;padding:0;width:100%;background:${BRAND.page};">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;opacity:0;color:${BRAND.page};font-size:1px;line-height:1px;">Set your password to start managing the Rallys Equities website — the link is good for about 24 hours.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.page};">
    <tr><td align="center" style="padding:38px 12px 46px;">

      <!-- width attr is the Outlook fallback (it ignores max-width); the style lets
           every other client shrink the card on a narrow phone instead of overflowing -->
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid ${BRAND.cardLine};border-radius:16px;overflow:hidden;box-shadow:0 24px 60px -30px rgba(30,40,55,.28);">

        <!-- emerald rule + gold hairline: the brand's signature edge -->
        <tr><td style="height:4px;line-height:4px;font-size:0;background:${BRAND.green};">&nbsp;</td></tr>
        <tr><td style="height:1px;line-height:1px;font-size:0;background:${BRAND.goldLt};">&nbsp;</td></tr>

        <!-- masthead: the logo lockup already carries the name, so no repeated wordmark -->
        <tr><td align="center" class="px" style="background:${BRAND.ivory};border-bottom:1px solid ${BRAND.hair};padding:30px 40px 24px;">
          <img src="${LOGO}" width="112" height="79" alt="Rallys Equities" style="display:block;width:112px;height:79px;margin:0 auto 14px;">
          <div style="font-family:${BRAND.SANS};font-size:10px;font-weight:700;letter-spacing:2.6px;text-transform:uppercase;color:${BRAND.gold};mso-line-height-rule:exactly;line-height:14px;">Website Editor Access</div>
        </td></tr>

        <!-- invitation -->
        <tr><td class="px" style="padding:34px 40px 0;">
          <h1 class="h1" style="margin:0;font-family:${BRAND.SERIF};font-size:28px;font-weight:normal;line-height:1.22;color:${BRAND.ink};mso-line-height-rule:exactly;">You've been invited to manage the&nbsp;website</h1>
          <p style="margin:14px 0 0;font-family:${BRAND.SANS};font-size:15px;line-height:1.68;color:${BRAND.body};mso-line-height-rule:exactly;">
            Someone at <b style="color:${BRAND.ink};font-weight:600;">Rallys Equities</b> has given you editor access. Set a password and you're in — no software to install, nothing technical to configure.
          </p>
        </td></tr>

        <!-- what the access gives them -->
        <tr><td class="px" style="padding:24px 40px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FCFBF6;border:1px solid ${BRAND.hair};border-radius:12px;">
            <tr><td style="padding:18px 20px 8px;">
              <div style="font-family:${BRAND.SANS};font-size:9.5px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:${BRAND.gold};padding-bottom:12px;mso-line-height-rule:exactly;line-height:13px;">What you'll be able to do</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${perk("Edit any text or photo", "click it on the page and type.")}${perk("Publish market insights", "write posts for the Insights page.")}${perk("Tune the site", "colours, fonts, and which sections show.")}</table>
            </td></tr>
          </table>
        </td></tr>

        <!-- CTA (VML fallback keeps the rounded button in Outlook) -->
        <tr><td class="px" align="center" style="padding:28px 40px 0;">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${L}" style="height:50px;v-text-anchor:middle;width:258px;" arcsize="24%" stroke="f" fillcolor="${BRAND.green}">
            <w:anchorlock/>
            <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">Set my password &rarr;</center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-->
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="cta" style="margin:0 auto;">
            <tr><td align="center" style="border-radius:12px;background:${BRAND.green};">
              <a href="${L}" style="display:inline-block;padding:16px 34px;font-family:${BRAND.SANS};font-size:15px;font-weight:600;line-height:1;color:#ffffff;text-decoration:none;border-radius:12px;letter-spacing:.2px;">Set my password &rarr;</a>
            </td></tr>
          </table>
          <!--<![endif]-->
          <div style="font-family:${BRAND.SANS};font-size:12px;line-height:1.6;color:${BRAND.dim};padding-top:14px;mso-line-height-rule:exactly;">
            One-time link, valid for about 24&nbsp;hours &nbsp;·&nbsp; sent to ${who}
          </div>
        </td></tr>

        <tr><td class="px" style="padding:26px 40px 0;"><div style="height:1px;line-height:1px;font-size:0;background:${BRAND.hair};">&nbsp;</div></td></tr>

        <!-- copy-paste fallback -->
        <tr><td class="px" style="padding:20px 40px 0;">
          <div style="font-family:${BRAND.SANS};font-size:12px;font-weight:600;color:${BRAND.ink};padding-bottom:7px;">Button not working?</div>
          <div style="font-family:${BRAND.SANS};font-size:11.5px;line-height:1.7;color:${BRAND.dim};padding-bottom:9px;">Paste this address into your browser:</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.ivory};border:1px solid ${BRAND.hair};border-radius:9px;">
            <tr><td style="padding:11px 13px;font-family:${BRAND.SANS};font-size:11.5px;line-height:1.6;word-break:break-all;">
              <a href="${L}" style="color:${BRAND.green};text-decoration:underline;word-break:break-all;">${L}</a>
            </td></tr>
          </table>
        </td></tr>

        <!-- footer -->
        <tr><td class="px" style="padding:26px 40px 30px;">
          <div style="font-family:${BRAND.SANS};font-size:11.5px;line-height:1.7;color:${BRAND.dim};">
            Didn't expect this? You can safely ignore this email — the link expires on its own and no account is created until a password is set.
          </div>
        </td></tr>
        <tr><td class="px" style="background:${BRAND.ivory};border-top:1px solid ${BRAND.hair};padding:20px 40px;">
          <div style="font-family:${BRAND.SERIF};font-size:14px;color:${BRAND.gold};letter-spacing:.2px;">Rallys Equities (Pvt) Ltd</div>
          <div style="font-family:${BRAND.SANS};font-size:11px;line-height:1.7;color:${BRAND.dim};padding-top:4px;">
            Lahore, Pakistan &nbsp;·&nbsp; <a href="https://www.rallysequities.com" style="color:${BRAND.dim};text-decoration:underline;">rallysequities.com</a>
          </div>
        </td></tr>
      </table>

      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
        <tr><td align="center" style="padding:18px 12px 0;font-family:${BRAND.SANS};font-size:10px;letter-spacing:1.4px;text-transform:uppercase;color:#A79F88;mso-line-height-rule:exactly;line-height:15px;">
          SECP-licensed brokerage &nbsp;·&nbsp; PSX TREC holder
        </td></tr>
      </table>

    </td></tr>
  </table>
</body>
</html>`;
}

// Send the invite as a branded email via Resend. Best-effort: returns an error
// string on failure so the caller can still fall back to sharing the link.
async function sendInviteEmail(email: string, link: string): Promise<string | null> {
  const KEY = Deno.env.get("RESEND_API_KEY") || "";
  // Reuse the submission-alert sender if a dedicated one isn't set; last resort is Resend's sandbox address.
  const FROM = Deno.env.get("INVITE_FROM") || Deno.env.get("NOTIFY_FROM") || "Rallys Equities <onboarding@resend.dev>";
  if (!KEY) return "RESEND_API_KEY secret is not set";
  const subject = "You're invited to manage the Rallys Equities website";
  const html = inviteHtml(email, link);
  const text = [
    "RALLYS EQUITIES — WEBSITE EDITOR ACCESS",
    "",
    "You've been invited to manage the Rallys Equities website.",
    "Set a password and you're in — nothing to install.",
    "",
    "What you'll be able to do:",
    "  · Edit any text or photo — click it on the page and type.",
    "  · Publish market insights to the Insights page.",
    "  · Tune the site's colours, fonts, and which sections show.",
    "",
    "Set your password (one-time link, valid ~24 hours):",
    link,
    "",
    `This invite was sent to ${email}.`,
    "Didn't expect it? Ignore this email — the link expires on its own.",
    "",
    "Rallys Equities (Pvt) Ltd · Lahore, Pakistan · rallysequities.com",
    "SECP-licensed brokerage · PSX TREC holder",
  ].join("\n");
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

    // Owner gate. `me` lets the admin UI check its own status and (for viewers)
    // see who the owners are. Everything that adds/removes editors requires an owner.
    const owner = isOwner(user);
    if (body.action === "me") {
      const rawOwners = (Deno.env.get("OWNER_EMAILS") || "").trim();
      const owners = rawOwners ? rawOwners.split(/[,\s]+/).map((s: string) => s.toLowerCase()).filter(Boolean) : [];
      return json({ owner, owners });
    }
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

    // 2b) Reconcile: mark accepted any pending invite whose auth user is already
    // confirmed (fixes rows accepted before accepted_at was tracked). Owner-only.
    if (body.action === "reconcile") {
      const { data: pend } = await admin.from("invites").select("id,email").is("accepted_at", null);
      let reconciled = 0;
      if (pend && pend.length) {
        const confirmed = new Set<string>();
        for (let page = 1; page <= 10; page++) {
          const { data } = await admin.auth.admin.listUsers({ page, perPage: 200 });
          if (!data?.users?.length) break;
          for (const u of data.users) if (u.email && (u.email_confirmed_at || u.confirmed_at)) confirmed.add(u.email.toLowerCase());
          if (data.users.length < 200) break;
        }
        for (const inv of pend) {
          if (confirmed.has((inv.email || "").toLowerCase())) {
            await admin.from("invites").update({ accepted_at: new Date().toISOString() }).eq("id", inv.id);
            reconciled++;
          }
        }
      }
      return json({ ok: true, reconciled });
    }

    // 2d) Remove an editor entirely — delete their login AND invite row. Owner-only.
    // Guards: can't remove yourself, and can't remove an owner (manage owners via OWNER_EMAILS).
    if (body.action === "remove") {
      let email = String(body.email || "").trim().toLowerCase();
      if (!email && body.id) {
        const { data: inv } = await admin.from("invites").select("email").eq("id", body.id).maybeSingle();
        email = String((inv && inv.email) || "").toLowerCase();
      }
      if (!email) return json({ error: "Which editor? Missing email." }, 400);
      if (email === String(user.email || "").toLowerCase()) return json({ error: "You can't remove your own account." }, 400);
      if (isOwner({ email })) return json({ error: "Owners can't be removed here — update the OWNER_EMAILS setting instead." }, 400);
      const u = await findUser(admin, email);
      if (u) await admin.auth.admin.deleteUser(u.id).catch(() => {});
      await admin.from("invites").delete().eq("email", email);
      return json({ ok: true });
    }

    // 3) Create (or refresh) an invite and return the link.
    const email = String(body.email || "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return json({ error: "Please enter a valid email address." }, 400);

    const existing = await findUser(admin, email);
    if (existing) {
      if (existing.email_confirmed_at || existing.confirmed_at) {
        // Already a real editor — heal a possibly-stale invite row so the UI shows Accepted.
        await admin.from("invites").update({ accepted_at: new Date().toISOString() }).eq("email", email).is("accepted_at", null);
        return json({ error: "That email is already an active editor — their status has been updated to Accepted.", alreadyEditor: true }, 409);
      }
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
