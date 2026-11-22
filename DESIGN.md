---
name: Rallys Equities
description: The website of a SECP-licensed PSX brokerage in Lahore. Dark navy, emerald and gold, with an ivory light theme.
colors:
  emerald: "#0A6B4B"
  emerald-mid: "#0D8F63"
  emerald-bright: "#12B87C"
  gold: "#C8A84B"
  gold-light: "#E2C070"
  navy-deep: "#05101E"
  navy: "#081828"
  navy-raised: "#0C2040"
  ivory-text: "#F6F2EA"
  market-up: "#2ECC8A"
  market-down: "#E84545"
  light-bg: "#F4F1E8"
  light-surface: "#FBF9F2"
  light-raised: "#FFFFFF"
  light-text: "#12243A"
  light-gold: "#8A6A14"
  light-gold-deep: "#A07D1A"
typography:
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "44px"
    fontWeight: 700
    lineHeight: 1.08
  headline-sm:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.15
  hero-tagline:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "19px"
    fontWeight: 400
  body:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.65
  body-sm:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    letterSpacing: "0.06em"
  eyebrow:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "9px"
    fontWeight: 700
    letterSpacing: "0.2em"
  urdu:
    fontFamily: "Noto Nastaliq Urdu, serif"
    fontSize: "14px"
    lineHeight: 2.1
rounded:
  tag: "4px"
  btn-sm: "7px"
  control: "9px"
  control-lg: "11px"
  tile: "12px"
  card: "18px"
  pill: "100px"
  circle: "50%"
spacing:
  section-y: "80px"
  section-y-sm: "52px"
  section-x: "52px"
  card-pad: "26px"
  control-pad: "11px 14px"
  control-pad-lg: "15px 18px"
components:
  button-primary:
    backgroundColor: "{colors.emerald}"
    textColor: "#FFFFFF"
    rounded: "{rounded.btn-sm}"
    padding: "8px 18px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ivory-text}"
    rounded: "{rounded.btn-sm}"
    padding: "8px 18px"
  button-ghost-hover:
    textColor: "{colors.gold}"
  button-big-primary:
    backgroundColor: "{colors.emerald}"
    textColor: "#FFFFFF"
    rounded: "{rounded.control}"
    padding: "12px 28px"
  button-big-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ivory-text}"
    rounded: "{rounded.control}"
    padding: "12px 28px"
  input:
    backgroundColor: "rgba(255,255,255,.04)"
    textColor: "{colors.ivory-text}"
    rounded: "{rounded.control}"
    padding: "{spacing.control-pad}"
  input-large:
    rounded: "{rounded.control-lg}"
    padding: "{spacing.control-pad-lg}"
  select:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.ivory-text}"
    rounded: "{rounded.control}"
    padding: "11px 14px"
  select-picker:
    backgroundColor: "{colors.navy}"
    rounded: "{rounded.tile}"
    padding: "6px"
  select-option:
    rounded: "7px"
    padding: "10px 12px"
    height: "44px"
  card:
    backgroundColor: "rgba(255,255,255,.04)"
    rounded: "{rounded.card}"
    padding: "30px 24px"
  option-tile:
    rounded: "{rounded.tile}"
    padding: "18px"
  section-tag:
    textColor: "{colors.emerald-bright}"
    typography: "{typography.eyebrow}"
    rounded: "{rounded.tag}"
    padding: "6px 15px"
  hero-badge:
    textColor: "{colors.gold}"
    typography: "{typography.eyebrow}"
    rounded: "{rounded.pill}"
    padding: "5px 15px"
  pill:
    rounded: "{rounded.pill}"
    padding: "2px 7px"
---

# Design System: Rallys Equities

## Overview

**Creative North Star: "The Lahore Trading Floor at Night"**

A private-banking interior rendered on screen: deep navy rooms, emerald for action and growth,
gold for craft and trust. The serif headings (Cormorant Garamond) carry the heritage of an
established house; the sans body (Plus Jakarta Sans) keeps the explanations plain for a first-time
investor. Urdu sits beside English as an equal, set in Noto Nastaliq Urdu, never as a footnote.

