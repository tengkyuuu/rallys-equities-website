# Owner checklist: steps only you can do

These need dashboard access or a decision, so the code can't do them. They go with
[the risk assessment](risk-assessment-2026-11.md). Tick them off in order.

## 1. Read the inbox (today)
- [ ] Admin → **Submissions**: all 43 are still marked unhandled, including account
      applications, a complaint and job applications from 2–10 Nov. Reply, then mark each
      one handled.

## 2. Turn on new-submission emails (10 min)
Supabase dashboard → **Database → Webhooks → Create a new hook**:
- **Name:** `notify-submission`
- **Table:** `public.form_submissions`, **Events:** `Insert`
- **Type:** HTTP Request, **Method:** `POST`
- **URL:** `https://vlclduwwlqmenevmgiof.supabase.co/functions/v1/notify-submission`
- **HTTP headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <service_role key>` (Settings → API)
- [x] Created (12 Nov)
- [ ] Sent a test message through the website's contact form, and the email arrived

## 3. Apply the database update (5 min)
Supabase → **SQL Editor** → New query → paste all of
[`supabase/migrations/20261112_hardening_and_activity.sql`](../supabase/migrations/20261112_hardening_and_activity.sql) → **Run**.
- [x] Applied 12 Nov; verified: direct anonymous writes blocked, bucket limits set, activity table live
- [ ] The check at the end lists **no** `fs_public_insert` / `fu_public_insert`, and four `audit_…` triggers
- [ ] Sent a test application with an attachment from the live website: it arrives in the admin

What it does:
- closes the spam hole: visitors can no longer write to the database directly, and uploads are limited to 5 MB and the allowed file types;
- turns on the **Activity** history in the admin.

## 4. Turn on backups (3 min)
From this folder, in PowerShell:
```powershell
& "C:\Program Files\Git\bin\bash.exe" scripts/setup-backups.sh
```
(In Git Bash it's just `bash scripts/setup-backups.sh`.) When it asks for the connection string:
Supabase → **Connect** → **Direct** tile → Method **Session pooler**.
It asks for one thing (the database connection string), creates and shows the backup
passphrase, saves the four GitHub secrets, and runs the first backup.
- [ ] Passphrase saved in a password manager **and** offline
- [x] Secrets set and the first backup finished green (11 Nov, 56.4 MB)
- [ ] Opened that backup once with the saved passphrase (proves the passphrase works)

## 5. Keep monitor emails on
The **Live site monitor** action checks the site every 15 minutes and fails when something
is wrong.
- [ ] GitHub → Settings → Notifications → **Actions**: "Notify me on failed workflows only" is on, with email
- [ ] If GitHub ever emails that the scheduled workflow was disabled (after 60 days without commits), re-enable it under Actions

## 6. Branch protection (already switched on)
`main` now only accepts changes through a pull request whose tests passed, so untested
code can't reach the live site. In an emergency, an admin can switch this off temporarily
under GitHub → Settings → Branches.
