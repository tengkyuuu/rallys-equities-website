import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import ts from 'typescript';

// Run the actual limiter in Node without Next's server-only import marker.
const source = (await readFile(new URL('../lib/server/rate-limit.ts', import.meta.url), 'utf8')).replace("import 'server-only';", '');
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } });
const { formRateLimit, clientIp } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

test('forms share a per-client quota, while a second client has its own allowance', async () => {
  const request = new Request('https://example.com/api/submissions', { headers: { 'x-forwarded-for': '192.0.2.1' } });
  for (let i = 0; i < 8; i++) assert.equal((await formRateLimit(request, 'submit', 8)).allowed, true);
  const limited = await formRateLimit(request, 'submit', 8);
  assert.equal(limited.allowed, false);
  assert.ok(limited.retryAfter > 0 && limited.retryAfter <= 600);
  const other = new Request(request.url, { headers: { 'x-forwarded-for': '192.0.2.2' } });
  assert.equal((await formRateLimit(other, 'submit', 8)).allowed, true);
});

test('Vercel client identity ignores caller-supplied forwarded headers', () => {
  const previous = process.env.VERCEL;
  process.env.VERCEL = '1';
  try {
    const request = new Request('https://example.com', {
      headers: { 'x-forwarded-for': 'forged', 'x-real-ip': 'also-forged', 'x-vercel-forwarded-for': '192.0.2.10' },
    });
    assert.equal(clientIp(request), '192.0.2.10');
  } finally {
    if (previous === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = previous;
  }
});

test('shared Redis command is atomic, hashes client IPs, and fails closed on outages', async () => {
  const originalFetch = globalThis.fetch;
  const previousUrl = process.env.UPSTASH_REDIS_REST_URL;
  const previousToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example.invalid';
  process.env.UPSTASH_REDIS_REST_TOKEN = 'test-only';
  const request = new Request('https://example.com', { headers: { 'x-forwarded-for': '192.0.2.20' } });
  try {
    let count = 0;
    globalThis.fetch = async (url, options) => {
      assert.equal(url, 'https://redis.example.invalid');
      const [command, script, keyCount, key, ttl] = JSON.parse(options.body);
      assert.equal(command, 'EVAL');
      assert.match(script, /INCR/);
      assert.match(script, /PEXPIRE/);
      assert.equal(keyCount, 1);
      assert.equal(ttl, 600_000);
      assert.ok(!key.includes('192.0.2.20'));
      return Response.json({ result: ++count });
    };
    assert.equal((await formRateLimit(request, 'shared', 1)).allowed, true);
    assert.equal((await formRateLimit(request, 'shared', 1)).allowed, false);
    globalThis.fetch = async () => {
      throw new Error('Redis unavailable');
    };
    await assert.rejects(formRateLimit(request, 'shared', 1), /Redis unavailable/);
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    await assert.rejects(formRateLimit(request, 'shared', 1), /Incomplete/);
  } finally {
    globalThis.fetch = originalFetch;
    for (const [key, value] of [
      ['UPSTASH_REDIS_REST_URL', previousUrl],
      ['UPSTASH_REDIS_REST_TOKEN', previousToken],
    ]) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
