import { Router } from 'express';
import {
  register,
  login,
  googleLogin,
  verifyEmail,
  sendEmailVerification,
  verifyLoginOtp,
  resendLoginOtp,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  logout,
  getMe,
  refreshToken,
  logoutAll,
  getTrustedDevices,
  revokeTrustedDevice,
  renameTrustedDevice,
  getLoginActivity,
  getSecurityLogs,
} from '../controllers/auth.controller.js';
import {
  validateRegister,
  validateLogin,
  validateOTP,
  validateForgotPassword,
  validateResetPassword,
  validateResendOTP,
} from '../validations/auth.validation.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

// Authentication Core Endpoints
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/google-login', googleLogin);
router.post('/verify-email', validateOTP, verifyEmail);
router.post('/send-email-verification', validateResendOTP, sendEmailVerification);
router.post('/verify-login-otp', validateOTP, verifyLoginOtp);
router.post('/verify-otp', validateOTP, verifyLoginOtp); // standard alias
router.post('/resend-login-otp', validateResendOTP, resendLoginOtp);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/verify-reset-otp', validateOTP, verifyResetOtp);
router.post('/reset-password', validateResetPassword, resetPassword);

// Token & Session Lifecycle Endpoints
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.post('/logout-all', protect, logoutAll);
router.get('/me', protect, getMe);

// Trusted Devices & Session Management
router.get('/trusted-devices', protect, getTrustedDevices);
router.delete('/trusted-devices/:id', protect, revokeTrustedDevice);
router.patch('/trusted-devices/:id', protect, renameTrustedDevice);

// UI Compatibility Aliases
router.get('/sessions', protect, getTrustedDevices);
router.delete('/sessions/:id', protect, revokeTrustedDevice);
router.get('/login-activity', protect, getLoginActivity);
router.get('/security-logs', protect, getSecurityLogs);

export default router;
