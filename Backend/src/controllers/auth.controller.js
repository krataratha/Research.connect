import * as authService from '../services/auth.service.js';
import { validationResult } from 'express-validator';
import AppError from '../utils/AppError.js';

// Helper to set refresh token secure cookie
const setRefreshTokenCookie = (res, token) => {
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };
  res.cookie('refreshToken', token, cookieOptions);
};

// Helper to clear refresh token cookie
const clearRefreshTokenCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
};

/**
 * Handle user registration
 */
export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError(errors.array()[0].msg, 400));
    }

    const sessionData = {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.connection.remoteAddress,
    };

    const { user, accessToken, refreshToken } = await authService.registerUser(req.body, sessionData);

    setRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      status: 'success',
      accessToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle user login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password.', 400));
    }

    const sessionData = {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.connection.remoteAddress,
    };

    const { user, accessToken, refreshToken } = await authService.loginUser(email, password, sessionData);

    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      status: 'success',
      accessToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify Email Address
 */
export const verifyUserEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return next(new AppError('Verification token is required.', 400));
    }

    await authService.verifyEmail(token);

    res.status(200).json({
      status: 'success',
      message: 'Email address verified successfully. You can now log in!',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Request Password Reset Link
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new AppError('Please provide an email address.', 400));
    }

    await authService.requestPasswordReset(email);

    res.status(200).json({
      status: 'success',
      message: 'Password reset link sent to your email address.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset Password
 */
export const resetUserPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return next(new AppError('Token and password are required.', 400));
    }

    await authService.resetPassword(token, password);

    res.status(200).json({
      status: 'success',
      message: 'Password reset successful. Please log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Silent Refresh Access Token
 */
export const refreshToken = async (req, res, next) => {
  try {
    let token = req.cookies.refreshToken;

    if (!token && req.body.refreshToken) {
      token = req.body.refreshToken;
    }

    if (!token) {
      return next(new AppError('No refresh token found. Please log in.', 401));
    }

    const sessionData = {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.connection.remoteAddress,
    };

    const tokens = await authService.refreshUserSession(token, sessionData);

    setRefreshTokenCookie(res, tokens.refreshToken);

    res.status(200).json({
      status: 'success',
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    clearRefreshTokenCookie(res);
    next(error);
  }
};

/**
 * Handle user logout
 */
export const logout = async (req, res, next) => {
  try {
    let token = req.cookies.refreshToken;

    if (!token && req.body.refreshToken) {
      token = req.body.refreshToken;
    }

    if (token) {
      await authService.logoutUser(token);
    }

    clearRefreshTokenCookie(res);

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user details
 */
export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      status: 'success',
      user: {
        id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
        role: req.user.role,
        emailVerified: req.user.emailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};
