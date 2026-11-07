import 'server-only';
import { createHash } from 'node:crypto';

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
  // Vercel overwrites this header; never prefer a caller-controlled X-Real-IP there.
  const forwarded = process.env.VERCEL ? req.headers.get('x-vercel-forwarded-for') : req.headers.get('x-forwarded-for');
  return (forwarded?.split(',')[0].trim() || 'unknown').slice(0, 80);
}

/** Shared atomic limiter when Redis REST is configured. An unavailable shared store
 * fails closed; it must never silently switch to a weaker per-instance limit. */
export async function formRateLimit(req: Request, scope: string, limit: number) {
  const windowMs = 600_000;
  const now = Date.now();
  const retryAfter = Math.max(1, Math.ceil((windowMs - (now % windowMs)) / 1000));
  const identity = createHash('sha256').update(clientIp(req)).digest('hex');
  const key = `forms:${scope}:${identity}:${Math.floor(now / windowMs)}`;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url || token) {
    if (!url || !token) throw new Error('Incomplete rate limit configuration');
    const result = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([
        'EVAL',
        "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('PEXPIRE',KEYS[1],ARGV[1]) end; return n",
        1,
        key,
        windowMs,
      ]),
      signal: AbortSignal.timeout(4000),
      cache: 'no-store',
    });
    const body = await result.json();
    if (!result.ok || typeof body.result !== 'number') throw new Error('Rate limit unavailable');
    return { allowed: body.result <= limit, retryAfter };
  }
  // Bounded fallback for local/single-instance hosting. Shared deployments use Redis.
  if (buckets.size >= 10_000) {
    for (const [k, v] of buckets) if (now - v.start >= windowMs) buckets.delete(k);
    if (buckets.size >= 10_000 && !buckets.has(key)) return { allowed: false, retryAfter };
  }
  return { allowed: rateLimit(key, limit, windowMs), retryAfter };
}
