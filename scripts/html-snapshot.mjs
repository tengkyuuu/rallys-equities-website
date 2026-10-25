// Save the server-rendered <body> of every route so a refactor can be checked for markup changes.
//
//   node scripts/html-snapshot.mjs <outDir> [baseUrl]        (baseUrl defaults to http://localhost:3000)
//
// Snapshot a production build before your change and after it, then `diff -r before after`.
// Scripts, nonces and React's comment markers are stripped, and the declarations inside each
// style="" are sorted, so only real markup changes show. Routes come from lib/site.ts, plus
// /admin (which renders every page in one document, the strictest check for editor keys).
import fs from 'node:fs';
import path from 'node:path';

const [out, base = 'http://localhost:3000'] = process.argv.slice(2);
if (!out) {
  console.error('usage: node scripts/html-snapshot.mjs <outDir> [baseUrl]');
  process.exit(1);
}
const site = fs.readFileSync(new URL('../lib/site.ts', import.meta.url), 'utf8');
const routes = [...new Set([...site.matchAll(/path: '([^']+)'/g)].map((m) => m[1]))].concat(['/admin', '/set-password']);

fs.mkdirSync(out, { recursive: true });
for (const r of routes) {
  const res = await fetch(base + r);
  let html = await res.text();
  html = html
    .slice(html.indexOf('<body'), html.lastIndexOf('</body>'))
    .replace(/<script\b[\s\S]*?<\/script>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/ nonce="[^"]*"/g, '')
    .replace(/ style="([^"]*)"/g, (_, s) => ` style="${s.split(';').filter(Boolean).sort().join(';')}"`)
    .replace(/<link[^>]*>/g, '')
    .replace(/></g, '>\n<');
  fs.writeFileSync(path.join(out, (r === '/' ? 'home' : r.slice(1).replace(/\//g, '_')) + '.html'), html);
}
console.log(`saved ${routes.length} routes to ${out}`);
