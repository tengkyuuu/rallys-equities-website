# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: first-time investors in Pakistan** opening their first Pakistan Stock Exchange (PSX)
account. They need to trust the broker before anything else, want plain explanations of how
investing works, and many are more comfortable in Urdu than English.

Also served, on their own pages: active retail traders comparing brokers (rates, platforms,
service), and companies, funds and family offices opening corporate or institutional accounts
(Services → Corporate Accounts).

## Product Purpose

The marketing and investor website of **Rallys Equities (Pvt) Ltd**, a SECP-licensed PSX brokerage
in Lahore. It exists to earn a visitor's trust, explain the brokerage's services, and move them to
open an account: online (the five-step application on `/open-account`, or the CDC/eClear portal),
by phone or WhatsApp, or by visiting the office. It also carries the investor-relations,
education and compliance material a regulated broker must publish (policies, complaints routes,
regulator links, financial highlights), eight investor calculators, and a blog.

Success: a first-time visitor understands what Rallys does, believes it is safe and regulated, and
starts an account application or contacts the team.

## Positioning

Confirmed differentiators (all four hold together):

- **Shariah-compliant investing** as a core offer: screened Shariah-compliant universes,
  portfolio reviews and dividend-purification guidance, not an add-on.
- **Personal relationship managers**, a dedicated person in Urdu and English rather than a call
  centre.
- **Competitive, transparent fees**: low brokerage rates, no hidden charges.
- **A physical presence at the Lahore Stock Exchange Building**: Office #408, 4th Floor,
  Khayaban-e-Aiwan-e-Iqbal, Lahore. Local and visitable.

## Operating Context

- Regulated by SECP; PSX TREC holder (TREC No. 553); client assets held at CDC Pakistan; NCCPL
  clearing; covered by the PSX Investor Protection Fund. Jama Punji (SECP's investor-education
  portal) is shown as an education partner, deliberately not grouped with the regulators.
- Account opening can complete on the CDC/eClear portal (`https://aof.eclear.com.pk/repl`), which
  opens in a new tab.
- Contact: 042-36366667, 0316-9991907, WhatsApp, hello@rallysequities.com.
- The client edits text, images, colours, pricing, blog posts and page visibility themselves in
  the visual editor at `/admin`, and handles form submissions there. Editor invites land on
  `/set-password`.

## Capabilities and Constraints

- **Market data is real or nothing.** Every price comes from `/api/market`; when the feed is
  down the site says so and links to the PSX Data Portal. Never show invented, simulated or
  placeholder figures. PSX's terms prohibit unapproved automated access to its site, so prices
  stay "unavailable" until Rallys licenses a feed (see MARKET-DATA.md).
- **Policies are view-only**: they open in an in-page viewer with no download or print
  affordances, at the client's request.
- **Editor content is keyed by element position.** Page markup must keep its structure or the
  client's saved edits silently re-point (README → Content editing).
- Forms (contact, complaint, feedback, careers, account application with CNIC and address
  documents) go through validated server APIs into Supabase.
- Regulated-industry copy: no promised returns; calculators carry a disclaimer that results are
  estimates.

## Brand Commitments

- Name: **Rallys Equities (Pvt) Ltd**; "Rallys Equities" in running copy.
- **Bilingual English and Urdu**: Urdu lines appear throughout (hero, stats, calls to action) in
  Noto Nastaliq Urdu.
- Existing logo (`public/assets/img/logo.png`) and the established dark navy, emerald and gold
  identity with Cormorant Garamond and Plus Jakarta Sans. The client brief for the October 2026
  Next.js migration was to keep the design exactly as it was.

## Evidence on Hand

- Figures the client confirms (October 2026): **35+ years combined market experience, 1,000+
  investors served, 500+ PSX-listed securities available**.
- Licences and memberships above, with regulator and PSX logos in `public/assets/img/`.
- Eleven policy PDFs (`public/assets/policies/`), TRE certificate and admission/office-opening
  notices (`public/assets/docs/`).
- ~830 published blog posts (market education and SEO articles) managed in the editor.
- **Not available, do not fabricate:** customer testimonials or named clients (the home page's
  "Why Investors Choose Us" cards are value statements, not quotes), performance records or
  returns, awards, press coverage. The terms-of-service, privacy-policy and risk-disclosure PDFs
  are placeholders awaiting the real documents (docs/legal-documents.md).

## Product Principles

1. **Trust before persuasion.** Regulation, custody and transparency come first; a first-time
   investor must feel safe before being asked to act.
2. **Real or nothing.** No invented prices, returns, testimonials or claims; say "unavailable"
   rather than fill a gap.
3. **Explain plainly, in both languages.** Assume no prior knowledge; keep Urdu a first-class
   language, not a garnish.
4. **A person, not a portal.** Keep the route to a real relationship manager, phone line or the
   office visible.
5. **The client can run it.** Content stays editable by a non-technical owner without breaking.

## Accessibility & Inclusion

Urdu right-to-left content must render correctly alongside English. No formal standard has been
set; treat WCAG 2.2 AA as the working baseline until the client names one.
