import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import globalErrorHandler from './middleware/errorHandler.js';
import responseFormatter from './middleware/responseFormatter.js';
import AppError from './utils/AppError.js';
import apiRouter from './routes/index.js';

// Existing security middleware
import { rateLimiter, mongoSanitize } from './middleware/security.middleware.js';

// New security middleware layers
import { deepSanitizeMiddleware, hppBlocker } from './middleware/security/sanitizer.js';
import {
  requestTimeout,
  suspiciousPatternLogger,
  additionalSecurityHeaders,
} from './middleware/security/requestGuard.js';
import {
  loginRateLimiter,
  otpRateLimiter,
  registerRateLimiter,
  forgotPasswordRateLimiter,
  uploadRateLimiter,
} from './middleware/security/rateLimiter.js';

const app = express();

// ─── 0. Standardize all response formats ─────────────────────────────────────
app.use(responseFormatter);

// ─── 1. Global Security Headers ──────────────────────────────────────────────

// Helmet with strict Content-Security-Policy, HSTS, and referrer policy
app.use(
  helmet({
    // Content Security Policy — restricts what resources the browser can load
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline needed for some CSS
        imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      },
    },
    // HTTP Strict Transport Security — forces HTTPS for 1 year in production
    hsts: process.env.NODE_ENV === 'production'
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
    // Prevent MIME-type sniffing
    noSniff: true,
    // Block clickjacking
    frameguard: { action: 'deny' },
    // Hide X-Powered-By: Express
    hidePoweredBy: true,
    // Cross-Origin-Resource-Policy
    crossOriginResourcePolicy: { policy: 'same-site' },
  })
);

// Additional security headers beyond Helmet defaults
app.use(additionalSecurityHeaders);

// ─── 2. CORS ─────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Refresh-Token'],
    // Cache pre-flight response for 1 hour — reduces OPTIONS request overhead
    maxAge: 3600,
  })
);

// ─── 3. Request Hardening ─────────────────────────────────────────────────────

// Hard request timeout (30s) — defeats Slow-loris DoS
app.use(requestTimeout);

// Development HTTP logging (never log in production to avoid sensitive data exposure)
if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  app.use(morgan('dev'));
}

// ─── 4. Body Parsing (strict limits) ─────────────────────────────────────────
// 10kb limit prevents memory exhaustion from huge JSON payloads
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ─── 5. Input Sanitization ───────────────────────────────────────────────────

// HTTP Parameter Pollution blocker — must run after urlencoded parsing
app.use(hppBlocker);

// Deep NoSQL injection + XSS sanitizer (handles nested arrays and objects)
app.use(deepSanitizeMiddleware);

// Legacy shallow sanitizer (kept for compatibility — deep one is primary)
app.use(mongoSanitize);

// ─── 6. Suspicious Request Logging ───────────────────────────────────────────
app.use(suspiciousPatternLogger);

// ─── 7. Global API Rate Limiter ───────────────────────────────────────────────
// 300 req / 15 min per IP for all /api routes
app.use('/api', rateLimiter({ max: 300, windowMs: 15 * 60 * 1000 }));

// ─── 8. Per-Route Auth Rate Limiters (MUST be before route mounting) ─────────
// These are tighter limits on high-risk auth endpoints
app.use('/api/v1/auth/login', loginRateLimiter);
app.use('/api/v1/auth/verify-login-otp', otpRateLimiter);
app.use('/api/v1/auth/verify-otp', otpRateLimiter);
app.use('/api/v1/auth/verify-email', otpRateLimiter);
app.use('/api/v1/auth/register', registerRateLimiter);
app.use('/api/v1/auth/forgot-password', forgotPasswordRateLimiter);
app.use('/api/v1/auth/resend-login-otp', forgotPasswordRateLimiter);

// File upload rate limiter
app.use('/api/v1/upload', uploadRateLimiter);

// ─── 9. Static Files ─────────────────────────────────────────────────────────
// Serve static files from uploads/ with security headers
app.use('/uploads', express.static('uploads', {
  dotfiles: 'deny',           // Never serve dot-files (e.g. .htaccess)
  index: false,               // No directory listing
  setHeaders: (res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, max-age=3600');
  },
}));

// ─── 10. Mount API Routes ────────────────────────────────────────────────────
app.use('/api/v1', apiRouter);

// ─── 11. Fallback 404 Handler ─────────────────────────────────────────────────
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// ─── 12. Global Error Handler ─────────────────────────────────────────────────
app.use(globalErrorHandler);

export default app;
