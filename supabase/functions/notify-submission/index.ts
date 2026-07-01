// ════════════════════════════════════════════════════════════════
// Supabase Edge Function: notify-submission
// Emails the owner a BRANDED HTML alert whenever a new row lands in
// `form_submissions`. Triggered by a Database Webhook (Insert).
//
// Required function secrets (Dashboard → Edge Functions → notify-submission → Secrets):
//   RESEND_API_KEY   your Resend API key (re_...)
//   NOTIFY_TO        where alerts are sent, e.g. hello@rallysequities.com
//   NOTIFY_FROM      (optional) verified sender; defaults to Resend's onboarding address
//   SITE_URL         (optional) your site, used for the "Review" button
//
// Deploy:  supabase functions deploy notify-submission --no-verify-jwt
//   (or paste into the dashboard's function editor, then Deploy)
// ════════════════════════════════════════════════════════════════
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const NOTIFY_TO = Deno.env.get("NOTIFY_TO") ?? "";
const NOTIFY_FROM = Deno.env.get("NOTIFY_FROM") ?? "Rallys Equities <onboarding@resend.dev>";
const SITE_URL = (Deno.env.get("SITE_URL") ?? "https://rallys-equities-website-six.vercel.app").replace(/\/$/, "");

const KIND = {
  contact:     { label: "Contact message",            accent: "#1C6BB5" },
  complaint:   { label: "Complaint",                  accent: "#C0392B" },
  feedback:    { label: "Feedback",                   accent: "#0A6B4B" },
  career:      { label: "Career application",         accent: "#6B4FA0" },
  application: { label: "Account-opening application", accent: "#9A7B1F" },
} as Record<string, { label: string; accent: string }>;

const FIELD_LABELS: Record<string, string> = {
  firstName: "First name", lastName: "Last name", fatherOrHusband: "Father / Husband",
  cnic: "CNIC", dob: "Date of birth", gender: "Gender", mobile: "Mobile", phone: "Phone",
  email: "Email", address: "Address", city: "City", province: "Province",
  employment: "Employment", employer: "Employer", income: "Annual income",
  sourceOfFunds: "Source of funds", bank: "Bank", iban: "IBAN / Account",
  experience: "Experience", objective: "Objective", accountType: "Account type",
  riskTolerance: "Risk tolerance", language: "Language", services: "Services / interests",
  subject: "Subject", category: "Category", position: "Position",
  message: "Message", coverLetter: "Cover letter",
};
const ORDER = [
  "subject", "category", "position", "mobile", "phone", "cnic", "dob", "gender",
  "address", "city", "province", "employment", "employer", "income", "sourceOfFunds",
  "bank", "iban", "experience", "objective", "accountType", "riskTolerance", "language",
  "services", "coverLetter", "message",
];
const HIDE_IN_TABLE = new Set(["name", "firstName", "lastName", "email", "reference"]);

