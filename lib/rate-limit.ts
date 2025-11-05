/**
 * Simple In-Memory Rate Limiter
 *
 * Prevents API abuse without requiring a database.
 * Good enough for MVP and demos.
 *
 * Limits:
 * - 5 requests per IP per minute
 * - Resets every minute
 * - No persistence (resets on server restart - that's fine)
 */

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitStore>();

// Clean up old entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check if request should be rate limited
 *
 * @param identifier - Usually IP address
 * @param limit - Max requests per window (default: 5)
 * @param windowMs - Time window in ms (default: 60000 = 1 minute)
 */
export function rateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 60000
): RateLimitResult {
  const now = Date.now();
  const current = rateLimitMap.get(identifier);

  // First request or window expired
  if (!current || now > current.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });

    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: now + windowMs,
    };
  }

  // Within window, check count
  if (current.count < limit) {
    current.count++;
    return {
      success: true,
      limit,
      remaining: limit - current.count,
      reset: current.resetTime,
    };
  }

  // Rate limited!
  return {
    success: false,
    limit,
    remaining: 0,
    reset: current.resetTime,
  };
}

/**
 * Get client IP from request headers
 * Works with Vercel, Cloudflare, and other proxies
 */
export function getClientIp(headers: Headers): string {
  // Check common proxy headers
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fallback
  return 'unknown';
}
