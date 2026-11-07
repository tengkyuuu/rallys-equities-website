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
//   · tables + inline styles only (no flex/grid), 560px with a mobile <style> override
//   · the logo is dark ink on transparent, so it sits on an ivory disc inside the
//     navy hero. Outlook ignores border-radius and gradients: it gets a square
//     badge on solid navy, which still reads as intentional.
//   · Outlook gets a VML roundrect so the CTA isn't a bare square, and
//     mso-line-height-rule:exactly keeps Word's line-height from drifting.
//   · "light only" color-scheme: dark-mode inversion would wreck the palette.
//   · Motion is progressive: inline styles are the finished state; @keyframes live
//     in their OWN <style> block so a client that rejects them (Gmail, Outlook for
//     Windows) drops only that block and keeps the responsive rules. Apple Mail,
//     iOS, Outlook for Mac, Samsung and Thunderbird play the entrance.
const BRAND = {
  ink: "#12243A",       // navy: headings, hero
  body: "#4A5768",      // body copy
  dim: "#6B7480",       // captions (AA on white)
  goldLt: "#C8A84B",    // decorative gold
  goldHi: "#D9BD6A",    // gold on navy
  green: "#0A6B4B",     // emerald action
  page: "#EDE8DC",      // page backdrop
  SANS: "-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif",
  SERIF: "Georgia,'Times New Roman',serif",
};
const LOGO = "https://www.rallysequities.com/assets/img/logo.png";

// Concentric gold rings behind the logo, echoing the arcs in the mark.
const RINGS = [
  [70, ".30"], [112, ".18"], [160, ".10"], [216, ".06"],
].map(([r, a]) => `transparent ${r}px,rgba(200,168,75,${a}) ${Number(r) + 1}px,transparent ${Number(r) + 2}px`).join(",");