The site is dark by default. An ivory light theme (`body.light`) flips content, cards and the nav
to paper tones, while the live-data "screens" (market panel, donut, map) stay dark in both themes,
like terminals on a desk.

The client brief for the October 2026 Next.js migration was **keep the design exactly as it
was**. This document describes that incumbent design. New work extends it; it does not reinvent it.

**Key Characteristics:**

- Dark navy surfaces in three steps, separated by tone and gold hairlines, not by heavy shadows.
- Emerald means "do this" (primary buttons, focus, selected state). Gold means "this is premium or
  important" (labels, borders, hover accents, badges).
- Small, tracked, uppercase labels above big serif headings.
- Gently rounded controls (9px) inside softly rounded cards (18px).
- Real market data only; up/down colours are reserved for prices.

## Colors

All colours live as CSS custom properties in `styles/base.css` (dark) and are remapped under
`body.light` in `styles/light-theme.css`. **Always use the variable, never the hex.** The short
variable names are part of the system:

| Variable | Role |
|---|---|
| `--g` / `--g2` / `--g3` | Emerald, from deep to bright |
| `--au` / `--au2` / `--au3` | Gold, gold-light, gold tint (13%) |
| `--nv` / `--nv2` / `--nv3` | Page background, section/alt surface, raised surface |
| `--tx` / `--mt` / `--mt2` | Text, muted text (56%), faint text (30%) |
| `--gb` | Gold hairline border (gold at 20%) |
| `--gl` | Glass fill on cards (white at 4%) |
| `--up` / `--dn` | Market up / down, and `--dn` doubles as the error colour |
| `--shadow-rgb` | RGB triplet that shadows are built from, so they retint per theme |

### Primary

- **Rallys Emerald** (`--g`, with `--g2` and `--g3` as its brighter steps). Primary buttons
  (always a 135° gradient from `--g` toward `--g2`/`--g3`), focus rings, selected options,
  active choice tiles, section tags (`--g3`). The colour of action and growth.

### Secondary

- **Exchange Gold** (`--au`, `--au2`). Hairline borders (`--gb`), eyebrow labels, hero badge,
  ghost-button hover, card border highlights, scrollbar thumb. In light mode gold darkens to keep
  contrast on ivory.

### Neutral

- **Midnight Navy** (`--nv` page, `--nv2` alternate sections and select surfaces, `--nv3` raised
  surfaces and the dropdown option background).
- **Warm Ivory** (`--tx`) for text on dark; light theme swaps the roles: ivory/paper surfaces with
  **Ink Navy** text.

### Named Rules

**The Token-Only Rule.** Every colour is a `var(--…)` reference. Tints are made with
`color-mix(in srgb, var(--token) N%, transparent)`, never with a new hex or a hand-written rgba of
a brand colour. That is what lets the light theme and the `/admin` colour editor work.

**The Two-Accent Rule.** Emerald is for action and state; gold is for emphasis and ornament.
Don't make a primary button gold or a decorative label green-for-no-reason. (Section tags `.stag`
are the one established emerald label.)

**The Market Colour Rule.** `--up` and `--dn` are for price movement and, for `--dn`, errors.
Never use them decoratively.

**The Dark Screen Rule.** Live-data widgets (`.pcard`, `.gov-donut`, `.map-box`) stay dark in the
light theme. Any new live-data widget must opt into the same override block in
`styles/light-theme.css`.

## Typography

**Display Font:** Cormorant Garamond (with Georgia, serif), via `var(--font-display)`
**Body Font:** Plus Jakarta Sans (with sans-serif), via `var(--font-body)`
**Urdu Font:** Noto Nastaliq Urdu, always `direction: rtl` and generous line-height (2.1)

**Character:** A literary serif for authority against a clean, geometric sans for clarity.

### Hierarchy

