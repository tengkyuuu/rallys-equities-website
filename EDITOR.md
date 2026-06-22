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

### Storage modes
- **Supabase configured** (`editor/supabase-config.js` filled): real email+password login; draft/publish to the `site_content` table; image uploads to the `content-images` bucket; published content fetched by all visitors.
- **Not configured (local preview):** the editor still runs — login takes any passphrase and edits save to **this browser only** (localStorage). Lets you trial the editor before wiring Supabase.

### QA performed (headless Chrome, zero console errors)
Public site unchanged when no overrides; charts/particles/icons/donut paint and recolor in light mode; editor login → edit-mode → inline text edit (markup preserved, scripts stripped) → image replace (library + upload) → color edits in **both** dark & light with correct per-mode persistence → Publish → public reload reflects published content. Live market data/charts remain locked (not editable).
