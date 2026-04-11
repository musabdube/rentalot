type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  success: boolean;
  remaining: number;
  retryAfter: number;
};

type RateLimitOptions = {
  max: number;
  windowMs: number;
};

const globalForRateLimit = globalThis as typeof globalThis & {
  __rentalotRateLimitStore?: Map<string, RateLimitEntry>;
};

const rateLimitStore =
  globalForRateLimit.__rentalotRateLimitStore ??
  (globalForRateLimit.__rentalotRateLimitStore = new Map<string, RateLimitEntry>());

export function consumeRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + options.windowMs,
    });

    return {
      success: true,
      remaining: Math.max(options.max - 1, 0),
      retryAfter: Math.ceil(options.windowMs / 1000),
    };
  }

  existing.count += 1;
  rateLimitStore.set(key, existing);

  const remaining = Math.max(options.max - existing.count, 0);
  const retryAfter = Math.max(Math.ceil((existing.resetAt - now) / 1000), 1);

  return {
    success: existing.count <= options.max,
    remaining,
    retryAfter,
  };
}

export function resetRateLimit(key: string) {
  rateLimitStore.delete(key);
}

export function getClientIp(headers?: Headers | Record<string, string | string[] | undefined>): string {
  if (!headers) return 'unknown';

  const readHeader = (name: string): string | undefined => {
    if (headers instanceof Headers) {
      return headers.get(name) ?? undefined;
    }

    const value = headers[name] ?? headers[name.toLowerCase()] ?? headers[name.toUpperCase()];
    if (Array.isArray(value)) {
      return value[0];
    }

    return value;
  };

  const forwardedFor = readHeader('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  const realIp = readHeader('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  const cfConnectingIp = readHeader('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  return 'unknown';
}
