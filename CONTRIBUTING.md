# Working on the Rallys Equities site

Read this before your first change. The [README](README.md) covers setup, scripts and the folder map.
This page covers **where things go**, the **one rule you must not break**, and **how to check your work**.

## The rule: don't change a page's structure by accident

The client edits text, images and visibility in the browser at `/admin`. Each edit is saved against
the element's **position** in the page (for example `home.div4-div2-div3-div2` means "4th div, its 2nd
div, …"), not against an id. So:

- **Adding, removing, wrapping or reordering elements inside a page re-points the client's saved
  edits** onto the wrong elements, silently. That includes a wrapper `<div>` or `<span>` added for
  layout. Use a `<Fragment>` (`<>…</>`) when you need to group or `map` elements.
- Elements with `data-edit="…"` or `data-rekey="…"` are anchored by that name instead, and so are
  their children. Lists that may be reordered later use this (see `PolicyDocList`, `LinkChips`).
- **New content goes at the end of a page** (or of an anchored block), after everything that is
  already there. The home page's feedback section is last for this reason.
- Changing **text, attributes, classes or styles** is safe. Only the element tree matters.

`tests/content-overrides.spec.ts` checks that every key still lands on the same element, including the
keys that are live in production today. If it fails, you moved something.

If a page genuinely needs restructuring, agree it with the client first. Their edits on that page must
be re-applied in `/admin` afterwards.

## Where things go

| You want to… | Go to |
|---|---|
| Change copy on a page | `components/pages/<Name>Page.tsx`, or the section file it imports (`components/home/*`, `components/services/*`) |
| Change a service, step, value or logo list | the data array at the top of that section file (`SERVICES`, `STEPS`, `LOGOS`, `SHOWCASES`, …) |
| Change a phone number, social link or the office map | `lib/company.ts` |
| Add or rename a page, its URL, title or description | `lib/site.ts` (`PAGE_META`: `name` is the short label for breadcrumbs, `title` and `desc` are what Google shows), then `app/(site)/<route>/page.tsx`, then `app/(site)/admin/page.tsx` (`RENDER`) |
| Change business details search engines see (address, hours, phones) | `lib/metadata.ts` (`ORGANIZATION_LD`) and `lib/company.ts` |
| Change a menu | `lib/menus.ts` |
| Add a policy PDF | `public/assets/policies/` and `lib/policies.ts` (both lists read from it) |
| Change a calculator | `lib/calculators/` (data, maths, charts) and `components/calculators/` |
| Change styling | `styles/*.css`; files are in the original cascade order, so put a rule next to the ones it overrides |
| Change a form | `lib/forms/schema.ts` (validation, shared by the browser and the API) and `components/forms/` |

### Building blocks (`components/ui/`)

Use these instead of copying markup. Each renders exactly the markup the site already used, so
switching to them never changes a page.

| Component | Renders |
|---|---|
| `PageHero` | the banner at the top of every inner page (`tag`, `title`, `lede`) |
| `SectionTitle` | the small gold label and the section heading (`.stag` + `.sh`) |
| `ServiceCard` | a card in a `.svc-grid`: optional icon, title, description, `footer` link |
| `FeatureList` | the icon + title + text list (`.sfl`) |
| `CtaBlock` | the closing "Open an account" band |
| `Callout` | a tinted rounded note box (`tone="gold"` or `"green"`) |
| `Eyebrow` | a small gold uppercase label above a list |
| `LinkChips` | a grid of external-link chips |
| `LuxDivider` | the gold divider between home sections |

Titles take JSX: wrap the highlighted words in `<em>` (gold) and `<span>` (emerald), as in
`title={<>Our <em>Management</em></>}`.

### Conventions

- **Server components by default.** Add `'use client'` only for state or browser APIs (forms, market
  widgets, the calculators). Navigation from a server component goes through `GoTo` / `PageLink`.
- **Data at the top of the file, markup below.** A list that appears once lives in the file that renders
  it. A fact used in several places lives in `lib/`.
- **Markets data is real or nothing**: never add sample prices or returns. See [MARKET-DATA.md](MARKET-DATA.md).
- **No inline scripts or `on…=` attributes.** The Content-Security-Policy blocks them (see `proxy.ts`).
- Formatting is Prettier's (`npm run format`); lint must pass (`npm run lint`).
- **SEO:** one `<h1>` per page (the `PageHero` title, or `SectionTitle as="h1"` on pages without one);
  titles about 50–60 characters and descriptions 140–160, written from facts on the page. Mark Urdu text
  `lang="ur"`. New images: WebP, sized about twice their display width, `loading="lazy"` unless they are
  the first thing on screen. `tests/seo.spec.ts` checks the essentials.

## Checking your work

```bash
npm run typecheck && npm run lint
npm test                 # full end-to-end suite against a mock Supabase (never touches production)
```

**When you refactor** (moving markup into components, turning repeated markup into data), prove that
the rendered HTML did not change:

```bash
# 1. on the commit before your change (e.g. main):
npm run build && npm start
npm run snapshot -- ../snap-before        # in a second terminal, while the server runs
# 2. on your branch:
npm run build && npm start
npm run snapshot -- ../snap-after
diff -r ../snap-before ../snap-after      # no output means the markup is identical
```

The snapshot includes `/admin`, which renders every page in one document, so it also covers the
editor's keys. An intended copy change shows up as a one-line diff, and anything more is a structural
change that needs the rule above.

## Branches and reviews

Work on a branch and open a pull request into `main`. CI runs typecheck, lint, a dependency audit and the
full test suite. Mention in the PR description if a change touches page structure, the editor
(`public/editor.js`, `lib/overrides/`) or the database, so the other person checks it with the client.