const esc = (v: unknown) =>
  String(v ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

function orderedKeys(data: Record<string, unknown>) {
  const has = (k: string) => !HIDE_IN_TABLE.has(k) && data[k] != null && String(data[k]).trim() !== "";
  const known = ORDER.filter(has);
  const extra = Object.keys(data).filter((k) => has(k) && !ORDER.includes(k));
  return [...known, ...extra];
}

function buildHtml(kind: string, data: Record<string, unknown>, files: { field?: string; name?: string }[], reference: string, dateStr: string) {
  const meta = KIND[kind] ?? { label: kind, accent: "#9A7B1F" };
  const name = (data.name as string) || [data.firstName, data.lastName].filter(Boolean).join(" ") || "—";
  const email = (data.email as string) || "";
  const rows = orderedKeys(data).map((k, i) => `
    <tr>
      <td style="padding:10px 14px;background:${i % 2 ? "#ffffff" : "#FAF8F1"};border-bottom:1px solid #F0ECE0;font-family:Arial,Helvetica,sans-serif;font-size:12.5px;color:#7A8694;font-weight:bold;width:38%;vertical-align:top;">${esc(FIELD_LABELS[k] || k)}</td>
      <td style="padding:10px 14px;background:${i % 2 ? "#ffffff" : "#FAF8F1"};border-bottom:1px solid #F0ECE0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#172538;vertical-align:top;">${esc(data[k])}</td>
    </tr>`).join("");

  const filesBlock = files.length ? `
    <tr><td style="padding:6px 32px 0;">
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#9A7B1F;padding:14px 0 8px;border-top:1px solid #ECE5D4;">Attached documents</div>
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#172538;">${files.map((f) => `📎 ${esc(f.field)} — ${esc(f.name)}`).join("<br>")}</div>
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#9AA3AE;margin-top:6px;">Open them in your dashboard → Submissions (secure download).</div>
    </td></tr>` : "";

  const refLine = reference ? `<div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8A93A0;margin-top:7px;">Reference&nbsp;&nbsp;<b style="color:#172538;letter-spacing:.5px;">${esc(reference)}</b></div>` : "";

  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light"></head>
<body style="margin:0;padding:0;background:#EAE6DB;-webkit-text-size-adjust:100%;">
<span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;">New ${esc(meta.label)} from ${esc(name)}${reference ? " · " + esc(reference) : ""}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#EAE6DB;padding:30px 12px;">
<tr><td align="center">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:#ffffff;border:1px solid #E2DCCB;border-radius:14px;overflow:hidden;">
    <!-- header -->
    <tr><td style="background:#0A1525;padding:24px 32px;border-bottom:3px solid #C8A84B;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="vertical-align:middle;">
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:bold;color:#E2C070;letter-spacing:.6px;">Rallys Equities</div>
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:9px;letter-spacing:3px;color:#7E8794;margin-top:4px;">PAKISTAN STOCK EXCHANGE</div>
        </td>
        <td align="right" style="vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#7E8794;white-space:nowrap;">${esc(dateStr)}</td>
      </tr></table>
    </td></tr>
    <!-- title -->
    <tr><td style="padding:28px 32px 2px;">
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:${meta.accent};">New ${esc(meta.label)}</div>
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:25px;color:#12243A;font-weight:bold;margin-top:7px;line-height:1.2;">${esc(name)}</div>
      ${refLine}
    </td></tr>
    <!-- contact chip -->
    <tr><td style="padding:16px 32px 4px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="background:#F4F1E8;border:1px solid #ECE5D4;border-radius:10px;padding:13px 16px;font-family:Arial,Helvetica,sans-serif;">
        <span style="font-size:11px;color:#8A93A0;letter-spacing:.5px;">REPLY TO</span><br>
        ${email ? `<a href="mailto:${esc(email)}" style="font-size:14px;color:#0A6B4B;text-decoration:none;font-weight:bold;">${esc(email)}</a>` : `<span style="font-size:14px;color:#172538;">—</span>`}
      </td></tr></table>
    </td></tr>
    <!-- details -->
    <tr><td style="padding:18px 32px 4px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #ECE5D4;border-radius:10px;border-collapse:separate;overflow:hidden;">${rows}</table>
    </td></tr>
    ${filesBlock}
    <!-- cta -->
    <tr><td align="center" style="padding:24px 32px 30px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="background:#0A6B4B;border-radius:9px;">
        <a href="${SITE_URL}/?edit=1" style="display:inline-block;padding:13px 28px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;">Review in your dashboard&nbsp;→</a>
      </td></tr></table>
    </td></tr>
    <!-- footer -->
    <tr><td style="background:#F4F1E8;border-top:1px solid #ECE5D4;padding:18px 32px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#8A93A0;line-height:1.7;">
      Sent automatically when someone submits a form on your website.<br>
      Open the editor (add <b style="color:#9A7B1F;">?edit=1</b> to your site address) → <b style="color:#5A6B7E;">Submissions</b> to download documents and mark it handled.
    </td></tr>
  </table>
  <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#A39B86;margin-top:14px;">Rallys Equities (Pvt) Ltd · SECP-licensed brokerage · Lahore, Pakistan</div>
</td></tr>
</table>
</body></html>`;
}

function buildText(kind: string, data: Record<string, unknown>, files: { field?: string; name?: string }[], reference: string) {
  const meta = KIND[kind] ?? { label: kind };
  const name = (data.name as string) || [data.firstName, data.lastName].filter(Boolean).join(" ") || "—";
  const lines = [(data.name ? null : null), ...orderedKeys(data).map((k) => `${FIELD_LABELS[k] || k}: ${data[k]}`)].filter(Boolean);
  const files2 = files.map((f) => `${f.field} (${f.name})`).join(", ") || "none";
  return `New ${meta.label} from your website\n\nName: ${name}\nEmail: ${data.email ?? "—"}${reference ? `\nReference: ${reference}` : ""}\n\n${lines.join("\n")}\n\nFiles: ${files2}\n\nReview in your dashboard: ${SITE_URL}/?edit=1 → Submissions`;
}

serve(async (req) => {
  try {
    if (!RESEND_API_KEY || !NOTIFY_TO) {
      return new Response("Missing RESEND_API_KEY or NOTIFY_TO secret", { status: 500 });
    }
    const body = await req.json();
    const row = body.record ?? body;
    const kind: string = row.kind ?? "submission";
    const data: Record<string, unknown> = row.data ?? {};
    const files = (row.files ?? []) as { field?: string; name?: string }[];
    const reference: string = row.reference ?? "";
    const meta = KIND[kind] ?? { label: kind };
    const name = (data.name as string) || [data.firstName, data.lastName].filter(Boolean).join(" ") || (data.email as string) || "";
    const dateStr = new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi", dateStyle: "medium", timeStyle: "short" });

    const subject = `[Rallys] ${meta.label}${reference ? ` ${reference}` : ""} — ${name}`;
    const html = buildHtml(kind, data, files, reference, dateStr);
    const text = buildText(kind, data, files, reference);

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: NOTIFY_FROM, to: NOTIFY_TO, subject, html, text }),
    });
    if (!r.ok) {
      const detail = await r.text();
      return new Response(`Resend error: ${detail}`, { status: 502 });
    }
    return new Response("ok");
  } catch (e) {
    return new Response(`error: ${(e as Error).message}`, { status: 500 });
  }
});
