import { NextResponse } from "next/server";
import type { ZodType } from "zod";
import { getVerifiedUserId } from "./supabase-server";
import { rateLimit, rateLimitResponse } from "./rate-limit";

interface GuardOptions<T> {
  /** Rate-limit bucket prefix, combined with the verified user id, e.g. "ai" -> "ai:<userId>". */
  rateLimitPrefix: string;
  limit: number;
  windowMs: number;
  /** When provided, the request body is parsed and validated against this schema. */
  schema?: ZodType<T>;
}

type GuardResult<T> =
  | { ok: true; userId: string; data: T }
  | { ok: false; response: Response };

// Every authenticated API route in this app repeats the same three steps
// (verify the bearer token, enforce a per-user rate limit, validate the
// body) before doing its own actual work. Centralizing them here means a
// fix to any one of those steps only has to happen once.
export async function guardAuthedRequest<T = undefined>(
  req: Request,
  opts: GuardOptions<T>
): Promise<GuardResult<T>> {
  const userId = await getVerifiedUserId(req);
  if (!userId) {
    return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const { ok, retryAfterSec } = rateLimit(`${opts.rateLimitPrefix}:${userId}`, opts.limit, opts.windowMs);
  if (!ok) {
    return { ok: false, response: rateLimitResponse(retryAfterSec) };
  }

  if (opts.schema) {
    const body = await req.json().catch(() => undefined);
    const parsed = opts.schema.safeParse(body);
    if (!parsed.success) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: parsed.error.issues[0]?.message || "Invalid request" },
          { status: 400 }
        ),
      };
    }
    return { ok: true, userId, data: parsed.data };
  }

  return { ok: true, userId, data: undefined as T };
}
