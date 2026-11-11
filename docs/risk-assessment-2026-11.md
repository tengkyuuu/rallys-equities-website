# Website risk assessment — 11 November 2026

> **Status (12 Nov):**
> - **Code:** items 4–8 and the market switch-off are built and tested, on branch `reliability-hardening`.
> - **Backups:** item 3 is solved on the Free plan with encrypted nightly backups ([backups.md](backups.md)).
> - **Your steps:** what's left needs dashboard access; see [owner-checklist.md](owner-checklist.md).

**Goal:** no more surprises like the "0 blog posts" incident. That means three things:
1. No data loss: we can always restore.
2. No silent failure: if something breaks, we hear about it before the client does.
3. Nothing reaches the live site untested.

Everything below was checked against the live site, the live database or the code on 11 Nov 2026.

## What the site is today

- **Public website:** Next.js 16, React 19, TypeScript. It is already on a modern framework, and it has 96 automated end-to-end tests that run in GitHub Actions on every push.
- **Admin editor:** `public/editor.js`, about 2,500 lines of plain JavaScript left over from the original HTML/JS site. It talks to the database straight from the browser. Yesterday's incident came from this file, and it is the main remaining technical risk.
- **Database and files:** Supabase, **Free plan**, restored to a new project on 7 Nov.
- **Hosting:** Vercel. Every push to `main` goes live straight away.

---

## 🔴 Do today (each is under an hour, mostly settings)

### 1. Nobody is told about new form submissions
- **What we found:** all 43 submissions are marked *unhandled*, including account applications (5 Nov), a complaint (4 Nov), a contact message (7 Nov) and a career application (10 Nov). The email alert (`notify-submission`) is deployed, but the database webhook that triggers it was never set up after the restore (`docs/supabase-restore.md`).
- **Risk:** missed customers, and unanswered complaints. For a brokerage, complaints may have response deadlines.
- **Action:**
  1. Have someone go through the inbox in the admin today.
  2. In Supabase, go to Database → Webhooks and add an `INSERT` webhook on `form_submissions` pointing to the `notify-submission` function. Exact values are in `docs/supabase-restore.md`.
  3. Send one test submission and confirm the email arrives.

### 2. Anyone can bypass the forms' spam protection
- **What we found:** a probe today confirmed that the public key embedded in the website can insert rows into `form_submissions` directly, skipping the website's validation and rate limits. The upload bucket also has no size or file-type limit. The fix already exists in `editor/security-hardening.sql` but was never applied to the restored database. The website's forms use a server-side key, so the fix doesn't break them.
- **Risk:** a spam script fills the Free plan's storage (500 MB database, 1 GB files) and the site's forms, and then the whole database, stop working.
- **Action:** run `editor/security-hardening.sql` in the Supabase SQL editor, then send one test submission with an attachment from the live site.

