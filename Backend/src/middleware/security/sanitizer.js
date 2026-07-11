/**
 * @file sanitizer.js
 * @description Multi-layer input sanitization middleware.
 *
 * Layers implemented:
 *  1. Deep NoSQL Injection sanitizer — recursively strips MongoDB operators ($gt, $where, etc.)
 *     from req.body, req.query, and req.params including nested arrays and objects.
 *  2. XSS sanitizer — strips HTML/script tags from all string fields before they
 *     reach controllers or get stored in the database.
 *  3. HTTP Parameter Pollution (HPP) blocker — when a query param appears multiple times,
 *     keeps only the last value to prevent logic confusion in middleware chains.
 *
 * Attack vectors mitigated:
 *  - NoSQL Injection (OWASP A03:2021) — e.g. {"email": {"$gt": ""}}
 *  - Stored XSS (OWASP A03:2021) — e.g. <script>alert(1)</script> in bio field
 *  - HTTP Parameter Pollution — e.g. ?role=user&role=admin
 *
 * Zero external dependencies — pure Node.js.
 */

// ─── 1. XSS Tag Stripper ────────────────────────────────────────────────────

/**
 * Strips all HTML tags and dangerous Unicode from a string.
 * Preserves normal text content while removing script injection vectors.
 * @param {string} str
 * @returns {string}
 */
const stripXSS = (str) => {
  if (typeof str !== 'string') return str;
  return str
    // Remove script tags and their content
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    // Remove all other HTML tags
    .replace(/<[^>]+>/g, '')
    // Remove javascript: and data: URI schemes
    .replace(/javascript\s*:/gi, '')
    .replace(/data\s*:/gi, '')
    // Remove vbscript: URI scheme
    .replace(/vbscript\s*:/gi, '')
    // Remove on* event handlers lingering after tag strip
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Trim leading/trailing whitespace
    .trim();
};

// ─── 2. Deep Object Sanitizer ───────────────────────────────────────────────

/**
 * Recursively sanitizes an object or array:
 *  - Deletes keys starting with '$' or containing '.' (NoSQL injection)
 *  - Strips XSS from string values
 *  - Handles nested objects, arrays, and primitive values
 *
 * @param {any} value - The value to sanitize
 * @param {number} depth - Recursion depth guard (max 20 levels)
 * @returns {any} - Sanitized value
 */
const deepSanitize = (value, depth = 0) => {
  // Guard against deeply nested or circular structures
  if (depth > 20) return value;

  if (Array.isArray(value)) {
    return value.map((item) => deepSanitize(item, depth + 1));
  }

  if (value !== null && typeof value === 'object') {
    const sanitized = {};
    for (const key of Object.keys(value)) {
      // Drop any key that starts with '$' (MongoDB operators) or contains '.' (dot notation injection)
      if (key.startsWith('$') || key.includes('.')) {
        continue; // Skip this key entirely
      }
      sanitized[key] = deepSanitize(value[key], depth + 1);
    }
    return sanitized;
  }

  if (typeof value === 'string') {
    return stripXSS(value);
  }

  return value;
};

// ─── 3. HTTP Parameter Pollution Blocker ────────────────────────────────────

/**
 * When the same query parameter is supplied multiple times (e.g. ?sort=asc&sort=desc),
 * Express creates an array. This middleware reduces arrays in req.query to a single value
 * (the last occurrence wins — most conservative approach).
 *
 * Exceptions: explicitly whitelisted params may remain as arrays (e.g. tags, ids).
 *
 * @param {string[]} whitelist - Param names allowed to be arrays
 */
const buildHPPBlocker = (whitelist = []) => (req, res, next) => {
  if (req.query && typeof req.query === 'object') {
    for (const key of Object.keys(req.query)) {
      if (Array.isArray(req.query[key]) && !whitelist.includes(key)) {
        // Keep only the last value supplied
        req.query[key] = req.query[key][req.query[key].length - 1];
      }
    }
  }
  next();
};

// ─── 4. Combined Sanitization Middleware ────────────────────────────────────

/**
 * Runs deep NoSQL + XSS sanitization on req.body, req.query, and req.params.
 */
export const deepSanitizeMiddleware = (req, res, next) => {
  if (req.body) req.body = deepSanitize(req.body);
  if (req.query) req.query = deepSanitize(req.query);
  if (req.params) req.params = deepSanitize(req.params);
  next();
};

/**
 * HTTP Parameter Pollution blocker.
 * Whitelist: 'ids', 'tags', 'keywords' are allowed to be arrays.
 */
export const hppBlocker = buildHPPBlocker(['ids', 'tags', 'keywords', 'authors', 'areas']);

/**
 * Standalone XSS sanitizer middleware (for use on specific routes if needed).
 */
export const xssSanitizer = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = deepSanitize(req.body);
  }
  next();
};
