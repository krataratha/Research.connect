/**
 * @file rateLimiter.js
 * @description Per-route sliding-window rate limiters for sensitive authentication endpoints.
 *
 * Uses an in-memory Map with no external dependencies.
 * Each limiter tracks requests per IP using a sliding window algorithm.
 *
 * Attack vectors mitigated:
 *  - Brute-force credential attacks (OWASP A07:2021)
 *  - Credential stuffing
 *  - OTP exhaustion attacks
 *  - Password reset abuse
 */

/** In-memory store: Map<limiterId, Map<ip, { requests: [{ts}] }>> */
const stores = new Map();

// Clean up stale IPs every 10 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [limiterId, ipMap] of stores.entries()) {
    for (const [ip, data] of ipMap.entries()) {
      if (now - data.lastSeen > 60 * 60 * 1000) { // Remove IPs inactive for 1 hour
        ipMap.delete(ip);
      }
    }
    if (ipMap.size === 0) stores.delete(limiterId);
  }
}, 10 * 60 * 1000);

/**
 * Creates a sliding-window rate limiter middleware.
 *
 * @param {object} options
 * @param {string}  options.id        - Unique identifier for this limiter (avoids cross-contamination)
 * @param {number}  options.max       - Max requests allowed in the window
 * @param {number}  options.windowMs  - Window size in milliseconds
 * @param {string}  [options.message] - Custom rejection message
 * @param {boolean} [options.skipInDev] - Skip limiting in development (default: false)
 * @returns Express middleware
 */
export const createRateLimiter = ({ id, max, windowMs, message, skipInDev = false }) => {
  if (!stores.has(id)) stores.set(id, new Map());
  const ipMap = stores.get(id);

  return (req, res, next) => {
    // Only skip in explicit test mode, never skip in development for auth routes
    if (skipInDev && process.env.NODE_ENV === 'test') return next();

    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.ip ||
      req.connection?.remoteAddress ||
      '0.0.0.0';

    const now = Date.now();
    const windowStart = now - windowMs;

    if (!ipMap.has(ip)) {
      ipMap.set(ip, { requests: [], lastSeen: now });
    }

    const data = ipMap.get(ip);
    data.lastSeen = now;

    // Sliding window: keep only timestamps within the current window
    data.requests = data.requests.filter((ts) => ts > windowStart);
    data.requests.push(now);

    const count = data.requests.length;
    const remaining = Math.max(0, max - count);
    const resetAt = data.requests[0] + windowMs; // When oldest request expires

    // Set standard rate-limit response headers (RFC 6585)
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(resetAt / 1000)));

    if (count > max) {
      res.setHeader('Retry-After', String(Math.ceil((resetAt - now) / 1000)));
      return res.status(429).json({
        status: 'fail',
        message: message || 'Too many requests. Please try again later.',
      });
    }

    next();
  };
};

// ─── Pre-built limiters for specific auth flows ─────────────────────────────

/** Login: max 10 attempts per 15 minutes per IP */
export const loginRateLimiter = createRateLimiter({
  id: 'auth:login',
  max: 10,
  windowMs: 15 * 60 * 1000,
  message: 'Too many login attempts from this IP. Please try again after 15 minutes.',
});

/** OTP verification: max 10 attempts per 15 minutes per IP */
export const otpRateLimiter = createRateLimiter({
  id: 'auth:otp',
  max: 10,
  windowMs: 15 * 60 * 1000,
  message: 'Too many OTP attempts from this IP. Please try again after 15 minutes.',
});

/** Registration: max 5 registrations per hour per IP */
export const registerRateLimiter = createRateLimiter({
  id: 'auth:register',
  max: 5,
  windowMs: 60 * 60 * 1000,
  message: 'Too many accounts created from this IP. Please try again after an hour.',
});

/** Forgot password: max 5 requests per hour per IP */
export const forgotPasswordRateLimiter = createRateLimiter({
  id: 'auth:forgot-password',
  max: 5,
  windowMs: 60 * 60 * 1000,
  message: 'Too many password reset requests from this IP. Please try again after an hour.',
});

/** File upload: max 20 uploads per 10 minutes per IP */
export const uploadRateLimiter = createRateLimiter({
  id: 'upload',
  max: 20,
  windowMs: 10 * 60 * 1000,
  message: 'Too many file uploads. Please slow down.',
});