### 3. No automatic backups
- **What we found:** the Free plan has no automatic backups. The only backups are files on one laptop (`backup.sql` from 7 Nov, and today's JSON files). The database holds customer personal data from account applications.
- **Risk:** one bad save, bug or account problem, and the content and customer data are gone for good. Free projects can also be paused after a week without activity.
- **Action (recommended):** upgrade the project to **Supabase Pro**, about $25 a month. It adds daily backups kept for 7 days and is never paused. Alternative: a nightly backup job run from GitHub. I can build that, but it adds the job of keeping customer data secure in a second place.

### 4. Broken code can go live before the tests finish
- **What we found:** Vercel deploys `main` the moment it's pushed, while the tests run separately (4–5 minutes). `main` has no branch protection.
- **Action:**
  - Protect `main` in GitHub: require the CI check to pass, and block direct and force pushes.
  - Make Vercel's production deploy wait for CI, using Vercel's deployment-checks setting or by deploying from CI.
  - Work on branches and merge only when green.

---

## 🟠 This week (code — I can do these)

### 5. Monitoring: find out before the client does
Yesterday's empty blog was spotted by a person, not a system. Add:
- a scheduled GitHub Action, every 15 minutes, that checks the live site and emails on failure:
  - the home page loads;
  - `/blog` lists posts;
  - the sitemap holds at least 900 posts;
  - an old post URL returns 200;
  - the admin page loads;
- error reporting (Sentry is already listed in `.env.example` but isn't set up), so crashes in visitors' browsers and the admin are reported.

### 6. Two editors can overwrite each other
- **What we found:** site settings are saved as one JSON document with no check for a newer version (`saveDraftRows` in `public/editor.js`). If two editors, or two tabs, save, the last save silently wipes the other's work. Publish also puts whatever is in the shared draft live, including someone else's half-finished changes.
- **Fix:** only save if nobody else saved since you loaded the draft (compare `version`). Otherwise show "someone else changed this — reload". Apply the same check to blog posts (`updated_at`).

### 7. Other "failure looks like empty" spots in the admin
- **Published-state load failure:** if loading the published snapshot fails, the editor only logs a warning (`onAuthed`, around line 526). Every post then looks "never published", and **deleting a live post would not take it off the website**. Fix: treat it like the draft, with an error state and Delete/Publish blocked until it loads.
- **Submissions cap:** the inbox loads at most 300 submissions (`listSubmissions … .limit(300)`), with no "more" button and no warning. Older ones simply vanish from view. Fix: paging, plus a correct count.

### 8. Permissions are all-or-nothing
- **What we found:** the database lets *any* signed-in editor read and delete all submissions, including customers' personal data and uploaded IDs, publish anything, and delete every post. "Owner-only" exists only in the admin's screens.
- **Decision (12 Nov):** editors keep the same rights as the owner. Instead, every change is recorded in an **Activity history** that nobody can edit (database triggers), shown on the admin's Activity page.

---

## 🟡 This month: finish moving the admin to the framework

The public site already uses Next.js, React and TypeScript. The admin is the last big plain-JavaScript part, and it lacks what the framework gives the rest of the site: type checking, components, and server-side checks. Don't rewrite it in one go; that is where new outages come from. Instead, in order:

1. **Data layer first.** Move `supabaseStore()` (all reads and writes) out of `editor.js` into a typed TypeScript module, with unit tests for every failure path (load fails, save fails, session expired, conflict).
2. **Server-side writes.** Send Publish and other destructive actions through Next.js API routes or database functions that check the role and version on the server, instead of trusting the browser.
3. **Screens one at a time,** as React components: the blog admin first, since it is the most used and highest risk, then the submissions inbox, editors, and settings. The visual page editor (click-to-edit text) moves last, because it is the most intricate.
4. **Delete the old code** for each screen once its replacement passes the same end-to-end tests.

Each step ships on its own, behind the protections in items 4 and 5.

---

## 🟢 Lower priority, but known

- **Market data:** `/api/market` still calls PSX on every cache miss. PSX answers 403 and its terms forbid this use (`MARKET-DATA.md`). Switch the widgets off until a licensed feed is agreed, so we stop sending PSX requests.
- **Email sending:** invite emails need a verified sending domain in Resend; until then invites fall back to a copy-paste link.
- **Hardcoded database address:** `lib/supabase-config.ts` falls back to the production database if Vercel's environment variables go missing. That keeps the site up, but it means preview deployments also edit production data. A separate staging database would make testing safe.
- **Secrets:** the service-role key sits in `.env.local` and `.migration/` on the developer laptop. Keep that machine encrypted, and rotate the key if it is ever shared or lost.

## Summary

| # | Item | Who | Effort |
| --- | --- | --- | --- |
| 1 | Review inbox, wire submission alerts | You + dashboard | 30 min |
| 2 | Apply `security-hardening.sql` | You (SQL editor) | 10 min |
| 3 | Supabase Pro (daily backups, no pausing) | Client / owner decision | 10 min |
| 4 | Protect `main`; deploys wait for tests | You (GitHub + Vercel) | 20 min |
| 5 | Uptime/content monitor + error reporting | Code | ½ day |
| 6 | Stop editors overwriting each other | Code | ½ day |
| 7 | Published-state guard, inbox paging | Code | ½ day |
| 8 | Activity history: who did what (editors keep full rights) | Code + SQL | ½ day |
| — | Move the admin to TypeScript/React, step by step | Code | 2–4 weeks |
