# Rallys Equities — Visual Content Editor

A WordPress-style editor that lets the site owner edit **text, images, and colors** across the
whole website from the browser — no code — with changes going **live for all visitors**.

This document covers (1) what was built, (2) one-time setup, and (3) a plain-English guide for the client.

---

## 1. How it works (overview)

- The website's built-in content is the **default**. The editor saves a small **overrides** record
  (changed text, image URLs, and theme colors) to **Supabase**. On every page load the live site
  fetches the published overrides and applies them. If Supabase is unreachable or empty, the site
  simply shows its built-in defaults — it never breaks.
- **Editing** happens in the page itself: open the site with `?edit=1`, log in, then click any text to
  edit it, hover an image to replace it, and open the **Colors** panel to recolor the site (with
  separate Dark-mode and Light-mode controls). Changes are saved as a **draft** (private) and go live
  when you press **Publish**.
- The **live market data, ticker, and charts are intentionally not editable** (they are simulated/live).

### What's editable
| Type | Examples |
|---|---|
| Text | headings, paragraphs, section tags, button labels, card titles/descriptions, footer, page-hero titles, calculator write-ups |
| Images | logo, hero/section photos, service banners, "why choose us", infographics |
| Colors | brand gold, emerald, backgrounds, text, market up/down — globally, for both dark & light mode |

---

## 2. One-time setup (developer)

### a. Create the Supabase project
1. Go to https://supabase.com → create a free project. Note the **Project URL** and the **anon public key** (Project Settings → API).
2. **SQL Editor → New query** → paste the contents of [`editor/supabase-setup.sql`](editor/supabase-setup.sql) → **Run**. This creates the `site_content` table + security rules and seeds the `draft`/`published` rows.
3. **Storage → New bucket** → name it exactly `content-images`, mark it **Public**.
4. **Authentication → Users → Add user** → enter the client's **email + password**. That's their login.

### b. Point the site at your project
Edit [`editor/supabase-config.js`](editor/supabase-config.js) and paste your **Project URL** and **anon key**.
(The anon key is safe in the browser — Row-Level Security means the public can only *read* published content.)

### c. Deploy
Commit & push. Vercel redeploys as usual. The public site stays static; it only adds a tiny content fetch.

---

## 3. How to edit your site (client guide)

