#!/usr/bin/env bash
# One-time setup for the nightly backups (.github/workflows/backup.yml).
#
#   bash scripts/setup-backups.sh
#
# What it does:
#   1. reads the Supabase URL and service key from .env.local (nothing to type);
#   2. asks you to paste ONE thing: the database connection string;
#   3. generates a strong backup passphrase and shows it once (save it!);
#   4. stores the four values as GitHub repository secrets with the GitHub CLI;
#   5. runs the first backup (database + files) and waits until it has finished.
#
# Needs: GitHub CLI signed in (`gh auth status`), openssl (both come with Git for Windows / Git Bash).
set -euo pipefail
cd "$(dirname "$0")/.."

say() { printf '\n%s\n' "$*"; }
fail() { printf '\n✗ %s\n' "$*" >&2; exit 1; }

command -v gh >/dev/null || fail "GitHub CLI not found. Install it from https://cli.github.com and run: gh auth login"
gh auth status >/dev/null 2>&1 || fail "GitHub CLI is not signed in. Run: gh auth login"
command -v openssl >/dev/null || fail "openssl not found (it comes with Git Bash — run this script from Git Bash)."
[ -f .env.local ] || fail ".env.local not found in $(pwd)"

val() { grep -E "^$1=" .env.local | head -1 | cut -d= -f2- | tr -d '"\r'"'"; }
SB_URL=$(val NEXT_PUBLIC_SUPABASE_URL)
SB_KEY=$(val SUPABASE_SERVICE_ROLE_KEY)
[ -n "$SB_URL" ] || fail ".env.local has no NEXT_PUBLIC_SUPABASE_URL"
[ -n "$SB_KEY" ] || fail ".env.local has no SUPABASE_SERVICE_ROLE_KEY"
REF=$(printf '%s' "$SB_URL" | sed -E 's#https://([^.]+)\..*#\1#')

say "Step 1 of 2 — database connection string"
echo "Open https://supabase.com/dashboard/project/$REF → Connect (top bar) → 'Session pooler',"
echo "copy the URI, and put your database password where it says [YOUR-PASSWORD]."
echo "(If the password has symbols like @ # / ? %, reset it to letters and numbers only, or URL-encode them.)"
printf 'Paste it here (it stays hidden): '
read -rs DB_URL
echo
case "$DB_URL" in
  postgres://*|postgresql://*) ;;
  *) fail "That doesn't look like a connection string (it should start with postgresql://)." ;;
esac
case "$DB_URL" in *YOUR-PASSWORD*) fail "Replace [YOUR-PASSWORD] with your real database password." ;; esac
case "$DB_URL" in *"$REF"*) ;; *) fail "That connection string is for a different project (expected $REF)." ;; esac

PASS=$(openssl rand -base64 48 | tr -dc 'A-Za-z0-9' | cut -c1-40)
[ ${#PASS} -ge 32 ] || fail "Could not generate a passphrase"

say "Saving the four secrets to GitHub…"
printf '%s' "$SB_URL" | gh secret set SUPABASE_URL
printf '%s' "$SB_KEY" | gh secret set SUPABASE_SERVICE_ROLE_KEY
printf '%s' "$DB_URL" | gh secret set SUPABASE_DB_URL
printf '%s' "$PASS" | gh secret set BACKUP_PASSPHRASE
unset DB_URL SB_KEY

say "Step 2 of 2 — SAVE THIS BACKUP PASSPHRASE"
echo "Without it the backups can't be opened. It is not stored anywhere you can read it again."
echo "Put it in your password manager (and ideally on paper, somewhere safe):"
echo
echo "    $PASS"
echo
read -rp "Press Enter once you have saved it… " _
unset PASS
clear 2>/dev/null || true

say "Running the first backup (database + files). This takes a few minutes…"
gh workflow run backup.yml -f files=true
sleep 10
RUN_ID=$(gh run list --workflow backup.yml --limit 1 --json databaseId --jq '.[0].databaseId')
if gh run watch "$RUN_ID" --exit-status >/dev/null; then
  say "✓ Backups are set up. The first backup finished; from now on they run every night."
  gh run view "$RUN_ID" --json url --jq '"  " + .url'
else
  say "✗ The first backup failed. See what went wrong with:"
  echo "  gh run view $RUN_ID --log-failed"
  echo "Usually the connection string is wrong — re-run this script to fix it."
  exit 1
fi
