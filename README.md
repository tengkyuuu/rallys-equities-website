# Rallys Equities — Website

Marketing and investor website for **Rallys Equities (Pvt) Ltd**, a SECP-licensed PSX brokerage in Lahore.
Built with **Next.js 16 (App Router) + TypeScript**, deployed on Vercel, with Supabase for editable
content, form submissions and editor logins.

The site was migrated from a single-file HTML page in October 2026 with the same design, content and
URLs; see [Migration notes](#migration-notes). **Working on the code? Read [CONTRIBUTING.md](CONTRIBUTING.md)
first**: it explains where things go and the one rule that protects the client's saved edits.

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

No setup needed for local development: Supabase defaults to the production project (public, read-only
for visitors). Copy [`.env.example`](.env.example) to `.env.local` to point elsewhere or to switch on
analytics and error monitoring.

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run typecheck` · `npm run lint` · `npm run format` | TypeScript, ESLint, Prettier |
| `npm test` | End-to-end suite (builds the site against a mock Supabase; see [Tests](#tests)) |

## How it is organised

```
app/
  (site)/                 every public page, plus /admin, under one root layout (nav, ticker, footer…)
    layout.tsx            <head>, site chrome, providers, published theme/fonts
    page.tsx …            one folder per route; services/[slug] and tools/[slug] use templates
    admin/                the visual editor's host page (every page in one document)
  (standalone)/set-password   where editor invite emails land (no site chrome)
  api/market              PSX data for the market widgets (server-side fetch)
  api/submissions         contact / complaint / feedback / career / account forms (+ /uploads)
  api/revalidate          editors' "Publish" refreshes the site's content cache
  sitemap.ts · robots.ts · global-not-found.tsx
components/
  ui/                     shared building blocks: PageHero, SectionTitle, ServiceCard, FeatureList,
                          CtaBlock, Callout, Eyebrow, LinkChips, LuxDivider
  pages/                  one thin file per page that composes sections (HomePage, ServicesPage, …)
  home/ · services/       the sections of the two large pages, one file each
  contact/ · support/ · policies/   pieces used by the contact, complaint/feedback and policy pages
  layout/                 Nav, MobileMenu, Footer, Preloader, SitePage wrapper…
  calculators/            the eight Tools calculators (one template + data)
  forms/                  all forms, sharing useFields / useSubmission
  market/                 MarketProvider (polls /api/market), hero card, ticker, markets board
  blog/ · content/ · effects/ · overlays/ · admin/ · nav/ · actions/
lib/
  site.ts                 routes, titles and descriptions for every page (single source of truth)
  company.ts              phone numbers, social links, office map URLs
  menus.ts                header, mobile and footer menus
  content.ts              published editor content, read on the server (cached 60 s)
  overrides/              the editor's override engine (applies saved edits to the page)
  forms/                  zod schemas (shared by browser and API) and the submit flow
  calculators/ · pricing.ts · market.ts · services.ts · faq.ts · policies.ts
styles/                   the original stylesheet, split by section in its original order
public/                   assets (same URLs as before), editor.js / editor.css
proxy.ts                  per-request Content-Security-Policy with a script nonce
```

### Content editing

The client edits the site in the browser at **`/admin`** (see [EDITOR.md](EDITOR.md)). Edits are saved in
Supabase and keyed by element position, so **page markup must keep its structure**: moving, adding or
removing elements inside a page can re-point saved edits. `tests/content-overrides.spec.ts` checks every
element's key round-trips, and that the keys live on production today still land on the same elements.

- Pricing, theme colours, fonts and selector-hidden elements are rendered on the server.
- Text, image, hide and reorder edits are applied in the browser on every page view.
- The blog is rendered on the server, one page per post.

### Security

- **Content-Security-Policy with a per-request nonce** (`proxy.ts`): no inline scripts or `on*=` handlers
  can run, and connections are limited to this site's own Supabase project.
- HSTS, `nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, and no `X-Powered-By`.
- **Forms go through the API**, which validates every field with zod and rate-limits each client.
  Documents upload straight to Supabase Storage on one-time signed URLs after a type and size check.
- Editor content (post bodies, write-ups, edited text) is sanitised against an allowlist on the server
  and in the browser.
- **Recommended:** set `SUPABASE_SERVICE_ROLE_KEY` in Vercel, then remove the anonymous insert policies on
  `form_submissions` and the `form-uploads` bucket. The API then becomes the only way to submit.

### Market data

Real PSX figures or "unavailable", never invented numbers. See [MARKET-DATA.md](MARKET-DATA.md).

## Tests

`npm test` runs Playwright against a production build wired to
[`tests/mock-supabase.mjs`](tests/mock-supabase.mjs), an in-memory stand-in for Supabase seeded from
[`tests/fixtures/content.json`](tests/fixtures/content.json). Nothing touches the real project. The suite
covers:

- routing and navigation, SEO metadata and structured data
- security headers and the CSP, sanitising, API validation and rate limits
- market-data states, the blog and sitemap
- forms, including signed uploads and the five-step account application
- the calculators
- the editor end to end: sign in, edit, publish, then a visitor sees the change

CI (`.github/workflows/ci.yml`) runs typecheck, lint, a production-dependency audit and the full suite.

## Deployment

Vercel builds this as a standard Next.js app. `vercel.json` pins the framework and the `.next` output
folder, overriding the project's dashboard settings (the old static site used `.`, which breaks a
Next.js build with `NEXT_NO_ROUTES_MANIFEST`). Pages render per
request, because the CSP nonce must be fresh each time. Content and posts are cached for 60 seconds and
refreshed immediately when an editor publishes.

Environment variables: [`.env.example`](.env.example).

The Supabase edge functions (`supabase/functions`: editor invites, submission alerts) are unchanged and
deploy separately.

## Migration notes

The original site was one `index.html` (HTML, CSS and JS) that switched between 38 in-page "pages". In
this version:

- **URLs:** every page keeps its URL. `/index.html`, `/set-password.html` and `?edit=1` redirect.
- **Design:** pixel-compared against the original page by page.
- **Fixes along the way:**
  - The original showed broken images and backgrounds when a nested URL (e.g. `/services/trading`) was
    opened directly, because of relative asset paths.
  - Every visitor used to download all ~8 MB of blog posts on every page load.
  - The account form's step circles showed a ✓ on the active step after going back.
- **Removed:** the unused Express backend (`server.js`). The forms already saved to Supabase, not to it.
