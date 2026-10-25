import 'server-only';

/* Fixed-window rate limit per client IP. In-memory, so it is per server instance:
   it stops scripted floods from one client, not a distributed attack (put Vercel's
   firewall rate limiting in front for that). */
const buckets = new Map<string, { start: number; count: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now - b.start > windowMs) {
    buckets.set(key, { start: now, count: 1 });
    if (buckets.size > 5000) for (const [k, v] of buckets) if (now - v.start > windowMs) buckets.delete(k);
    return true;
  }
  b.count++;
  return b.count <= limit;
}

export function clientIp(req: Request) {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';
}
