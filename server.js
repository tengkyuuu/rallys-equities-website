/**
 * Rallys Equities — site server + form backend
 *
 * Serves the static site and provides:
 *   POST /api/contact            — contact form submissions
 *   POST /api/applications       — account-opening applications (multipart, 4 documents)
 *   GET  /api/admin/contacts     — list contact submissions   (Bearer ADMIN_TOKEN)
 *   GET  /api/admin/applications — list applications          (Bearer ADMIN_TOKEN)
 *   GET  /api/admin/file/:ref/:name — download an uploaded doc (Bearer ADMIN_TOKEN)
 *   GET  /admin                  — minimal admin UI
 *
 * Storage: SQLite via node:sqlite (Node >= 22.5) in data/rallys.db,
 * uploaded documents in data/uploads/<reference>/.
 *
 * Env (all optional):
 *   PORT          server port (default 5174)
 *   ADMIN_TOKEN   admin bearer token (default: generated and printed at boot)
 *   SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / NOTIFY_TO
 *                 if set, sends a notification email per submission
 */
'use strict';

const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');
const express = require('express');
const multer = require('multer');

const PORT = parseInt(process.env.PORT || '5174', 10);
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || crypto.randomBytes(12).toString('hex');

// ---------- database ----------
const db = new DatabaseSync(path.join(DATA_DIR, 'rallys.db'));
db.exec(`
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    ip TEXT
  );
  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reference TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL,
    payload TEXT NOT NULL,
    files TEXT NOT NULL,
    ip TEXT
  );
`);

// ---------- optional email ----------
let mailer = null;
if (process.env.SMTP_HOST && process.env.NOTIFY_TO) {
  const nodemailer = require('nodemailer');
  mailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
}
function notify(subject, text) {
  if (!mailer) return;
  mailer
    .sendMail({ from: process.env.SMTP_USER || 'no-reply@rallysequities.com', to: process.env.NOTIFY_TO, subject, text })
    .catch((e) => console.error('[mail]', e.message));
}

// ---------- app ----------
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '64kb' }));

// simple per-IP rate limit: 30 requests / 10 min on /api/*
const hits = new Map();
app.use('/api/', (req, res, next) => {
  const now = Date.now();
  const rec = hits.get(req.ip) || { n: 0, t: now };
  if (now - rec.t > 10 * 60 * 1000) { rec.n = 0; rec.t = now; }
  rec.n++;
  hits.set(req.ip, rec);
  if (rec.n > 30) return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  next();
});

const clean = (v, max = 500) => String(v ?? '').trim().slice(0, max);
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// ---------- contact form ----------
app.post('/api/contact', (req, res) => {
  const name = clean(req.body.name, 120);
  const email = clean(req.body.email, 200);
  const phone = clean(req.body.phone, 40);
  const subject = clean(req.body.subject, 60);
  const message = clean(req.body.message, 5000);

  const allowedSubjects = ['General Inquiry', 'Client Support', 'Careers & HR', 'Corporate Partnerships'];
  if (name.length < 2) return res.status(400).json({ error: 'Please enter your name.' });
  if (!isEmail(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
  if (!allowedSubjects.includes(subject)) return res.status(400).json({ error: 'Please select a subject.' });
  if (message.length < 3) return res.status(400).json({ error: 'Please enter a message.' });

  db.prepare('INSERT INTO contacts (created_at, name, email, phone, subject, message, ip) VALUES (?,?,?,?,?,?,?)')
    .run(new Date().toISOString(), name, email, phone, subject, message, req.ip);

  notify(`[Rallys] Contact: ${subject} — ${name}`, `From: ${name} <${email}> ${phone}\n\n${message}`);
  res.json({ ok: true });
});

// ---------- account opening ----------
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 4 },
  fileFilter: (req, file, cb) => {
    const ok = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.mimetype);
    cb(ok ? null : new Error('Only JPG, PNG or PDF files are accepted.'), ok);
  },
});
const docFields = upload.fields([
  { name: 'cnicFront', maxCount: 1 },
  { name: 'cnicBack', maxCount: 1 },
  { name: 'addressProof', maxCount: 1 },
  { name: 'photo', maxCount: 1 },
]);

