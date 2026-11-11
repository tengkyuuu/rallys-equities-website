# Backups (Supabase Free plan)

The Free plan has no automatic backups, so a GitHub Action makes them:
[`.github/workflows/backup.yml`](../.github/workflows/backup.yml).

| What | When | Kept |
| --- | --- | --- |
| Whole database: roles, schema and data, including logins, posts, submissions and the activity history | every night, 00:30 Pakistan time | 30 days |
| Storage files: editor images, form uploads (about 62 MB) | every Sunday night, or on demand | 30 days |

The repository is **public**, so every backup is encrypted (GPG, AES-256) with a passphrase
before GitHub stores it. Without the passphrase the files are useless, to strangers and to
us alike.

## One-time setup (5 minutes)

1. **Create a passphrase** of at least 20 characters, for example 6 random words. Save it in
   your password manager *and* somewhere offline. If it is lost, the backups can't be opened.
2. **Get the database connection string:** Supabase dashboard → **Connect** → *Session pooler*
   → copy the URI and put the database password in it.
3. **Add four repository secrets** (GitHub → Settings → Secrets and variables → Actions →
   *New repository secret*), or from this folder:
   ```bash
   gh secret set SUPABASE_DB_URL
   ```
   ```bash
   gh secret set SUPABASE_URL --body "https://vlclduwwlqmenevmgiof.supabase.co"
   ```
   ```bash
   gh secret set SUPABASE_SERVICE_ROLE_KEY
   ```
   ```bash
   gh secret set BACKUP_PASSPHRASE
   ```
   Each command without `--body` asks you to paste the value, so it never lands in your
   shell history.
4. **Run it once by hand:** GitHub → Actions → *Nightly backup* → *Run workflow*, and tick
   "Also back up the Storage files". It should finish green with one artifact.

If a secret is missing or a dump looks wrong, the run fails, and GitHub emails you.

## Restoring

1. Download the artifact (Actions → the run → *Artifacts*) and unzip it.
2. Decrypt and unpack:
   ```bash
   gpg --decrypt db-2026-11-12.tar.gz.gpg | tar -xzf -
   ```
   This gives `roles.sql`, `schema.sql` and `data.sql`; the Storage backup gives the files
   plus `manifest.json`, which lists every file's checksum.
3. Restore into a **new** Supabase project, never on top of the live one, following
   Supabase's guide ([Restore a backup](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore)):
   ```bash
   psql --single-transaction --variable ON_ERROR_STOP=1 --file roles.sql --file schema.sql --command 'SET session_replication_role = replica' --file data.sql --dbname "<new project's connection string>"
   ```
4. Re-upload the Storage files into buckets with the same names and visibility, then point the
   site at the new project (see `docs/supabase-restore.md`, which describes the 7 Nov 2026
   restore).

Practise a restore into a throwaway project once, so the steps are known before they're
needed.
