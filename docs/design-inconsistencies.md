# Design inconsistencies (audit, 22 Nov 2026)

Places where the code drifts from `DESIGN.md`. Nothing here has been fixed yet. Work through
it top to bottom and tick items off. Line numbers are from the audit date.

## 1. Conflicting colour definitions — fix first

- [ ] **Light-theme gold is defined twice.** `styles/light-theme.css:11` sets `--au:#9A7B1F`.
  Line 67 overrides it with `--au:#8A6A14`, so the line-67 value is the one that applies.
  About 10 different golds are scattered around: `#8C6E18`, `#B8922A`, `#6B5310`, and in
  `immersive.css:65-67` `#B08C2C`, `#D8B75C`, `#87681A`. Pick one light gold pair and delete
  the rest.
- [ ] **The set-password page has its own palette.** `styles/set-password.css:1-3`:
  - It uses red `#C0392B`, while the site uses `#E84545`.
  - It adds variable names the site doesn't have: `--card`, `--dim`, `--line`, `--line2`.
  - It is light-only.
- [ ] **The 404 page copies the dark palette into its own `:root`.** `styles/not-found.css:2`.
  It has no light version.
- [ ] **Five different reds:**
  - `#E84545` is the token.
  - `#C0392B` on set-password.
  - `#e5484d` as a toast fallback.
  - `#a31d24` and `#cc6d65` in `ui-states.css`.
  - `#e8554e` in the editor.
- [ ] **46 raw `rgba()` colours in components copy token values, so they ignore the light theme.**
  For example `rgba(200,168,75,…)` and `rgba(18,184,124,…)`. Found in:
  - `FeatureBand.tsx`, `HowItWorks.tsx`, `Regulatory.tsx`, `Skyline.tsx`
  - `AccountOpening.tsx`, `MarketsBoard.tsx`, `GovernancePage.tsx`
- [ ] **WhatsApp green `#1FAF59` has no token.** Used in `tools.css:94` and
  `FloatingActions.tsx:16`.
- [ ] **Stale comment in `public/editor.css:36-37`.** It says light is the site default; dark is
  the default.

## 2. Focus states

- [ ] **A focused select in the light theme shows two focus colours at once.**
  `light-theme.css:57,59` gives it a gold border and ring. `forms-dynamic.css` gives it a green
  outline. Use one colour (green, per DESIGN.md).
- [ ] **`.ftarea` has no light-theme focus override,** so in the light theme textareas focus green
  while inputs focus gold.
- [ ] **Fields and buttons focus in different colours.** Fields focus green. Buttons and links
  focus gold:
  - `.calc-btn`
  - `.blog-pager`
  - `.illo button`
  - `.hx` controls
- [ ] **Some controls have no visible focus ring:**
  - The markets search box (`MarketsBoard.tsx:19`, `outline:none`).
  - Recharts focus (`service-visuals.css:35`).
  - The set-password inputs.
- [ ] **The nav dropdown only opens on hover.** See `navigation.css:8`. No `:focus-within` rule
  exists, so keyboard users can't open it.

## 3. Dropdowns and menus

- [x] All public-site `<select>`s use `.fselect`. Good.
- [ ] **The nav dropdown uses a different shape from the select picker.** It has a 14px panel
  with 8px items and 9.5/11.5px text. The select picker uses a 12px panel with 7px options.
- [ ] **The admin font picker is a plain select** (`editor.js:2492`). It has no branded picker.
- [ ] **The markets search box is styled inline** (`MarketsBoard.tsx:9-20`) instead of using
  `.finput`. It has 8px corners and 8px 12px padding, against 9px and 11px 14px.

## 4. Corner radius off the scale

The scale is 4 / 7 / 9 / 11 / 12 / 18 / 100px / 50%. Values in use outside it:

- **2–3px:** scrollbars, bars, dots. These are tiny marks, so the values are probably fine to keep.
- **5–6px:** `.ptab`, `.ao-tbi`, `.illo-seg button`, `.pol-chip .pn`
- **8px:**
  - Classes: `.hx-btn`, `.ham`, `.dd-inner a`, `.sfi`, `.hrs-item`
  - Inline: `MarketsBoard`