function inviteHtml(email: string, link: string): string {
  const L = esc(link);
  const who = esc(email);
  const ease = "cubic-bezier(.2,.7,.2,1)";
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
  @media only screen and (max-width:560px){
    .px{ padding-left:26px!important; padding-right:26px!important; }
    .h1{ font-size:26px!important; }
  }
</style>
<style>
  @keyframes rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
  @keyframes pop{0%{opacity:0;transform:scale(.82)}60%{opacity:1;transform:scale(1.04)}100%{transform:scale(1)}}
  @keyframes halo{0%{box-shadow:0 0 0 0 rgba(200,168,75,.55),0 14px 30px -12px rgba(0,0,0,.5)}100%{box-shadow:0 0 0 22px rgba(200,168,75,0),0 14px 30px -12px rgba(0,0,0,.5)}}
  @keyframes rings{from{opacity:0;background-size:60% 60%}to{opacity:1;background-size:100% 100%}}
  @keyframes draw{from{width:0}to{width:56px}}
  @keyframes shine{0%{background-position:-200px 0}55%,100%{background-position:320px 0}}
  .hero{animation:rings 1.6s ${ease} both}
  .medal{animation:pop .9s cubic-bezier(.2,.8,.2,1) .15s both, halo 1.8s ease-out 1s 2}
  .r1{animation:rise .8s ${ease} .45s both}
  .r2{animation:rise .8s ${ease} .6s both}
  .r3{animation:rise .8s ${ease} .8s both}
  .r4{animation:rise .8s ${ease} .95s both}
  .rule{animation:draw 1.1s cubic-bezier(.6,0,.2,1) .55s both}
  .btn{background-image:linear-gradient(100deg,transparent 30%,rgba(255,255,255,.25) 50%,transparent 70%);background-repeat:no-repeat;background-size:180px 100%;animation:shine 2.8s ease-in-out 1.6s 2 both}
  @media (prefers-reduced-motion:reduce){.hero,.medal,.r1,.r2,.r3,.r4,.rule,.btn{animation:none!important}}
</style>
</head>
<body style="margin:0;padding:0;width:100%;background:${BRAND.page};">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;opacity:0;color:${BRAND.page};font-size:1px;line-height:1px;">You've been given editor access to the Rallys Equities website — set your password to begin.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.page};">
    <tr><td align="center" style="padding:44px 14px 52px;">

      <!-- width attr is the Outlook fallback (it ignores max-width) -->
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 40px 70px -40px rgba(18,36,58,.45);">

        <!-- hero: navy with concentric gold rings -->
        <tr><td align="center" bgcolor="${BRAND.ink}" class="hero px" style="padding:46px 48px 44px;background-color:${BRAND.ink};background-image:radial-gradient(circle at 50% 78px,${RINGS}),linear-gradient(180deg,#152B45 0%,#0F1F33 100%);background-repeat:no-repeat;background-position:center top;background-size:100% 100%;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;border-collapse:separate;">
            <tr><td class="medal" align="center" valign="middle" width="96" height="96" bgcolor="#FBF9F3" style="width:96px;height:96px;border-radius:50%;background:#FBF9F3;border:2px solid ${BRAND.goldLt};box-shadow:0 14px 30px -12px rgba(0,0,0,.5);">
              <img src="${LOGO}" width="66" height="47" alt="Rallys Equities" style="display:block;width:66px;height:47px;margin:0 auto;">
            </td></tr>
          </table>
          <div class="r1" style="padding-top:26px;font-family:${BRAND.SANS};font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${BRAND.goldHi};mso-line-height-rule:exactly;line-height:15px;">Editor Invitation</div>
          <h1 class="h1 r2" style="margin:12px 0 0;font-family:${BRAND.SERIF};font-size:31px;font-weight:normal;line-height:1.22;color:#ffffff;letter-spacing:-.2px;mso-line-height-rule:exactly;">Welcome to the team<br>behind <i style="color:#E7D49A;">Rallys&nbsp;Equities</i></h1>
          <div class="rule" style="width:56px;height:2px;line-height:2px;font-size:0;background:${BRAND.goldLt};margin:22px auto 0;border-radius:2px;">&nbsp;</div>
        </td></tr>

        <!-- message -->
        <tr><td align="center" class="px" style="padding:38px 52px 0;">
          <p class="r3" style="margin:0;font-family:${BRAND.SANS};font-size:16px;line-height:1.7;color:${BRAND.body};mso-line-height-rule:exactly;">You've been given <b style="color:${BRAND.ink};font-weight:600;">editor access</b> to the Rallys Equities website. Choose a password and you can start updating pages right away&nbsp;— no software, no setup.</p>
        </td></tr>

        <!-- CTA (VML fallback keeps the rounded button in Outlook) -->
        <tr><td align="center" class="px r4" style="padding:30px 52px 0;">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${L}" style="height:50px;v-text-anchor:middle;width:250px;" arcsize="50%" stroke="f" fillcolor="${BRAND.green}">
            <w:anchorlock/>
            <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">Set your password &rarr;</center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-->
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
            <tr><td class="btn" align="center" style="border-radius:999px;background-color:${BRAND.green};box-shadow:0 10px 20px -12px rgba(18,36,58,.45);">
              <a href="${L}" style="display:inline-block;padding:17px 44px;font-family:${BRAND.SANS};font-size:15.5px;font-weight:600;line-height:1;color:#ffffff;text-decoration:none;border-radius:999px;letter-spacing:.3px;">Set your password &nbsp;&rarr;</a>
            </td></tr>
          </table>
          <!--<![endif]-->
          <div style="padding-top:15px;font-family:${BRAND.SANS};font-size:12.5px;line-height:1.6;color:${BRAND.dim};">
            Secure one-time link &nbsp;·&nbsp; expires in 24 hours &nbsp;·&nbsp; <a href="${L}" style="color:${BRAND.green};text-decoration:underline;">copy link</a>
          </div>
        </td></tr>

        <tr><td class="px" style="padding:40px 52px 0;"><div style="height:1px;line-height:1px;font-size:0;background:#EEE8DA;">&nbsp;</div></td></tr>

        <!-- footer -->
        <tr><td align="center" class="px" style="padding:24px 52px 34px;font-family:${BRAND.SANS};font-size:12px;line-height:1.7;color:#6E7682;">
          This invitation was sent to <span style="color:${BRAND.ink};">${who}</span>.<br>Not expecting it? Simply ignore this email — nothing happens until a password is set.
        </td></tr>
        <tr><td height="4" bgcolor="${BRAND.green}" style="height:4px;line-height:4px;font-size:0;background-color:${BRAND.green};background-image:linear-gradient(90deg,${BRAND.green} 0%,${BRAND.green} 70%,${BRAND.goldLt} 70%,${BRAND.goldLt} 100%);">&nbsp;</td></tr>
      </table>

      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;">
        <tr><td align="center" style="padding:22px 12px 0;font-family:${BRAND.SERIF};font-size:13px;color:#66551F;letter-spacing:.3px;">Rallys Equities (Pvt) Ltd</td></tr>
        <tr><td align="center" style="padding:4px 12px 0;font-family:${BRAND.SANS};font-size:12px;color:#5E5848;">Lahore, Pakistan &nbsp;·&nbsp; <a href="https://www.rallysequities.com" style="color:#5E5848;text-decoration:underline;">rallysequities.com</a></td></tr>
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
    "EDITOR INVITATION — RALLYS EQUITIES",
    "",
    "Welcome to the team behind Rallys Equities.",
    "",
    "You've been given editor access to the Rallys Equities website.",
    "Choose a password and you can start updating pages right away — no software, no setup.",
    "",
    "Set your password (secure one-time link, expires in 24 hours):",
    link,
    "",
    `This invitation was sent to ${email}.`,
    "Not expecting it? Simply ignore this email — nothing happens until a password is set.",
    "",
    "Rallys Equities (Pvt) Ltd · Lahore, Pakistan · rallysequities.com",
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
