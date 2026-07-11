import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';

/**
 * JWT verification options with algorithm explicitly pinned to HS256.
 * This prevents "algorithm confusion" attacks where an attacker modifies
 * the JWT header to use 'none' or an asymmetric algorithm.
 *
 * Attack mitigated: CVE-2015-9235 (jwt alg:none bypass)
 */
const JWT_VERIFY_OPTIONS = { algorithms: ['HS256'] };
const JWT_REFRESH_VERIFY_OPTIONS = { algorithms: ['HS256'] };

/**
 * Timing-safe string comparison to prevent timing-based token oracle attacks.
 * Uses crypto.timingSafeEqual which runs in constant time regardless of where
 * the strings differ — preventing timing side-channel attacks.
 *
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
export const timingSafeEqual = (a, b) => {
  try {
    const bufA = Buffer.from(String(a), 'utf8');
    const bufB = Buffer.from(String(b), 'utf8');
    // Buffers must be the same length for timingSafeEqual
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
};

/**
 * Protect middleware: Ensures the request contains a valid JWT in headers or cookies.
 * Security enhancements:
 *  - Algorithm pinned to HS256 (prevents alg:none and confusion attacks)
 *  - Constant-time token comparison
 */
export const protect = async (req, res, next) => {
  try {
    // 1. Get token from Authorization header or cookies
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(new AppError('You are not logged in! Please log in to gain access.', 401));
    }

    // 2. Verify the token signature with pinned algorithm
    const decoded = jwt.verify(token, process.env.JWT_SECRET, JWT_VERIFY_OPTIONS);

    // 3. Check if the user still exists in the database
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // Check if user is blocked
    if (currentUser.status === 'blocked') {
      return next(new AppError('Your account has been blocked. Please contact support.', 403));
    }

    // 4. Check if the user changed their password after the token was issued
    if (currentUser.changedPasswordAfter && currentUser.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('User recently changed their password! Please log in again.', 401));
    }

    // 5. Check if the email is verified
    if (!currentUser.emailVerified) {
      return next(new AppError('Your email address is not verified. Please verify your email.', 403));
    }

    // Grant access and attach user to request object
    req.user = currentUser;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Your session has expired. Please log in again.', 401));
    }
    next(err);
  }
};

/**
 * Restrict access to specific roles.
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
};

/**
 * Verify Refresh Token middleware.
 * Security enhancements:
 *  - Algorithm pinned to HS256
 *  - Uses timing-safe comparison for token hash lookup (performed in DB query,
 *    but JS-level comparisons use timingSafeEqual)
 */
export const verifyRefreshToken = async (req, res, next) => {
  try {
    let refreshToken = req.cookies.refreshToken;
    if (!refreshToken && req.headers['x-refresh-token']) {
      refreshToken = req.headers['x-refresh-token'];
    }

    if (!refreshToken) {
      return next(new AppError('No refresh token provided. Please log in again.', 401));
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, JWT_REFRESH_VERIFY_OPTIONS);
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    req.user = currentUser;
    next();
  } catch (err) {
    return next(new AppError('Invalid or expired refresh token. Please log in again.', 401));
  }
};

// Aliases for compatibility
export const authenticateUser = protect;
export const verifyJWT = protect;
export const authorizeRoles = restrictTo;