- **10px:**
  - Classes: `.calc-btn`, `.hx-tab`, `.brand-chip`, `.blog-pager a`
  - Inline: `AccountOpening.tsx:732,753`, `CareerForm.tsx:123`
- **13–14px:** `.fct`, `.ctc-icon`, `.dd-inner`, `.reg-card`, `.faq-item`, `.perf-chip`, `.mkt-idxc`
- **16px:** `.ctc-card`, `.mkt-table-wrap`, `Callout.tsx:20`
- **17px:** `.pl-logo`
- **20px:** `.fbc-card`, `.cta-block`, `.blog-feat`
- **999px** in `blog.css` where the rest of the site uses `100px`

- [ ] **Cards use four different radii: 14, 16, 18 and 20px.** Standardise on 18px.

## 5. Buttons — 8 separate styles

| Button | Radius | Padding | Text | Fill |
|---|---|---|---|---|
| `.btn` (nav) | 7px | 8×18 | 11px | green → mid-green |
| `.bbig` (main CTA) | 9px | 12×28 | 13px | green → bright green |
| `.calc-btn` | 10px | 12×30 | 13px | flat green |
| `.hx-btn` | 8px | 10×16 | 12.5px | green → bright green |
| `.ptab` | 5px | 4×10 | 10px | flat green |
| set-password `.btn` | 11px | 14 | 14px | green → mid-green |
| 404 `a.b` | 9px | 12×24 | 12.5px | flat green |
| editor `.re-btn` | 9px | 11×18 | 13px | hard-coded `#12B87C` → `#1ed49a` |

- [ ] Agree one primary gradient: `--g→--g3` or `--g→--g2`. Today both are used.
- [ ] Bring `.calc-btn` and `.hx-btn` onto the `.bbig` shape.

## 6. Font sizes

- [ ] **There are 12 text sizes between 8px and 14px:** 8, 9, 9.5, 10, 10.5, 11, 11.5, 12,
  12.5, 13, 13.5 and 14. A 5-step set covers the same needs: 9, 11, 12, 13, 14.
- [ ] **Headings set by hand instead of with `.sh` / `<SectionTitle size>`:**
  - `AboutPage.tsx:44` (40px)
  - `GovernancePage.tsx:116` (24px)
  - `ManagementPage.tsx:74` (24px)
  - `MissionPage.tsx:9` (26px)
  - `WhyChooseUs.tsx:55` (28px)
- [ ] **Form success checkmarks are 26, 28 or 30px** depending on the form.

## 7. Cards rebuilt with inline styles (and missed by the light theme)

- [ ] **These boxes copy card styling inline:**
  - Form wrappers: `ComplaintForm.tsx:38`, `FeedbackForm.tsx:38`, `CareerForm.tsx:47`,
    `AboutPage.tsx:61`. Their padding differs: 42, 30 or 32px.
  - Success panels in Career, Complaint and Feedback.
  - Gold note boxes in `AccountOpening.tsx:372,852`. Their tints differ: 15% vs 18%.
  - The upload box in `CareerForm.tsx:118`.
- [ ] **These inline boxes don't get the light-theme white-card treatment.** That treatment targets
  class names only (`light-theme.css:46`). Add a shared form-card class and use it.

## 8. Admin editor (`/admin`) vs the public site

- [ ] **The editor has its own `--re-*` colour set,** close to the site's but not the same.
  - Navy: `#03080f` (site `#05101E`)
  - Text: `#eef2f8` (site `#F6F2EA`)
  - Gold: `#cbab52` (site `#C8A84B`)
  - Red: `#e8554e` (site `#E84545`)

  Decide whether the editor should match the site exactly or stay a separate "tool" look on
  purpose.
- [ ] **These surfaces hard-code font names:**
  - The editor
  - set-password
  - the 404 page

  If the client changes fonts in `/admin`, these three won't follow.
- [ ] **The editor uses 18 different corner radii.**
