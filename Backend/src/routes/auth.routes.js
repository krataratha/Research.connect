import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateSignup } from '../validations/user.validation.js';

const router = express.Router();

router.post('/register', validateSignup, authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.post('/verify-email', authController.verifyUserEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetUserPassword);

router.get('/me', protect, authController.getMe);

export default router;