- **Section heading** (`.sh`, 700, 44px, line-height 1.08): every section's main heading.
  Use `<SectionTitle>`, which renders the `.stag` label and the `.sh` heading together.
- **Smaller in-page heading** (700, 28–34px): `<SectionTitle size={…}>` for h3s.
- **Hero tagline** (italic, 19px, muted): the serif line under the hero heading.
- **Body** (14px, line-height 1.65–1.78): paragraphs; hero paragraph at weight 300.
- **Small body** (13px): card text, form fields on standard forms.
- **Label** (11px, 600, tracked 0.03–0.06em, often uppercase): nav links, small buttons.
- **Eyebrow** (9px, 700, tracked 0.2em, uppercase): `.stag`, `.hero-badge`. `<Eyebrow>` is a
  larger gold variant (12px, 0.08em) for labels above lists and blocks.

### Named Rules

**The Serif-for-Headings Rule.** Headings are Cormorant Garamond; everything else, including
buttons, labels and form controls, is Plus Jakarta Sans. Don't hard-code font names: use
`var(--font-display)` / `var(--font-body)` (the admin can change them).

**The 16px Field Rule.** Form controls render at 16px on small screens (`styles/ui-states.css`)
so iOS doesn't zoom. Keep it.

## Layout

- **Sections:** `.sec` (80px top/bottom, 52px sides), `.sec-sm` (52px), `.sec-alt` swaps to
  `--nv2` for alternating bands.
- **Fixed nav** at the top (`--nav-h`), blurred translucent navy, gold hairline underneath.
- **Breakpoints in use:** 900px is the main one (layout collapses, nav goes to the mobile menu);
  640/600/560px refine small phones; 1180px is the wide-desktop step. New CSS should use 900px and
  640px unless there's a reason.
- **Forms:** two-column grid of `.fg` groups (label + control, 5px gap); `.fg.full` spans both.
  The complaints, feedback and home-feedback forms use the large variant (8px gap, bigger fields).
- **Reduced motion:** every animation has a `prefers-reduced-motion: reduce` fallback.

## Elevation & Depth

Depth comes from **tone first** (navy steps + gold hairlines + glass fill), then soft, diffuse
shadows built from `--shadow-rgb` so they retint in the light theme. Primary buttons carry a
coloured emerald glow; hover lifts cards 4–7px with a deeper shadow and brighter gold border.

### Shadow Vocabulary

- **Popover / dropdown:** `0 14px 36px -12px rgba(var(--shadow-rgb), .45)`
- **Card hover:** `0 22px 50px -22px rgba(var(--shadow-rgb), .5)` range
- **Primary button glow:** `0 4px 16px color-mix(in srgb, var(--g) 35%, transparent)`,
  growing to 50% on hover
- **Focus halo (inputs):** `0 0 0 3px color-mix(in srgb, var(--g3) 8%, transparent)`

### Named Rules

**The Retinting Shadow Rule.** Neutral shadows use `rgba(var(--shadow-rgb), α)`, never
`rgba(0,0,0,α)`, so they turn navy-tinted in the light theme.

## Shapes

One radius scale, chosen by the size of the element:

| Radius | Used for |
|---|---|
| 4px | Section tags (`.stag`) |
| 7px | Small nav buttons (`.btn`), dropdown options |
| 9px | Big buttons (`.bbig`), inputs, selects, textareas |
| 11px | Large form fields (complaints / feedback forms) |
| 12px | Choice tiles (`.ac-opt`, `.risk-opt`), the dropdown picker panel |
| 18px | Cards (`.svc-card`, `.calc-card`, testimonials, contact cards…) |
| 100px | Pills and badges |
| 50% | Avatars, dots, icon circles |

**The Nested Radius Rule.** A rounded thing inside a rounded thing gets the smaller radius: a
9px control sits in an 18px card; a 7px option sits in a 12px picker. Don't pick a new number.

## Components

### Buttons

- **Small primary / ghost** (`.btn .btn-primary`, `.btn .btn-ghost`): 11px, 600, 8px 18px, 7px
  radius. Used in the nav. Ghost is a faint ivory outline that turns gold on hover.
