// ════════════════════════════════════════════════════════════════
// Supabase Edge Function: notify-submission
// Emails the owner whenever a new row lands in `form_submissions`.
// Triggered by a Database Webhook (Insert on public.form_submissions).
//
// Required function secrets (Dashboard → Edge Functions → notify-submission → Secrets):
//   RESEND_API_KEY   your Resend API key (re_...)
//   NOTIFY_TO        where alerts are sent, e.g. hello@rallysequities.com
//   NOTIFY_FROM      (optional) verified sender; defaults to Resend's onboarding address
//
// Deploy:  supabase functions deploy notify-submission --no-verify-jwt
//   (or paste this into the dashboard's function editor)
// ════════════════════════════════════════════════════════════════
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const NOTIFY_TO = Deno.env.get("NOTIFY_TO") ?? "";
const NOTIFY_FROM = Deno.env.get("NOTIFY_FROM") ?? "Rallys Equities <onboarding@resend.dev>";

const LABELS: Record<string, string> = {
  contact: "Contact message",
  complaint: "Complaint",
  feedback: "Feedback",
  career: "Career application",
  application: "Account-opening application",
};

serve(async (req) => {
  try {
    if (!RESEND_API_KEY || !NOTIFY_TO) {
      return new Response("Missing RESEND_API_KEY or NOTIFY_TO secret", { status: 500 });
    }
    const body = await req.json();
    const row = body.record ?? body;           // DB webhook payload: { type, table, record, ... }
    const kind: string = row.kind ?? "submission";
    const data: Record<string, unknown> = row.data ?? {};
    const label = LABELS[kind] ?? kind;

    const who =
      (data.name as string) ||
      [data.firstName, data.lastName].filter(Boolean).join(" ") ||
      (data.email as string) ||
      "(no name)";

    const lines = Object.entries(data)
      .filter(([, v]) => v != null && String(v).trim() !== "")
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");

    const files = (row.files ?? [])
      .map((f: { field?: string; name?: string }) => `${f.field} (${f.name})`)
      .join(", ") || "none";

    const subject =
      `[Rallys] ${label}${row.reference ? ` ${row.reference}` : ""} — ${who}`;

    const text =
      `New ${label} from your website:\n\n${lines}\n\n` +
      `Files: ${files}\n\n` +
      `Open your editor (?edit=1) → Submissions to review, download documents, and mark it handled.`;

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: NOTIFY_FROM, to: NOTIFY_TO, subject, text }),
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
