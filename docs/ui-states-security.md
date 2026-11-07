# UI states and form protection

Public contact, complaint, feedback (including home-page forms), careers and
account-opening forms share inline validation, focus on invalid inputs, visible
sending feedback, duplicate-send prevention, recoverable errors, offline guidance,
and rate-limit countdowns. Uploads report completed file counts; after eight seconds,
the form explains the delay. Request timeouts preserve entered values on the page.
Success panels are shown only after the server confirms receipt.

Page navigation has loading and error boundaries. The editor inbox has first-use
guidance, a clear-search-and-filters action, and a persistent refresh error instead
of reporting a failed fetch as an empty inbox. Editor session expiry stores the
working draft, including an open blog composition, in tab-scoped sessionStorage
before showing sign-in. The same account can restore it for eight hours. Files,
passwords and submission inbox contents are never included in this recovery copy.
Public form input is retained in memory; closing or reloading the tab clears it.

## Server protections

- All form kinds share eight submission attempts per client per ten-minute window.
- Upload signing permits twenty attempts per client per ten-minute window.
- 429 responses include Retry-After. Invalid attempts also count.
- Optional Redis REST uses atomic EVAL for shared limits across instances. Without
  Redis, limits are bounded in-memory and reset when the instance restarts.
- Configured Redis outages fail closed with a recoverable 503 response.
- Production hosting must overwrite forwarded client-IP headers. Vercel uses
  x-vercel-forwarded-for. Other hosts must sanitize x-forwarded-for at their proxy.
- Cross-site browser writes are rejected; JSON bodies are limited to 32 KiB from
  the actual stream. Form schemas also bound individual fields and file counts.
- Upload paths use cryptographic randomness. Expiring HMAC receipts bind each
  reference to its form kind, field, path, filename, MIME type and size. Duplicate
  fields, modified metadata, forged paths and expired receipts are rejected.
- The service-role key is required for form writes; anonymous fallback is disabled.
  Existing CSP, security headers and content sanitization remain in place.

## Production rollout

1. Set SUPABASE_SERVICE_ROLE_KEY on the Next.js server (never a NEXT_PUBLIC variable).
2. Run editor/security-hardening.sql **after** the original forms setup. Review its
   verification queries. This removes legacy direct anonymous insert policies and enforces
   private storage with a 5 MiB size cap and MIME allowlist. The original forms setup
   has also been updated to use these secure defaults for new installations.
3. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for shared throttling.
4. Keep public Supabase signups disabled: authenticated accounts are trusted editors
   under the existing editor RLS model. Restrict invitations with OWNER_EMAILS in
   the invite-editor Edge Function settings.
5. Deploy the code and test one legitimate form submission, upload, rejection and
   recovery. This repository work does not itself deploy database or hosting changes.

Receipts validate authorized upload references, not document contents. MIME labels
are not malware scanning. IP throttling does not replace a hosting firewall for
distributed abuse. No automatic retry is made after an ambiguous send timeout.

References: [Supabase storage access control](https://supabase.com/docs/guides/storage/security/access-control),
[Upstash REST commands](https://upstash.com/docs/redis/features/restapi).
