# Taking the website forms live (Supabase)

By default the forms run in **demo mode** — a visitor sees a success message, but nothing is
stored. These steps switch them on so every submission (contact, complaint, feedback, career,
and account-opening application + uploaded documents) is **saved to your Supabase**, readable in
the editor's **Submissions** inbox, and (optionally) **emailed to you**.

You only do this once. It uses the same Supabase project the editor already uses — no new
hosting and no extra cost.

---

## Part A — Storage (required, ~2 minutes)

1. **Create the uploads bucket.** Supabase dashboard → **Storage** → **New bucket** →
   name it exactly `form-uploads` → leave **Public** **OFF** (private) → Create.
2. **Run the setup SQL.** Dashboard → **SQL Editor** → **New query** → paste the contents of
   [`editor/supabase-forms.sql`](supabase-forms.sql) → **Run**.
   (It creates the `form_submissions` table, the security rules, and the bucket policies.)

That's it — forms are now live. Submit a test contact form on the site, then open
`…/?edit=1`, log in, and click **📥 Submissions** to see it. Uploaded documents open via the
**⬇** buttons (private, signed links that only you can open).

> **How the security works:** the public can only *add* a submission — never read, edit, or
> delete one. Only your logged-in editor account can read submissions and open documents.

---

## Part B — Email alerts (optional, ~10 minutes)

Get an email the moment someone submits. This needs a free email-sending account (Resend).

### B1. Get a Resend API key
1. Sign up at **resend.com** (free tier is plenty for a lead form).
2. **API Keys** → **Create API Key** → copy it (starts with `re_…`).
3. *(Recommended)* **Domains** → add `rallysequities.com` and follow the DNS steps so email
   comes **from** your own domain. You can skip this to start — emails will then come from
   Resend's shared `onboarding@resend.dev` address.

### B2. Add the email function
1. Dashboard → **Edge Functions** → **Create a function** → name it `notify-submission`.
2. Paste the contents of
   [`supabase/functions/notify-submission/index.ts`](../supabase/functions/notify-submission/index.ts)
   → **Deploy**.
   *(Prefer the CLI? `supabase functions deploy notify-submission --no-verify-jwt`.)*
3. Open the function → **Secrets** (or Settings) → add:
   - `RESEND_API_KEY` = your `re_…` key
   - `NOTIFY_TO` = where alerts go, e.g. `hello@rallysequities.com`
   - `NOTIFY_FROM` *(only if you verified a domain)* = e.g. `Rallys Equities <alerts@rallysequities.com>`

### B3. Fire it on every new submission
1. Dashboard → **Database** → **Webhooks** → **Create a new hook**.
2. Table: `form_submissions` · Events: **Insert**.
3. Type: **Supabase Edge Functions** → choose `notify-submission`. Save.

Now submit a test form — you should receive an email within a few seconds. (If not: open
**Edge Functions → notify-submission → Logs** to see the error, usually a missing/incorrect
secret or an unverified `NOTIFY_FROM`.)

---

## Where submissions live
- **Editor inbox:** `…/?edit=1` → log in → **📥 Submissions** (newest first; download documents;
  tick **Mark handled**).
- **Raw data:** Supabase dashboard → **Table Editor → `form_submissions`**, and documents under
  **Storage → `form-uploads`**.

## Anti-spam note
Anyone can submit a form (that's the point), so — like any public contact form — you may
occasionally get spam. If it ever becomes a problem, the simplest next step is to add a free
Cloudflare Turnstile / hCaptcha check to the forms; ask your developer to wire it in.
