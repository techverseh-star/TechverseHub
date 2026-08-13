// In-memory sliding-window rate limiter. The app runs as a single long-lived
// Node process (not serverless/edge), so a process-local Map is sufficient —
// no Redis/Upstash dependency needed. Cached on `globalThis` so Next.js dev
// hot-reload doesn't spawn a fresh map (and a fresh sweep interval) per edit.

interface Bucket {
  count: number;
  resetAt: number;
}

const globalForRateLimit = globalThis as unknown as {
  __rateLimitBuckets?: Map<string, Bucket>;
  __rateLimitSweepStarted?: boolean;
};

const buckets =
  globalForRateLimit.__rateLimitBuckets ?? new Map<string, Bucket>();
globalForRateLimit.__rateLimitBuckets = buckets;

if (!globalForRateLimit.__rateLimitSweepStarted) {
  globalForRateLimit.__rateLimitSweepStarted = true;
  setInterval(() => {
    const now = Date.now();
    buckets.forEach((bucket, key) => {
      if (bucket.resetAt <= now) buckets.delete(key);
    });
  }, 5 * 60_000).unref();
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { ok: true, retryAfterSec: 0 };
}

export function getClientIp(req: Request): string {
  // x-forwarded-for is a client-appended chain (proxy1, proxy2, ..., client
  // is only ever prepended by each hop) - the FIRST entry is whatever the
  // original caller claimed and is trivially spoofable, defeating every
  // IP-keyed rate limit. Behind this app's single trusted reverse proxy, the
  // LAST entry is the one that hop appended from the real socket address.
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const parts = forwardedFor.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }
  return req.headers.get("x-real-ip") || "unknown";
}

export function rateLimitResponse(retryAfterSec: number) {
  return new Response(
    JSON.stringify({ error: "Too many requests. Please try again later." }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfterSec),
      },
    }
  );
}