1. **Open the editor:** add `?edit=1` to your website address (e.g. `https://yoursite.com/?edit=1`) and press Enter.
2. **Log in** with the email and password we set up for you.
3. **Edit text:** click any text → type your change → click away. (A small toolbar lets you make text **bold**/*italic* or add a link.)
4. **Change an image:** hover over a picture → click **Change image** → upload a new one or pick from your library.
5. **Change colors:** click **Colors** (side panel) → switch between **Dark** and **Light** tabs → use the color pickers (grouped by what they affect, like "Brand Gold" or "Backgrounds"). You see changes instantly.
6. **Save or Publish:** your edits are a private **draft** until you press **Publish**. Publish makes them live for everyone. Use **Discard** to undo all unsaved changes.
7. **Done?** Remove `?edit=1` (or click *Preview as visitor*) to see the site as the public does.

> Tip: nothing you click can break the site. If a color looks wrong, each color group has a **Reset** button. If text looks wrong, press **Undo**.

---

## 4. Implementation log (changes made to the codebase)

> Built in phases; each is reviewed before the next.

- **Phase 0 — scaffolding ✅:** `editor/supabase-config.js`, `editor/supabase-setup.sql`, this `EDITOR.md`.
- **Phase 1 — override foundation ✅:** `index.html` gains an override engine (`applyOverrides`, `injectThemeOverrides`, `sanitizeFragment`, `getEditKey`, `cssVar`/`cssRGB`), editable nodes tagged with `data-edit` / `data-edit-img`, `renderCalcInfo` reads overrides, and the public page fetches published content on load (safe fallback to defaults).
- **Phase 2 — Colors customizer ✅:** `editor.js` / `editor.css`, loaded via `?edit=1` after login; grouped color pickers with separate **Dark** and **Light** tabs + live preview; Save-draft / Publish bar.
- **Phase 3 — inline text editing ✅:** click any text → edit in place with a Bold/Italic/Link toolbar; sanitized; per-field + global undo.
- **Phase 4 — image / media ✅:** hover an image → replace via upload or a media library; alt text.
- **Phase 5 — color tokenization ✅:** hero & calculator charts, hero particles, the shareholding donut, and SVG icons now read CSS variables, so the Colors panel recolors them too (both themes).
- **Phase 6 — admin app ✅:** `/admin` is a full dashboard (overview KPIs, Submissions inbox, Editors invites) + a site-editor mode with one toolbar (Edit switch, Photos, Theme, Site, Preview, Save/Publish). Admin chrome follows the site's light/dark theme.
- **Phase 7 — customization & blog ✅:**
  - **Hide anything:** in Edit mode, hover any element → a small toolbar appears (drag ≡ · select-parent · hide). Hidden items are stored in `overrides.hidden` and restorable from **Site → Hidden elements**. Curated widgets (ticker tape, hero market panel, performance snapshot, PSX-Live badge, WhatsApp button) have dedicated toggles in the **Site** panel — their *data* stays locked, only visibility/position is editable.
  - **Delete pages:** **Site → Pages** toggles any page off; its nav/footer/mobile-menu links hide everywhere and direct navigation falls back to Home. Stored as `hidden["page:<id>"]`.
  - **Drag & drop:** the ≡ handle reorders any element among its siblings (insertion indicator; layout stays responsive). Dragging one image onto another **swaps** them; dropping an image file from your computer onto any photo replaces it; Photos-panel thumbnails can be dragged onto page images too. Order is stored per-container in `overrides.order` using stable `data-rekey` keys (`sigStampKids` stamps children before any move so text/img/hide keys survive reordering — see `getEditKey`'s anchored `<ancestor>/<subpath>` form).
  - **Blog:** admin **Blog Posts** section (list, rich editor with cover upload, Live/Draft state). Posts live in `overrides.posts` and ride the same draft→publish pipeline (no new tables). The public site gained an **Insights** page + single-post view (`renderBlog`/`openPost`; `sanitizePost` allows article block tags); the Insights nav link auto-hides while there are no live posts.
- **Phase 8 — Blog replaces Submissions · Settings · image editor ✅:**
  - **Submissions removed from the admin** (client request): Blog Posts is now the main content section; the dashboard overview shows blog/pages KPIs and recent posts. Forms still submit to the `form_submissions` table — there's just no admin UI for them (restorable from git history if ever needed).
  - **Settings page** (sidebar footer): Publishing (save/discard/publish), Account (change password, replay welcome tips), **Reset to defaults** — granular resets for colors & fonts / text / images / hidden items / layout, each confirm-gated; resets save to the draft and reload so the preview is exact, and nothing goes live until Publish — plus a Danger zone (delete all posts, factory reset that keeps posts).
  - **Image editor** (`openImageEditor`): runs before every upload — media modal, drag-drop onto a page image, blog cover (defaults 16:9) and body images — and via "Adjust current image" in the media modal. Crop box with aspect presets (free/1:1/4:3/16:9/banner), **Stretch** fit mode, rotate/flip, brightness/contrast/saturation sliders and filter presets (B&W, Sepia, Vivid, Soft) via canvas `ctx.filter` (section hides on browsers without support). Output is re-encoded (≤2400px) and uploaded through the normal store path.
- **Phase 9 — market panel, customizable as hell ✅:** Site panel gains a **"Market panel — details"** group: 15 individual toggles (status bar, index name/value/change/volume, range tabs, chart + time labels, table header, company list/logos/**prices**/changes/percent pills, indices strip). `applyHidden` now emits `sel:` keys as CSS rules in a `#re-hidden-css` style tag, so hides survive the widget's 3-second live re-renders. Static labels inside locked widgets ("KSE-100 Index", volume line, Company/Price/Chg/% headers, KSE-30/KMI-30/ALLSHR names) are tagged `data-edit-free` and can be text-edited; the live *numbers* remain locked.