app.post('/api/applications', (req, res) => {
  docFields(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });

    const b = req.body;
    const required = {
      firstName: clean(b.firstName, 80), lastName: clean(b.lastName, 80),
      cnic: clean(b.cnic, 20), mobile: clean(b.mobile, 30), email: clean(b.email, 200),
    };
    if (required.firstName.length < 2 || required.lastName.length < 2)
      return res.status(400).json({ error: 'Please provide your full name.' });
    if (required.cnic.replace(/\D/g, '').length !== 13)
      return res.status(400).json({ error: 'Please provide a valid 13-digit CNIC.' });
    if (!isEmail(required.email))
      return res.status(400).json({ error: 'Please provide a valid email address.' });

    const payload = {
      ...required,
      fatherOrHusband: clean(b.fatherOrHusband, 120), dob: clean(b.dob, 20), gender: clean(b.gender, 30),
      address: clean(b.address, 600), city: clean(b.city, 60), province: clean(b.province, 60),
      employment: clean(b.employment, 80), employer: clean(b.employer, 200),
      income: clean(b.income, 80), sourceOfFunds: clean(b.sourceOfFunds, 80),
      bank: clean(b.bank, 80), iban: clean(b.iban, 40),
      experience: clean(b.experience, 80), objective: clean(b.objective, 80),
      accountType: clean(b.accountType, 30), riskTolerance: clean(b.riskTolerance, 30),
      language: clean(b.language, 20), services: clean(b.services, 400),
    };

    const reference = 'RE-' + new Date().getFullYear() + '-' + crypto.randomInt(10000, 99999);
    const dir = path.join(UPLOAD_DIR, reference);
    fs.mkdirSync(dir, { recursive: true });

    const stored = {};
    const extOf = (f) => (f.mimetype === 'application/pdf' ? '.pdf' : f.mimetype === 'image/png' ? '.png' : '.jpg');
    for (const field of ['cnicFront', 'cnicBack', 'addressProof', 'photo']) {
      const f = req.files?.[field]?.[0];
      if (f) {
        const fname = field + extOf(f);
        fs.writeFileSync(path.join(dir, fname), f.buffer);
        stored[field] = fname;
      }
    }

    db.prepare('INSERT INTO applications (reference, created_at, payload, files, ip) VALUES (?,?,?,?,?)')
      .run(reference, new Date().toISOString(), JSON.stringify(payload), JSON.stringify(stored), req.ip);

    notify(
      `[Rallys] New account application ${reference}`,
      `${payload.firstName} ${payload.lastName} (${payload.accountType})\nCNIC: ${payload.cnic}\nMobile: ${payload.mobile}\nEmail: ${payload.email}\nDocuments: ${Object.keys(stored).join(', ') || 'none'}`
    );
    res.json({ ok: true, reference });
  });
});

// ---------- admin ----------
function requireAdmin(req, res, next) {
  const tok = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (tok !== ADMIN_TOKEN) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

app.get('/api/admin/contacts', requireAdmin, (req, res) => {
  res.json(db.prepare('SELECT * FROM contacts ORDER BY id DESC LIMIT 500').all());
});
app.get('/api/admin/applications', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM applications ORDER BY id DESC LIMIT 500').all();
  res.json(rows.map((r) => ({ ...r, payload: JSON.parse(r.payload), files: JSON.parse(r.files) })));
});
app.get('/api/admin/file/:ref/:name', requireAdmin, (req, res) => {
  const ref = String(req.params.ref).replace(/[^A-Za-z0-9-]/g, '');
  const name = String(req.params.name).replace(/[^A-Za-z0-9.-]/g, '');
  const fp = path.join(UPLOAD_DIR, ref, name);
  if (!fp.startsWith(UPLOAD_DIR) || !fs.existsSync(fp)) return res.status(404).json({ error: 'Not found' });
  res.sendFile(fp);
});
app.get('/admin', (req, res) => res.sendFile(path.join(ROOT, 'admin.html')));

// ---------- static site ----------
app.use(express.static(ROOT, { extensions: ['html'], index: 'index.html' }));

app.listen(PORT, () => {
  console.log(`Rallys Equities site + backend running at http://localhost:${PORT}`);
  console.log(`Admin UI:   http://localhost:${PORT}/admin`);
  console.log(`Admin token: ${ADMIN_TOKEN}${process.env.ADMIN_TOKEN ? ' (from env)' : ' (generated this boot — set ADMIN_TOKEN to fix it)'}`);
  console.log(`Email notifications: ${mailer ? 'ENABLED -> ' + process.env.NOTIFY_TO : 'disabled (set SMTP_HOST + NOTIFY_TO to enable)'}`);
});
