# Rallys Equities — Website

Marketing & investor website for **Rallys Equities (Pvt) Ltd**, a SECP-licensed PSX brokerage in Lahore, Pakistan. Single-page site with live (simulated) market data, 8 investor calculators, full company/services/investor-relations content, and an optional Node backend for the contact & account-opening forms.

## Structure

| File | Purpose |
|---|---|
| `index.html` | The entire frontend — single-file SPA (HTML + CSS + vanilla JS), 32 in-page routes |
| `server.js` | Optional Node/Express backend: contact form, account applications, file uploads, admin dashboard |
| `admin.html` | Token-protected admin UI (needs the backend) |
| `assets/img/` | Logos, photos, stock/regulator graphics |
| `vercel.json` / `.vercelignore` | Static-deploy config for Vercel (frontend only) |

## Local development

```bash
npm install
npm run dev        # http://localhost:5174  (auto-restarts on server.js changes)
# or: npm start
```

The forms POST to the backend when it's running. **With no backend reachable, both forms gracefully fall back to a demo success state** — so the static deploy works as a full showcase.

## Deployment

**Frontend → Vercel (static).** The site is deployed to Vercel as a static site (see `vercel.json`). The backend is *not* deployed there: Vercel's serverless filesystem is ephemeral, so the file-based SQLite DB and uploaded documents can't persist. On the static deploy the forms run in demo mode.

To enable real form submissions in production, host `server.js` on a Node platform with persistent storage (Render, Railway, Fly.io, or a VPS) and point the frontend's `/api/*` calls at it — or migrate to a cloud database (Neon/Turso) + blob storage and Vercel serverless functions.

## Backend env (only if hosting `server.js`)

Copy `.env.example` → `.env` and set `ADMIN_TOKEN` plus optional SMTP credentials. The `data/` folder (SQLite DB + uploads) is git-ignored.