- **Phase 10 — admin chrome, account screens & the invite email ✅:**
  - **Brand mark instead of a stretched logo.** The logo is **140×99**; the invite email rendered it at `48×48` and the login/set-password screens at `52×52`, squashing it. Everywhere it appears it now sits on a white “plate” (the mark is dark ink on transparency, so it vanishes on the dark sidebar) with its real aspect locked — CSS `aspect-ratio:140/99` in the app, matched `width`/`height` attributes in the email. `brandMark()` reads the site's own `img[data-edit-img="brand.logo"]`, so the admin shows whatever logo is actually live and the path resolves at `/admin`, `/admin/`, or `file://`.
  - **Invite email rebuilt** (`supabase/functions/invite-editor/index.ts`): ivory masthead + emerald/gold signature edge, serif headline, a “what you'll be able to do” list, one-time-link and recipient line, copy-paste fallback in a tinted box, and a proper company footer. Client-hardening it didn't have before: `<title>`, preheader, `mso-line-height-rule:exactly`, a **VML `roundrect`** so Outlook still gets a rounded CTA, `width="600"` + `max-width` (so it shrinks on a phone instead of overflowing), and a `<style>` media query for narrow screens. Plain-text part rewritten to match. **Requires `supabase functions deploy invite-editor` to take effect.**
  - **Sidebar** now carries the brand plate, an always-visible **publish-state chip** (“Website up to date” / “N unsaved changes” / “N posts to publish”, kept in sync by `updateSaveBar`), and a **“who am I” block** (initials avatar + name + Owner/Editor) — the admin never said who you were signed in as. Identity loads once into `ME` via `loadMe()` and is shared with the Profile page.
  - **Profile page rewritten:** identity hero (avatar, name, email, role badges), Details (display name with a Save that only enables when changed, email, role explained per-role), and Sign-in & security (change password, log out, “Editor since” / “Last sign-in” from the Supabase user record). Skeleton placeholders replace the old “Loading…” text.
  - **Change password, properly.** It was one field: no confirmation, no proof of the old password (Supabase doesn't require one, so anyone at an unlocked machine could take over the account). Now: current password → **re-authenticated** via `signInWithPassword` before the change; new + confirm; a strength meter with a live four-item checklist; and guards for weak, mismatched, and unchanged passwords. The first-run invitee flow skips only the “current password” step. `set-password.html` got the same meter, confirm field, and wording so the two screens never disagree.
  - **Forgot password** on the login screen (`resetPasswordForEmail` → the same `/set-password` page, which already handles `type=recovery`). Without it, an editor who forgot their password had no way in except asking the owner for a brand-new invite.
  - **Polish & a11y:** one `pageHead()` (eyebrow · title · sub · actions) across every view, section icons, card lift, skeleton loaders, empty-state CTAs; modals now **trap Tab and restore focus** to whatever opened them; the toast is an `aria-live` region; `softRefresh()` no longer redraws over a field being typed into.

- **Phase 11 — loading, as a designed moment ✅:**
  - **Admin entry loader.** `/admin` had no loader at all: the site preloader dismissed at 650ms, then the visitor watched the *public homepage* while the supabase CDN, `editor.js`, the auth check and the draft all loaded — seconds on a good connection, up to the 6–8s safety nets on a bad one. The preloader now **hands off** instead of dismissing (`window.RE_BOOT` in `index.html`): it keeps the gilded curtain up, swaps its eyebrow to “Website Admin”, switches the progress bar to **determinate**, and narrates real stages — *Preparing your workspace → Loading the editor → Checking your sign-in → Opening your dashboard*. `boot()` lifts it one frame after the login card or dashboard is actually painted, so there is no flash of the public site.
    - Every stage is fired by a real event, never a timer. Ordering matters: the `<script>` `load` event fires *after* the script body has run, so on a fast connection it landed after `editor.js` had already reported a later stage — narrating backwards. `editor.js` announces its own progress instead, and `stage()` refuses to run once `finish()` has started.
    - Several stages land in the same breath on a fast connection, so the status line is **last-write-wins** with a single pending fade timer — queued swaps used to fight each other and none rendered.
    - A curtain that vanishes in 40ms reads as a glitch, so `finish()` holds a **1s floor** from takeover before lifting. Three ways out guarantee nobody is trapped: the floor, a 14s hard cap, and `script.onerror`.
  - **`reBusy()` — the curtain for consequential work.** Counter-rotating gold rings around the logo plate, gilded title, honest status line, sweeping hairline. Deliberately scarce: **publish** (slowest, visitor-facing, and a second click mid-write would push a half-formed draft — it now swallows clicks and Escape), the **resets** (stays up through the reload so it never looks like a crash), and **log out**.
  - **`btnBusy()` — a gold arc in the button you pressed**, the right weight for everything short: Save draft, Send invite, Save name, Update password. Restores the original label and its previous disabled state.
  - **Plate proportions.** The preloader's logo plate was an 86×86 square holding a 140×99 logo — `object-fit:contain` meant no stretch, but a lot of dead air. Now 100×71, matching the mark. (Watch out: overriding `.pl-name`'s gilding must use `background-image`, not the `background` shorthand — the shorthand resets `background-clip:text` and the wordmark collapses into a solid gold bar.)
  - **Legibility on ivory.** Light is the site's default theme, so it's what most admins see, and the stock gilding washed out on it. The admin curtain gets a deeper vignette and full-strength gold for the wordmark, eyebrow, and status line.
  - Also: `set-password.html`'s bare 3px ring became the same gold-arc + status + sweep language, and the sidebar identity shows shaped placeholders instead of the word “Loading…”. All of it degrades under `prefers-reduced-motion` — the curtain and its text stay, the spinning stops.
  - **Silent background refreshes** (reported as “it goes reloading once in a while”). The Editors view's fallback poll called `loadList`, which began by clearing the list and showing a placeholder — so the roster was torn down and redrawn **every 15 seconds**. That was pre-existing, but it used to flash the text “Loading…”; against the new skeletons it became a loud shimmer that read as the page reloading. Measured with a MutationObserver: 3 bursts in 45s, at 15.0/30.0/45.0s. Fixes:
    - `loadList(readOnly, quiet)` — background refreshes (poll, realtime, and just-completed actions) skip the skeletons entirely and compare a row signature, so **the DOM is not touched at all unless the data changed**. A failed background poll no longer wipes a good list either. The manual Refresh button stays loud on purpose — an explicit action deserves visible feedback.
    - Realtime is the fast path, so the poll is only a fallback for a channel that didn't connect: 15s → 45s, skipped entirely while the tab is hidden, with a quiet catch-up on `visibilitychange`.
    - `softRefresh()` rebuilt the whole view on every background fetch, and boot fires it twice (draft, then the published snapshot) — usually with identical content. It now compares a `viewSig()` of everything a view actually reads and skips the repaint when nothing changed.
    - Verified: 100s / two poll cycles on Editors → **0** skeleton bursts and 0 row rebuilds; a genuinely changed roster (invite accepted, one added, one gone) still appears, still without skeletons; manual Refresh still shows one.

### Storage modes
- **Supabase configured** (`editor/supabase-config.js` filled): real email+password login; draft/publish to the `site_content` table; image uploads to the `content-images` bucket; published content fetched by all visitors.
- **Not configured (local preview):** the editor still runs — login takes any passphrase and edits save to **this browser only** (localStorage). Lets you trial the editor before wiring Supabase.

### QA performed (headless Chrome, zero console errors)
Public site unchanged when no overrides; charts/particles/icons/donut paint and recolor in light mode; editor login → edit-mode → inline text edit (markup preserved, scripts stripped) → image replace (library + upload) → color edits in **both** dark & light with correct per-mode persistence → Publish → public reload reflects published content. Live market data/charts remain locked (not editable).
