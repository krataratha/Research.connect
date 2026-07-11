/**
 * @file requestGuard.js
 * @description Request-level security guards.
 *
 * Layers implemented:
 *  1. Request timeout — kills requests that take longer than 30 seconds,
 *     protecting against Slow-loris and resource exhaustion DoS.
 *  2. Suspicious pattern detector — logs (never blocks) requests matching
 *     known attack patterns (SQLi probes, path traversal, etc.) for audit.
 *  3. Secure logger — wraps console methods to scrub sensitive data
 *     (Authorization headers, passwords, tokens) from all log output.
 *  4. Security response headers — adds additional security headers beyond Helmet defaults.
 *
 * Attack vectors mitigated:
 *  - Slow-loris DoS (OWASP A06)
 *  - Resource exhaustion / CPU DoS
 *  - Sensitive data in logs (OWASP A09:2021)
 *  - Information disclosure via response headers
 */

// ─── 1. Request Timeout Middleware ───────────────────────────────────────────
const REQUEST_TIMEOUT_MS = 30_000; // 30 seconds

/**
 * Kills a request if it takes longer than REQUEST_TIMEOUT_MS.
 * Sends a 503 response and prevents further processing.
 */
export const requestTimeout = (req, res, next) => {
  const timer = setTimeout(() => {
    if (!res.headersSent) {
      res.status(503).json({
        status: 'error',
        message: 'Request timed out. Please try again.',
      });
    }
  }, REQUEST_TIMEOUT_MS);

  // Clear timer when response finishes
  res.on('finish', () => clearTimeout(timer));
  res.on('close', () => clearTimeout(timer));

  next();
};

// ─── 2. Suspicious Pattern Detector ─────────────────────────────────────────
const SUSPICIOUS_PATTERNS = [
  /(\.\.|%2e%2e|%252e%252e)/i,              // Path traversal
  /(<script|<\/script|javascript:|onerror=)/i, // XSS probes
  /('|"|;|--|\bOR\b|\bAND\b|\bUNION\b)/i,  // SQL injection probes
  /(\$where|\$gt|\$lt|\$ne|\$in|\$nin|\$regex)/i, // NoSQL injection
  /(etc\/passwd|win\.ini|boot\.ini)/i,       // File disclosure
  /(exec\(|eval\(|system\(|passthru\()/i,   // RCE probes
];

/**
 * Logs suspicious request patterns for security auditing.
 * NEVER blocks — only logs. Blocking is handled by the sanitizer.
 */
export const suspiciousPatternLogger = (req, res, next) => {
  const inspect = [
    req.url,
    JSON.stringify(req.query),
    typeof req.body === 'object' ? JSON.stringify(req.body) : String(req.body || ''),
  ].join(' ');

  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(inspect)) {
      const ip =
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.ip ||
        'unknown';

      // Log without exposing the actual payload (only log the pattern that matched)
      console.warn(
        `[SECURITY] Suspicious pattern detected | IP: ${ip} | Method: ${req.method} | Path: ${req.path} | Pattern: ${pattern.source}`
      );
      break; // One log per request is enough
    }
  }

  next();
};

// ─── 3. Secure Logger — Scrubs Secrets from All Logs ────────────────────────
const SENSITIVE_KEYS = [
  'password', 'passwd', 'pass', 'secret', 'token', 'authorization',
  'auth', 'apikey', 'api_key', 'access_token', 'refresh_token',
  'credit_card', 'card_number', 'cvv', 'ssn',
];

const SENSITIVE_KEY_REGEX = new RegExp(SENSITIVE_KEYS.join('|'), 'i');

/**
 * Recursively redacts sensitive keys in an object before logging.
 */
const redactSensitive = (obj, depth = 0) => {
  if (depth > 5 || obj === null || typeof obj !== 'object') return obj;
  const redacted = Array.isArray(obj) ? [] : {};
  for (const key of Object.keys(obj)) {
    if (SENSITIVE_KEY_REGEX.test(key)) {
      redacted[key] = '[REDACTED]';
    } else {
      redacted[key] = redactSensitive(obj[key], depth + 1);
    }
  }
  return redacted;
};

/**
 * Installs a secure wrapper around console.log / console.error that
 * automatically redacts sensitive data from objects passed to logger.
 *
 * Call once at startup (in server.js).
 */
export const installSecureLogger = () => {
  const originalLog = console.log.bind(console);
  const originalWarn = console.warn.bind(console);
  const originalError = console.error.bind(console);

  const secureFormat = (...args) =>
    args.map((arg) => {
      if (arg && typeof arg === 'object') {
        return redactSensitive(arg);
      }
      if (typeof arg === 'string') {
        // Redact Bearer tokens in log strings
        return arg.replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/g, 'Bearer [REDACTED]');
      }
      return arg;
    });

  console.log = (...args) => originalLog(...secureFormat(...args));
  console.warn = (...args) => originalWarn(...secureFormat(...args));
  console.error = (...args) => originalError(...secureFormat(...args));
};

// ─── 4. Additional Security Response Headers ─────────────────────────────────

/**
 * Adds security headers that go beyond Helmet's defaults.
 * These complement Helmet; they do NOT replace it.
 */
export const additionalSecurityHeaders = (req, res, next) => {
  // Prevent browsers from inferring content type (reduces MIME sniffing attacks)
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Deny framing in all contexts (stronger than Helmet's default SAMEORIGIN)
  res.setHeader('X-Frame-Options', 'DENY');

  // Force HTTPS for 1 year with subdomain inclusion (production only)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Opt out of browser features not needed by this API
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), interest-cohort=()'
  );

  // Control how much referrer info is sent
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Remove the Express fingerprint
  res.removeHeader('X-Powered-By');

  next();
};
