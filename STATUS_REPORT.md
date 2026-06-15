# Rallys Equities Website — Status Report

**Date:** June 13, 2026
**Project:** `Rallys Equities Copy` — rebuild of https://rallysequities.com/ into the Claude-generated layout
**Run it:** `npm install` then `npm start` → site at `http://localhost:5174`, admin at `/admin`

---

## 1. WHAT IS WORKING ✅

Everything below has been tested in a real browser during this session (not just code-reviewed).

### Frontend — 32 pages, all routed and rendering
| Area | Status | Verified by |
|---|---|---|
| Home (hero, live ticker, KSE-100 canvas chart, stats counters, 7 service cards, how-it-works, why-choose-us, regulatory, CTA) | ✅ Working | Screenshot + DOM checks |
| Dropdown navigation (About Us / Services / Investor Relations / Tools / Miscellaneous) — every item opens its own page with hero banner | ✅ Working | All 26 dropdown targets resolve; 0 broken links in audit |
| **Mobile hamburger menu** (added in this session's audit — nav was previously unreachable below 900 px) | ✅ Working | Opens/closes, 31 links, closes on navigation, restores scroll |
| Nav active-state highlighting incl. parent mapping (e.g. SIP Calculator page highlights "Tools") | ✅ Working | Checked for tools/about/home |
| Mission & Vision page (statements, guiding principles, company details incl. TREC No. 553 / Reg. G686666 / NTN, PSX public records, key highlights) | ✅ Working | DOM check |
| Our Management (full verbatim bios ×3 + Leadership Philosophy), Management Rating, Corporate Governance (board, 89/10/1 shareholding, auditor) | ✅ Working | DOM check |
| 7 service pages with verbatim live-site copy + "What you get" lists | ✅ Working | DOM check |
| Investor Relations: Portal (grievance disclosures + SECP/PSX complaint links), Education (5 steps + 5 strategies + tips), Financial Highlights, 14 Policies | ✅ Working | DOM check |
| **All 8 calculators** (CAGR, SIP, Investment, Depreciation/inflation, X Rate ex-div/bonus/rights, 2-stage DCF, Projected FCF & Cash, Drawdown with period table) | ✅ Working | Outputs spot-checked against hand-computed values |
| FAQ accordion (10 real Q&As), Useful Downloads, Useful Links pages | ✅ Working | DOM check |
| Markets page — 23 real featured securities, simulated live prices, currency rates | ✅ Working | 23 rows render, ticker updates |
| Contact page — Lahore HQ card (real address/phones/email/hours), Pakistan map with HQ pin, online-account card | ✅ Working | Screenshot |
| WhatsApp chat bubble → wa.me for 0316-9991907 | ✅ Working | DOM check |
| Responsive layout at mobile widths | ✅ Working | Tested at <900 px |

### Backend (Node.js + Express + SQLite)
| Area | Status | Verified by |
|---|---|---|
| `POST /api/contact` — stores contact form, validates subject/email | ✅ Working | Submitted via real UI → row in DB |
| `POST /api/applications` — full 5-step application + 4 document uploads (JPG/PNG/PDF, 5 MB), returns `RE-YYYY-NNNNN` reference | ✅ Working | Submitted with CNIC file → `RE-2026-72356`, file on disk |
| SQLite persistence (`data/rallys.db`) | ✅ Working | Data survived a server restart |
| Admin dashboard `/admin` + token-protected JSON/file endpoints | ✅ Working | Valid token loads data; wrong token → 401 |
| Server-side validation (bad email → 400), per-IP rate limiting, upload type/size limits, path-traversal guard | ✅ Working | Bad-input request returned 400 |
| Demo-mode fallback — forms still "succeed" client-side if deployed statically with no backend | ✅ Working | Tested earlier with `npx serve` |
| `npm audit` | ✅ 0 vulnerabilities | Multer 2.x / Nodemailer 8.x |

---

## 2. WHAT IT SHOULD DO (intended behavior)

- **One file = whole frontend.** `index.html` is a single-page application with 32 in-page routes. Navigation never reloads the page; `showPage()` switches views and scrolls to top.
- **Strict layout fidelity.** Design system (navy/emerald/gold, Cormorant Garamond + Plus Jakarta Sans + Noto Nastaliq Urdu) comes from the Claude artifact and is unchanged; all real data from rallysequities.com was transplanted into it.
- **Market data is simulated by design.** Prices seed from realistic PSX base values and drift; the UI labels it "SIMULATED LIVE". The built-in Yahoo-Finance-via-proxy fetch switches the label to "LIVE DATA" if a CORS proxy responds (best-effort, not guaranteed).
- **Forms hit the backend when present.** Contact → `/api/contact`; account opening → `/api/applications` (multipart with documents). Staff review submissions at `/admin` using the `ADMIN_TOKEN`. With SMTP configured in `.env`, each submission also sends a notification email.
- **Official actions link out.** Real account opening (eClear AOF), SECP/PSX complaint portals, regulator sites, and certificate PDFs link to official/live destinations.

---

## 3. NOT DONE / NOT WORKING ⚠️

### Not done (intentionally out of scope so far)
| Item | Notes |
|---|---|
| **Client login / "Log In" button** | No authentication system. The button currently routes to the account-opening page. A real investor portal (sessions, passwords, KYC status, holdings) is a separate project — typically lives in the broker's trading platform. |
| **Real-time PSX market data** | Simulated (clearly labeled). A production feed needs a licensed data vendor or PSX data agreement; the Yahoo proxy fallback is best-effort only. |
| **Email notifications not configured** | Code is ready; needs real SMTP credentials in `.env` (see `.env.example`). Currently disabled. |
| **Certificate PDFs not hosted locally** | The 3 "View Official PDF" buttons link to the live site's mission-vision page because the PDFs are hosted there. Drop the files in and re-point the links when migrating. |
| **Useful Downloads files** | The live site's downloads page exposes no direct file URLs (its `/useful-links/` URL is actually 404 on the live site too). Our page links to eClear/email/live page instead. |
| **Production deployment** | No HTTPS/reverse-proxy/process-manager setup (e.g. nginx + pm2, or a PaaS). The server runs plain HTTP on :5174. |
| **CAPTCHA / spam protection beyond rate limiting** | Rate limiting (30 req/10 min/IP) exists; no CAPTCHA on forms. |
| **Multi-language toggle** | Urdu appears as accent text (matching the layout), but there's no full English/Urdu site toggle. |

### Known quirks (minor, non-blocking)
| Item | Notes |
|---|---|
| `node:sqlite` prints an "experimental" warning at boot on Node 24 | Cosmetic; the API is stable in practice. Swap to `better-sqlite3` if it bothers you. |
| Admin file links require the token to be entered first | By design (token-gated), but means file links aren't shareable URLs. |
| DCF model assumptions | The live site doesn't publish its exact two-stage model; ours uses 10 yrs growth-stage + 10 yrs terminal-stage, which is a standard interpretation — outputs may differ slightly from the original calculator. |
| Depreciation calculator | The live version lets you edit inflation % per year in a table; ours uses a single annual rate input (same formula, simplified UI). |
| Application data is stored unencrypted on disk | Fine for dev; for production handle CNIC documents per SECP data-protection expectations (encryption at rest, access controls, retention policy). |

### Fixed during this audit 🔧
1. **Mobile navigation was missing entirely** — the layout hides desktop nav links below 900 px with no alternative; with 32 pages the site was un-navigable on phones. Added an animated hamburger button + full-screen grouped menu (all 31 destinations + Open Account CTA), auto-closing on navigation.
2. **Nav highlighting on sub-pages** — calculator/service/IR pages now highlight their parent menu item (e.g. CAGR page → "Tools" active).
3. Audit also confirmed: 0 broken `showPage` targets, 0 duplicate element IDs, no JS console errors, contact-form anchor intact.

---

## 4. Suggested next steps (priority order)

1. Put real SMTP credentials in `.env` so the team gets notified of submissions.
2. Host the 3 PSX certificate PDFs locally and re-point the buttons.
3. Deploy behind HTTPS (any Node host or VPS + nginx/pm2) and set a strong `ADMIN_TOKEN`.
4. Add CAPTCHA (e.g. Cloudflare Turnstile) to both forms before going public.
5. Decide on the "Log In" story — link it to the broker's actual trading-platform login, or scope a client portal as phase 2.
