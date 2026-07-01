const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controller/auth.controller');
const { authMiddleware } = require('../../../common/middlewares/auth.middleware');
const {
  registerValidator,
  sendOtpValidator,
  verifyOtpValidator,
  loginValidator,
  resetPasswordValidator
} = require('../validator/auth.validator');

// Strict rate limiter for authentication routes to prevent brute-forcing
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // max 20 requests per IP
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
    error: { code: 'TOO_MANY_REQUESTS' }
  }
});

// Apply rate limiter to all auth routes
router.use(authRateLimiter);

// Public Routes
router.post('/register', registerValidator, authController.register);
router.post('/send-registration-otp', sendOtpValidator, authController.sendRegistrationOtp);
router.post('/verify-registration-otp', verifyOtpValidator, authController.verifyRegistrationOtp);

router.post('/login', loginValidator, authController.login);
router.post('/send-login-otp', sendOtpValidator, authController.sendLoginOtp);
router.post('/verify-login-otp', verifyOtpValidator, authController.verifyLoginOtp);

router.post('/forgot-password', sendOtpValidator, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidator, authController.resetPassword);

router.post('/refresh-token', authController.refreshAccessToken);
router.post('/logout', authController.logout);

// Protected Routes (Require Access Token)
router.post('/logout-all', authMiddleware, authController.logoutAll);
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
