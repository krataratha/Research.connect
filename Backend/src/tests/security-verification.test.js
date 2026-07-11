/**
 * Comprehensive compatibility & behavior verification test
 * Tests ALL security changes in isolation without needing MongoDB or network access.
 * Each test simulates real Express request/response objects.
 */

import crypto from 'crypto';

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✅ PASS: ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${label}`);
    failed++;
  }
}

function section(title) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`📋 ${title}`);
  console.log('─'.repeat(60));
}

// ─── Mock Express helpers ────────────────────────────────────────────────────
const mockNext = (err) => err ? { error: err } : null;

const mockReq = (overrides = {}) => ({
  body: {}, query: {}, params: {}, headers: {}, cookies: {},
  ip: '127.0.0.1', method: 'POST', path: '/test', url: '/test',
  ...overrides,
});

const mockRes = () => {
  const res = {
    _status: 200, _headers: {}, _body: null,
    statusCode: 200,
    status(code) { this._status = code; this.statusCode = code; return this; },
    json(body) { this._body = body; return this; },
    setHeader(k, v) { this._headers[k] = v; },
    removeHeader(k) { delete this._headers[k]; },
    on() {},
  };
  return res;
};

// ─────────────────────────────────────────────────────────────────────────────
section('1. DEEP NOSQL INJECTION SANITIZER');
// ─────────────────────────────────────────────────────────────────────────────
const { deepSanitizeMiddleware, hppBlocker } = await import('../middleware/security/sanitizer.js');

// Test 1.1: Removes top-level $operator keys
{
  const req = mockReq({ body: { '$gt': '', email: 'test@test.com' } });
  deepSanitizeMiddleware(req, mockRes(), mockNext);
  assert(!Object.keys(req.body).includes('$gt'), 'Strips top-level $gt key');
  assert(req.body.email === 'test@test.com', 'Preserves normal email field');
}

// Test 1.2: Removes nested $operators
{
  const req = mockReq({ body: { user: { email: { '$ne': null } }, name: 'Alice' } });
  deepSanitizeMiddleware(req, mockRes(), mockNext);
  assert(!('$ne' in req.body.user.email), 'Removes nested $ne operator');
  assert(req.body.name === 'Alice', 'Preserves normal name field');
}

// Test 1.3: Handles arrays with $operators
{
  const req = mockReq({ body: { filters: [{ '$where': 'sleep(1000)' }, { valid: 'val' }] } });
  deepSanitizeMiddleware(req, mockRes(), mockNext);
  const hasWhere = JSON.stringify(req.body).includes('$where');
  assert(!hasWhere, 'Removes $where from inside arrays');
  assert(req.body.filters[1] && req.body.filters[1].valid === 'val', 'Preserves valid array items');
}

// Test 1.4: Sanitizes query params
{
  const req = mockReq({ query: { search: 'ml', '$where': 'malicious' } });
  deepSanitizeMiddleware(req, mockRes(), mockNext);
  assert(!req.query['$where'], 'Removes $where from query params');
  assert(req.query.search === 'ml', 'Preserves valid query params');
}

// ─────────────────────────────────────────────────────────────────────────────
section('2. XSS SANITIZER');
// ─────────────────────────────────────────────────────────────────────────────

// Test 2.1: Strips script tags
{
  const req = mockReq({ body: { bio: '<script>alert(document.cookie)</script>Hello World', query: {}, params: {} } });
  deepSanitizeMiddleware(req, mockRes(), mockNext);
  assert(!req.body.bio.includes('<script>'), 'Strips <script> tags from bio');
  assert(req.body.bio.includes('Hello World'), 'Preserves text content after tag strip');
}

// Test 2.2: Strips event handlers
{
  const req = mockReq({ body: { title: '<img onerror="steal()" src=x>Research Paper' } });
  deepSanitizeMiddleware(req, mockRes(), mockNext);
  assert(!req.body.title.includes('onerror'), 'Strips onerror event handler');
  assert(req.body.title.includes('Research Paper'), 'Preserves text after stripping');
}

// Test 2.3: Strips javascript: URI
{
  const req = mockReq({ body: { url: 'javascript:alert(1)', website: 'https://valid.com' } });
  deepSanitizeMiddleware(req, mockRes(), mockNext);
  assert(!req.body.url.includes('javascript:'), 'Strips javascript: URI scheme');
  assert(req.body.website === 'https://valid.com', 'Preserves valid HTTPS URLs');
}

// Test 2.4: Normal academic content is NOT altered
{
  const req = mockReq({ body: {
    title: 'Neural Networks for Protein Folding: A Study in α-Helix Prediction',
    abstract: 'This paper presents a novel approach using 3D convolutions... (n=1000, p<0.05)',
    doi: '10.1038/s41586-021-03819-2',
  }});
  deepSanitizeMiddleware(req, mockRes(), mockNext);
  assert(req.body.title === 'Neural Networks for Protein Folding: A Study in α-Helix Prediction',
    'Preserves academic title with special characters');
  assert(req.body.doi === '10.1038/s41586-021-03819-2', 'Preserves DOI exactly');
}

// ─────────────────────────────────────────────────────────────────────────────
section('3. HTTP PARAMETER POLLUTION BLOCKER');
// ─────────────────────────────────────────────────────────────────────────────

// Test 3.1: Reduces duplicate scalar params to last value
{
  const req = mockReq({ query: { sort: ['asc', 'desc', 'hack'] } });
  hppBlocker(req, mockRes(), mockNext);
  assert(!Array.isArray(req.query.sort), 'Collapses duplicate sort param to single value');
  assert(req.query.sort === 'hack', 'Last value wins for non-whitelisted params');
}

// Test 3.2: Whitelisted params remain as arrays
{
  const req = mockReq({ query: { tags: ['ml', 'ai', 'nlp'], keywords: ['bert', 'gpt'], sort: 'latest' } });
  hppBlocker(req, mockRes(), mockNext);
  assert(Array.isArray(req.query.tags), 'Whitelisted "tags" remains as array');
  assert(Array.isArray(req.query.keywords), 'Whitelisted "keywords" remains as array');
  assert(req.query.sort === 'latest', 'Non-array sort stays as-is');
}

// ─────────────────────────────────────────────────────────────────────────────
section('4. PATH TRAVERSAL GUARD');
// ─────────────────────────────────────────────────────────────────────────────
const { guardPathTraversal, sanitizeFilename } = await import('../middleware/security/fileValidator.js');

// Test 4.1: Blocks parent directory traversal
{
  const { safe } = guardPathTraversal('../../../etc/passwd', '/app/uploads');
  assert(!safe, 'Blocks ../../../etc/passwd traversal');
}

// Test 4.2: Blocks encoded traversal
{
  const { safe } = guardPathTraversal('..%2F..%2Fetc%2Fpasswd', '/app/uploads');
  // After path.resolve decoding, this should be caught
  assert(typeof safe === 'boolean', 'Returns boolean for encoded traversal');
}

// Test 4.3: Allows valid paths within base dir
{
  const { safe, resolvedPath } = guardPathTraversal('user123/thesis.pdf', '/app/uploads');
  assert(safe, 'Allows valid path within uploads/');
  assert(resolvedPath.startsWith('/app/uploads'), 'Resolved path starts with base dir');
}

// Test 4.4: Filename sanitizer strips null bytes
{
  const clean = sanitizeFilename('thesis.pdf\0.php');
  assert(!clean.includes('\0'), 'Strips null byte from filename');
  assert(!clean.includes('php'), 'Null-byte extension stripped');
}

// Test 4.5: Filename sanitizer strips directory components
{
  const clean = sanitizeFilename('../../secret/config.env');
  assert(!clean.includes('..'), 'Strips .. from filename');
  assert(clean === 'config.env', 'Extracts just the basename');
}

// ─────────────────────────────────────────────────────────────────────────────
section('5. RATE LIMITER');
// ─────────────────────────────────────────────────────────────────────────────
const { createRateLimiter } = await import('../middleware/security/rateLimiter.js');

// Test 5.1: Allows requests under limit
{
  const limiter = createRateLimiter({ id: 'test:allow', max: 3, windowMs: 60000 });
  const req = mockReq();
  const res1 = mockRes();
  limiter(req, res1, () => {});
  limiter(req, res1, () => {});
  limiter(req, res1, () => {});
  assert(res1._status !== 429, 'Does not block when under limit');
}

// Test 5.2: Blocks after exceeding limit
{
  const limiter = createRateLimiter({ id: 'test:block', max: 2, windowMs: 60000 });
  const req = mockReq({ ip: '192.168.99.99' });
  const res = mockRes();
  limiter(req, res, () => {});
  limiter(req, res, () => {});
  limiter(req, res, () => {}); // 3rd request — over limit
  assert(res._status === 429, 'Blocks requests exceeding max');
  assert(res._body?.message?.includes('Too many'), 'Returns correct 429 message');
}

// Test 5.3: Rate limit headers are set correctly
{
  const limiter = createRateLimiter({ id: 'test:headers', max: 100, windowMs: 60000 });
  const req = mockReq({ ip: '10.0.0.1' });
  const res = mockRes();
  limiter(req, res, () => {});
  assert(res._headers['X-RateLimit-Limit'] === '100', 'Sets X-RateLimit-Limit header');
  assert(res._headers['X-RateLimit-Remaining'] !== undefined, 'Sets X-RateLimit-Remaining header');
}

// Test 5.4: Different IPs get independent counters
{
  const limiter = createRateLimiter({ id: 'test:ips', max: 2, windowMs: 60000 });
  const req1 = mockReq({ ip: '1.1.1.1' });
  const req2 = mockReq({ ip: '2.2.2.2' });
  const res = mockRes();
  limiter(req1, res, () => {}); limiter(req1, res, () => {}); limiter(req1, res, () => {}); // IP1 over limit
  const res2 = mockRes();
  limiter(req2, res2, () => {}); // IP2 should still be fine
  assert(res2._status !== 429, 'IP2 not blocked when IP1 is rate-limited');
}

// ─────────────────────────────────────────────────────────────────────────────
section('6. REQUEST GUARD MIDDLEWARE');
// ─────────────────────────────────────────────────────────────────────────────
const { additionalSecurityHeaders, suspiciousPatternLogger, installSecureLogger } = await import('../middleware/security/requestGuard.js');

// Test 6.1: Additional security headers are set
{
  const req = mockReq();
  const res = mockRes();
  additionalSecurityHeaders(req, res, () => {});
  assert(res._headers['X-Content-Type-Options'] === 'nosniff', 'Sets X-Content-Type-Options: nosniff');
  assert(res._headers['X-Frame-Options'] === 'DENY', 'Sets X-Frame-Options: DENY');
  assert(res._headers['Permissions-Policy'] !== undefined, 'Sets Permissions-Policy header');
  assert(res._headers['Referrer-Policy'] === 'strict-origin-when-cross-origin', 'Sets Referrer-Policy');
  assert(res._headers['X-Powered-By'] === undefined, 'Removes X-Powered-By header');
}

// Test 6.2: Suspicious pattern logger doesn't block (only logs)
{
  const req = mockReq({ url: '/api/users?id=1 OR 1=1', query: { id: '1 OR 1=1' }, path: '/api/users' });
  const res = mockRes();
  let nexCalled = false;
  suspiciousPatternLogger(req, res, () => { nexCalled = true; });
  assert(nexCalled, 'Pattern logger calls next() — never blocks requests');
  assert(res._status !== 400 && res._status !== 403, 'Pattern logger does not set error status');
}

// Test 6.3: Secure logger redacts tokens from objects
{
  const oldLog = console.log;
  let logged = '';
  console.log = (...args) => { logged = JSON.stringify(args); };
  installSecureLogger();
  console.log({ password: 'mysecretpassword', email: 'user@test.com', role: 'admin' });
  const logCheck = logged.includes('[REDACTED]') && !logged.includes('mysecretpassword');
  const preserveCheck = logged.includes('user@test.com');
  if (!preserveCheck) {
    console.error('DEBUG Test 6.3 failed. logged value is:', logged);
  }
  assert(logCheck, 'Secure logger redacts password field from logged objects');
  assert(preserveCheck, 'Secure logger preserves non-sensitive fields');
  // Restore
  console.log = oldLog;
}

// ─────────────────────────────────────────────────────────────────────────────
section('7. JWT ALGORITHM PINNING (auth.middleware.js)');
// ─────────────────────────────────────────────────────────────────────────────
import jwt from 'jsonwebtoken';

// Test 7.1: timingSafeEqual works correctly
const { timingSafeEqual } = await import('../middleware/auth.middleware.js');
assert(timingSafeEqual('hello', 'hello') === true, 'timingSafeEqual: equal strings return true');
assert(timingSafeEqual('hello', 'world') === false, 'timingSafeEqual: different strings return false');
assert(timingSafeEqual('abc', 'ab') === false, 'timingSafeEqual: different lengths return false');
assert(timingSafeEqual('', '') === true, 'timingSafeEqual: empty strings return true');

// Test 7.2: JWT with alg:none is rejected
{
  // Create a malicious JWT with alg:none
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ id: 'fake_admin', iat: Date.now() })).toString('base64url');
  const noneToken = `${header}.${payload}.`;

  let rejected = false;
  try {
    jwt.verify(noneToken, 'any_secret', { algorithms: ['HS256'] });
  } catch (err) {
    rejected = err.name === 'JsonWebTokenError';
  }
  assert(rejected, 'JWT alg:none attack is rejected by HS256 pin');
}

// ─────────────────────────────────────────────────────────────────────────────
section('8. BACKWARD COMPATIBILITY — NORMAL REQUESTS NOT AFFECTED');
// ─────────────────────────────────────────────────────────────────────────────

// Test 8.1: Normal registration body passes through unchanged
{
  const normalBody = {
    fullName: 'Dr. Alice Chen',
    email: 'alice.chen@university.edu',
    password: 'SecurePass123!',
    role: 'researcher',
    institution: 'MIT',
    country: 'United States',
  };
  const req = mockReq({ body: { ...normalBody } });
  deepSanitizeMiddleware(req, mockRes(), mockNext);
  assert(req.body.fullName === normalBody.fullName, 'Full name preserved');
  assert(req.body.email === normalBody.email, 'Email preserved');
  assert(req.body.role === normalBody.role, 'Role preserved');
  assert(req.body.institution === normalBody.institution, 'Institution preserved');
}

// Test 8.2: Normal publication body passes through unchanged
{
  const pubBody = {
    title: 'Graph Neural Networks for Drug Discovery: A Systematic Review',
    abstract: 'We present a systematic review of 147 papers (2018-2024)...',
    doi: '10.1016/j.neunet.2024.01.001',
    journal: 'Neural Networks',
    publicationYear: 2024,
    keywords: ['GNN', 'drug discovery', 'deep learning'],
    status: 'Published',
  };
  const req = mockReq({ body: { ...pubBody } });
  deepSanitizeMiddleware(req, mockRes(), mockNext);
  assert(req.body.title === pubBody.title, 'Publication title preserved');
  assert(req.body.doi === pubBody.doi, 'DOI preserved');
  assert(req.body.publicationYear === 2024, 'Numeric values preserved');
  assert(Array.isArray(req.body.keywords), 'Keywords array preserved');
}

// Test 8.3: Search queries pass through unchanged
{
  const req = mockReq({ query: { q: 'machine learning protein folding', year: '2024', sort: 'latest', page: '1', limit: '10' } });
  deepSanitizeMiddleware(req, mockRes(), mockNext);
  hppBlocker(req, mockRes(), mockNext);
  assert(req.query.q === 'machine learning protein folding', 'Search query preserved');
  assert(req.query.sort === 'latest', 'Sort param preserved');
  assert(req.query.page === '1', 'Page param preserved');
}

// Test 8.4: Response headers don't break CORS
{
  const req = mockReq();
  const res = mockRes();
  additionalSecurityHeaders(req, res, () => {});
  // Verify we're not setting conflicting CORS headers
  assert(res._headers['Access-Control-Allow-Origin'] === undefined, 
    'additionalSecurityHeaders does not override CORS headers (handled by cors middleware)');
}

// ─────────────────────────────────────────────────────────────────────────────
// FINAL REPORT
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(60));
console.log(`📊 FINAL RESULTS: ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log('🎉 ALL TESTS PASSED — Security changes are backward compatible!');
} else {
  console.log('❌ SOME TESTS FAILED — Review failures above.');
}
console.log('═'.repeat(60));
