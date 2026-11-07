# Supabase restore — 7 November 2026

The database and storage backup have been restored to **Rallys Equities** in the
**IT Company** Free-plan organization, in Singapore (`ap-southeast-1`).

[Open the restored project](https://supabase.com/dashboard/project/vlclduwwlqmenevmgiof)

## Restored data

| Data | Restored |
| --- | ---: |
| Auth users and identities | 4 each |
| Form submissions | 41 |
| Editor invites | 3 |
| Site-content records (draft and published) | 2 |
| Stocks | 1,058 |
| Stock-price records | 1,058 |
| Sectors | 1 |
| Public content images | 1,033 |
| Private form-upload files | 42 |

The empty application tables and the saved Auth sessions/refresh-token records
were restored as well. Original record IDs, user password hashes, ownership and
timestamps were preserved. Users should sign in again on the new project because
the project URL, signing keys and browser session-storage namespace have changed.

All 36 restored Auth, application and storage tables passed row-count and content
fingerprint checks. Storage fingerprints cover original record identity and
ownership; physical object versions and upload-generated metadata belong to the
new project. All 1,075 files were downloaded after upload and checked against the
backup with SHA-256. Both bucket visibility settings were preserved.

The 1,974 old-project hostname occurrences in the site-content records now refer
to the restored project. Managed service schemas and migration history remain
those provisioned by the new Supabase project.

The database was approximately 22 MB and the files approximately 62 MB after
restore. Supabase quoted $0/month for the project when it was created.

## Configuration and validation

- All public application tables have RLS enabled. Original policies and grants
  were restored. Anonymous reads cannot retrieve form submissions or invites;
  published content is readable, and the private upload bucket rejects public
  downloads.
- Public signup is disabled for this invite-only editor. The Auth Site URL is
  `https://www.rallysequities.com`; production password-setup/admin redirects and
  local development redirects are configured.
- `market`, `invite-editor` and `notify-submission` are deployed. The existing
  mailer, notification, owner-list and site-URL secrets were configured from the
  local environment; no secret values are committed.
- `notify-submission` now requires a gateway-verified `service_role` JWT and a
  valid submission webhook envelope. **Keep Verify JWT enabled.** Anonymous and
  forged service-role tokens were rejected; an authenticated malformed payload
  returned 400 without sending email.
- The local `.env.local` and the application's public fallback configuration
  point to the restored project.
- The production build, TypeScript check and ESLint passed. Local home, admin
  and blog routes returned 200, with restored image URLs in blog content.

## Live deployment remains separate

The hosted website has not been redeployed by this restore. In its hosting
environment (for example Vercel), set these variables from the local `.env.local`,
then redeploy:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://vlclduwwlqmenevmgiof.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<new project's public anon key>
SUPABASE_SERVICE_ROLE_KEY=<new project's private service-role key>
```

Keep the service-role key server-only. Existing hosting environment values take
precedence over the application's fallback URL and public key.

The backup contained no application database-webhook trigger, and none was
invented during the restore. To activate submission alert emails, configure a
Database Webhook for `INSERT` on `public.form_submissions` targeting
`https://vlclduwwlqmenevmgiof.supabase.co/functions/v1/notify-submission`, with
`Authorization: Bearer <new project's service-role JWT>` and
`Content-Type: application/json`. The function and mailer secrets are ready, but
an actual notification email has not been sent as part of verification.

The legacy `market` Edge Function deployed successfully but returned an explicit
upstream-unavailable response from PSX during verification. This did not affect
the restoration of the saved stocks and prices.

Supabase's security advisor reported four source tables with RLS but no read
policies (their original restricted access was preserved), plus the Free-plan
project's disabled leaked-password-protection warning. See
[RLS policy guidance](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)
and [password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

Local restore scripts, inspection reports and verification results are under
`.migration/supabase-restore/`, which is ignored by Git. Credentials are in ignored
environment files. The original downloaded backups were kept intact.