- **Big primary** (`.bbig .bbig-g`): 13px, 700, 12px 28px, 9px radius, emerald gradient with a
  soft glow. Hover shifts the gradient and runs a light sheen across (`luxury.css`).
- **Big outline** (`.bbig .bbig-o`): same size, transparent with an ivory 22% outline.
- **Rule:** primary is always the emerald gradient with white text. Don't invent new button
  colours; there is no gold-filled button.

### Cards / Containers

- **Card** (`.svc-card`, `.calc-card`, `.testi`, `.reg-card`, `.ctc-card`, `.loc-card`,
  `.faq-item`, `.fbc-card`): 18px radius, glass fill over a gold-to-emerald gradient border
  (`luxury.css`), 26–30px padding. Hover lifts and brightens the border.
- **Choice tile** (`.ac-opt`, `.risk-opt`): 12px radius, gold hairline; selected = emerald
  border at 40–50% and emerald tint fill.

### Inputs / Fields

- **Text input / textarea** (`.finput`, `.ftarea`): glass fill, ivory 10% border, 9px radius,
  11px 14px padding, 13px text. Focus: emerald border + emerald tint + 3px emerald halo. Error
  (`.err`): `--dn` border, message `.ferr` shown below.
- **Checkbox** (`.fcheck`): native, 16px, `accent-color: var(--g)`.

### Dropdowns (Select)

The one dropdown. **Every select on the public site is a native `<select className="fselect">`**
(`styles/sections.css` + `styles/forms-dynamic.css`):

- Closed field: same shape as `.finput` (9px radius, same padding and border), chevron on the
  right, placeholder option (`value=""`) shown muted.
- Open picker (browsers with `appearance: base-select`): `--nv2` panel, 12px radius, 6px padding,
  popover shadow, max height 320px / half the viewport, same width as the field.
- Options: 44px minimum height, 10px 12px padding, 7px radius; hover = emerald 18% tint;
  selected = emerald 32% tint, bold, with an emerald checkmark on the right.
- Focus: 2px emerald outline offset 3px; red when in error. Disabled: 55% opacity.
- Light theme: white panel, lighter emerald tints, deep-emerald check and focus.

**The Native Select Rule.** Don't build custom JS dropdowns or popovers for choosing a value.
Use `<select className="fselect">`; it keeps keyboard and screen-reader behaviour and the
editor's position-based keys.

### Navigation

Fixed translucent navy bar with blur and a gold hairline. Links are 11px uppercase, tracked,
muted, with a thin underline that appears on hover/active. Under 900px the links collapse into
the mobile menu and the ghost button hides.

### Section Title

`.stag` + `.sh`, via `<SectionTitle tag="…">`: a small emerald, bordered, uppercase tag above a
44px serif heading. This pair opens nearly every section; use the component rather than
re-creating it inline.

## Do's and Don'ts

### Do:

- **Do** use the CSS variables for every colour and `color-mix()` for tints.
- **Do** use the existing classes (`.bbig`, `.finput`, `.fselect`, `.svc-card`, `.stag`/`.sh`)
  and the `components/ui` components before writing inline styles.
- **Do** pick radii from the Shapes table and follow the Nested Radius Rule.
- **Do** check every change in both the dark theme and `body.light`.
- **Do** give Urdu text Noto Nastaliq Urdu, `direction: rtl`, and line-height around 2.
- **Do** add a `prefers-reduced-motion` fallback for any animation.

### Don't:

- **Don't** hard-code hex colours, `rgba(0,0,0,…)` shadows, or font names.
- **Don't** build custom dropdowns; use the native `.fselect`.
- **Don't** use gold for primary actions or `--up`/`--dn` for decoration.
- **Don't** introduce new radii, font sizes or breakpoints when an existing one fits.
- **Don't** show placeholder or simulated market numbers; data is real or "unavailable".
- **Don't** change the look while doing unrelated work. The brief is to keep the design as it is.
