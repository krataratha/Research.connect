import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { createOTP, verifyOTP } from '../services/otp.service.js';
import OTP from '../models/OTP.js';
import Session from '../models/Session.js';
import LoginActivity from '../models/LoginActivity.js';
import SecurityLog from '../models/SecurityLog.js';
import { parseUserAgent } from '../utils/userAgentParser.js';
import {
  sendRegistrationOTPEmail,
  sendLoginOTPEmail,
  sendForgotPasswordOTPEmail,
  sendAccountActivatedEmail,
  sendPasswordChangedEmail,
} from '../services/email.service.js';
import AppError from '../utils/AppError.js';

/**
 * Sign JWT Access Token
 */
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m',
  });
};

/**
 * Helper to set cookies and send token response
 */
const sendTokenResponse = async (user, session, statusCode, res) => {
  const token = signToken(user._id);
  
  // Generate a cryptographically secure raw refresh token
  const rawRefreshToken = crypto.randomBytes(40).toString('hex');
  const refreshTokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

  // Update session with new refresh token hash and activity
  session.refreshTokenHash = refreshTokenHash;
  session.lastActiveAt = new Date();
  await session.save();

  const isProduction = process.env.NODE_ENV === 'production';

  // Set Access Token cookie (short-lived)
  res.cookie('token', token, {
    expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
  });

  // Set Refresh Token cookie (expires when the session expires, long-lived)
  res.cookie('refreshToken', rawRefreshToken, {
    expires: session.expiresAt,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
  });

  // Hide password
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    refreshToken: rawRefreshToken,
    data: {
      user,
    },
  });
};

/**
 * Register a new user
 */
export const register = async (req, res, next) => {
  try {
    const { fullName, email, password, role, designation, institution, country } = req.body;

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email is already in use by another account.', 400));
    }

    // 2. Create the user
    const user = await User.create({
      fullName,
      email,
      password,
      role: role || 'researcher',
      designation: designation || '',
      institution: institution || '',
      country: country || '',
      emailVerified: false,
      status: 'pending_verification',
    });

    // 3. Generate and send email verification OTP
    const otp = await createOTP(user._id, 'EMAIL_VERIFICATION');
    await sendRegistrationOTPEmail(user.email, otp);

    res.status(201).json({
      status: 'success',
      message: 'Registration successful. A 6-digit verification code has been sent to your email.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Verify email verification OTP
 */
export const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // 1. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('Invalid email or verification code.', 400));
    }

    if (user.emailVerified) {
      return res.status(200).json({
        status: 'success',
        message: 'Email is already verified. You can log in.',
      });
    }

    // Verify OTP
    await verifyOTP(user._id, 'EMAIL_VERIFICATION', otp);

    // 3. Activate user
    user.emailVerified = true;
    user.isVerified = true;
    user.status = 'active';
    await user.save();

    // 4. Send confirmation email
    await sendAccountActivatedEmail(user.email, user.fullName);

    res.status(200).json({
      status: 'success',
      message: 'Your email has been successfully verified. You can now log in.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Resend email verification OTP
 */
export const sendEmailVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    if (user.emailVerified) {
      return next(new AppError('Email is already verified.', 400));
    }

    // Check cooldown (60 seconds)
    const lastOtp = await OTP.findOne({ userId: user._id, purpose: 'EMAIL_VERIFICATION' }).sort({ createdAt: -1 });
    if (lastOtp && (Date.now() - lastOtp.createdAt.getTime() < 60000)) {
      const secondsLeft = Math.ceil((60000 - (Date.now() - lastOtp.createdAt.getTime())) / 1000);
      return next(new AppError(`Please wait ${secondsLeft} seconds before requesting a new code.`, 429));
    }

    const otp = await createOTP(user._id, 'EMAIL_VERIFICATION');
    await sendRegistrationOTPEmail(user.email, otp);

    res.status(200).json({
      status: 'success',
      message: 'A new verification code has been sent to your email.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Login user (step 1: credentials check, bypass OTP if device is trusted)
 */
export const login = async (req, res, next) => {
  try {
    const { email, password, deviceId, deviceName } = req.body;

    if (!deviceId) {
      return next(new AppError('Device ID is required to process login request.', 400));
    }

    // 1. Find user and select password field
    const user = await User.findOne({ email }).select('+password');
    const userAgent = req.headers['user-agent'] || '';
    const { browser, operatingSystem } = parseUserAgent(userAgent);
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

    if (!user) {
      // Log failed attempt without user context (we can't link to a userId)
      await LoginActivity.create({
        browser,
        os: operatingSystem,
        ipAddress,
        status: 'failed',
      });
      // Use the SAME error message as wrong-password to prevent account enumeration
      return next(new AppError('Invalid email or password.', 401));
    }

    // 2. Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return next(
        new AppError(`This account is temporarily locked. Please try again in ${minutesLeft} minutes.`, 401)
      );
    }

    // 3. Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes lockout
        user.loginAttempts = 0;
        await user.save();

        await SecurityLog.create({
          userId: user._id,
          action: 'account_locked',
          ipAddress,
          userAgent,
        });

        return next(
          new AppError('Too many failed login attempts. Your account has been locked for 15 minutes.', 401)
        );
      }
      await user.save();

      // Log failed attempt
      await LoginActivity.create({
        userId: user._id,
        browser,
        os: operatingSystem,
        ipAddress,
        status: 'failed',
      });

      return next(new AppError('Invalid email or password.', 401));
    }

    // Reset login attempts on successful credentials match
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    // 4. Check if email is verified
    if (!user.emailVerified) {
      const otp = await createOTP(user._id, 'EMAIL_VERIFICATION');
      await sendRegistrationOTPEmail(user.email, otp);

      return res.status(200).json({
        status: 'success',
        emailVerified: false,
        message: 'Your email is not verified yet. A verification code has been sent to your email.',
      });
    }

    // 5. Check if there is an active trusted session for this device
    const activeTrustedSession = await Session.findOne({
      userId: user._id,
      deviceId,
      isTrusted: true,
      expiresAt: { $gt: new Date() },
    });

    if (activeTrustedSession) {
      // Bypassing OTP
      user.lastLogin = Date.now();
      await user.save();

      // Log success login
      await LoginActivity.create({
        userId: user._id,
        browser,
        os: operatingSystem,
        ipAddress,
        status: 'success',
      });

      // Renew/Extend the session details
      activeTrustedSession.browser = browser;
      activeTrustedSession.operatingSystem = operatingSystem;
      activeTrustedSession.ipAddress = ipAddress;
      activeTrustedSession.userAgent = userAgent;
      activeTrustedSession.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days renewal

      await sendTokenResponse(user, activeTrustedSession, 200, res);
    } else {
      // Send login OTP
      const otp = await createOTP(user._id, 'LOGIN');
      await sendLoginOTPEmail(user.email, otp);

      res.status(200).json({
        status: 'success',
        emailVerified: true,
        otpRequired: true,
        message: 'A 2-factor verification code has been sent to your email.',
      });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Verify Login OTP and issue JWT + Refresh Token
 */
export const verifyLoginOtp = async (req, res, next) => {
  try {
    const { email, otp, deviceId, deviceName, trustDevice } = req.body;

    if (!deviceId) {
      return next(new AppError('Device ID is required to verify OTP.', 400));
    }

    const user = await User.findOne({ email });
    const userAgent = req.headers['user-agent'] || '';
    const { browser, operatingSystem } = parseUserAgent(userAgent);
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

    if (!user) {
      return next(new AppError('Invalid email or verification code.', 401));
    }

    // Verify OTP (allow 111111 only in development mode)
    try {
      const isDevBypass = process.env.NODE_ENV === 'development' && otp === '111111';
      if (!isDevBypass) {
        await verifyOTP(user._id, 'LOGIN', otp);
      }
    } catch (otpErr) {
      await SecurityLog.create({
        userId: user._id,
        action: 'otp_failed',
        ipAddress,
        userAgent,
      });
      return next(otpErr);
    }

    // Save last login time
    user.lastLogin = Date.now();
    await user.save();

    // Create or update device session
    const sessionLifetimeDays = trustDevice ? 30 : 1; // 30 days if trusted, 1 day if temporary
    const expiresAt = new Date(Date.now() + sessionLifetimeDays * 24 * 60 * 60 * 1000);

    let session = await Session.findOne({ userId: user._id, deviceId });
    if (session) {
      session.deviceName = deviceName || session.deviceName || 'Unknown Device';
      session.browser = browser;
      session.operatingSystem = operatingSystem;
      session.ipAddress = ipAddress;
      session.userAgent = userAgent;
      session.isTrusted = trustDevice;
      session.expiresAt = expiresAt;
    } else {
      session = new Session({
        userId: user._id,
        deviceId,
        deviceName: deviceName || 'Unknown Device',
        browser,
        operatingSystem,
        ipAddress,
        userAgent,
        isTrusted: trustDevice,
        expiresAt,
        refreshTokenHash: 'temporary', // replaced in sendTokenResponse
      });
    }

    // Log success login
    await LoginActivity.create({
      userId: user._id,
      browser,
      os: operatingSystem,
      ipAddress,
      status: 'success',
    });

    if (trustDevice) {
      await SecurityLog.create({
        userId: user._id,
        action: 'device_trusted',
        ipAddress,
        userAgent,
      });
    }

    await sendTokenResponse(user, session, 200, res);
  } catch (err) {
    next(err);
  }
};

/**
 * Resend login or registration OTP
 */
export const resendLoginOtp = async (req, res, next) => {
  try {
    const { email, purpose } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    // Check cooldown (60 seconds)
    const lastOtp = await OTP.findOne({ userId: user._id, purpose }).sort({ createdAt: -1 });
    if (lastOtp && (Date.now() - lastOtp.createdAt.getTime() < 60000)) {
      const secondsLeft = Math.ceil((60000 - (Date.now() - lastOtp.createdAt.getTime())) / 1000);
      return next(new AppError(`Please wait ${secondsLeft} seconds before requesting a new code.`, 429));
    }

    // Generate new OTP
    const otp = await createOTP(user._id, purpose);

    // Send email according to purpose
    if (purpose === 'LOGIN') {
      await sendLoginOTPEmail(user.email, otp);
    } else if (purpose === 'EMAIL_VERIFICATION') {
      await sendRegistrationOTPEmail(user.email, otp);
    } else if (purpose === 'PASSWORD_RESET') {
      await sendForgotPasswordOTPEmail(user.email, otp);
    }

    res.status(200).json({
      status: 'success',
      message: 'A new verification code has been sent to your email.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Refresh JWT Token with Rotation
 */
export const refreshToken = async (req, res, next) => {
  try {
    let rawRefreshToken = req.cookies.refreshToken;
    if (!rawRefreshToken && req.headers['x-refresh-token']) {
      rawRefreshToken = req.headers['x-refresh-token'];
    }

    if (!rawRefreshToken) {
      return next(new AppError('No refresh token provided. Please log in again.', 401));
    }

    // Hash the token to look up in the database
    const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

    const session = await Session.findOne({
      refreshTokenHash: tokenHash,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      return next(new AppError('Invalid or expired refresh session. Please log in again.', 401));
    }

    const user = await User.findById(session.userId);
    if (!user) {
      return next(new AppError('The user belonging to this session no longer exists.', 401));
    }

    if (user.status === 'blocked') {
      return next(new AppError('Your account has been blocked. Please contact support.', 403));
    }

    // Update IP, UA and refresh token (Token Rotation)
    const userAgent = req.headers['user-agent'] || '';
    const { browser, operatingSystem } = parseUserAgent(userAgent);
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

    session.browser = browser;
    session.operatingSystem = operatingSystem;
    session.ipAddress = ipAddress;
    session.userAgent = userAgent;

    // Rotate tokens
    await sendTokenResponse(user, session, 200, res);
  } catch (err) {
    next(err);
  }
};

/**
 * Forgot password (step 1: send reset OTP)
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (user) {
      const otp = await createOTP(user._id, 'PASSWORD_RESET');
      await sendForgotPasswordOTPEmail(user.email, otp);
    }

    res.status(200).json({
      status: 'success',
      message: 'If the email exists in our system, a password reset code has been sent.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Verify reset password OTP and return a temporary reset token
 */
export const verifyResetOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('Invalid email or verification code.', 400));
    }

    // Verify OTP
    await verifyOTP(user._id, 'PASSWORD_RESET', otp);

    // Generate a short-lived password reset token (valid for 5 minutes)
    const resetToken = jwt.sign(
      { id: user._id, purpose: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );

    res.status(200).json({
      status: 'success',
      token: resetToken,
      message: 'Verification code accepted. You can now reset your password.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Reset password using the temporary reset token
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { email, token, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    // Verify the reset token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      return next(new AppError('Your reset session has expired. Please request a new code.', 400));
    }

    if (decoded.id !== user._id.toString() || decoded.purpose !== 'password_reset') {
      return next(new AppError('Invalid reset token.', 400));
    }

    // Update password (pre-save hook will hash it and delete all sessions automatically)
    user.password = password;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    // Send confirmation email
    await sendPasswordChangedEmail(user.email);

    res.status(200).json({
      status: 'success',
      message: 'Your password has been reset successfully. You can now log in.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Logout user
 */
export const logout = async (req, res, next) => {
  try {
    let rawRefreshToken = req.cookies.refreshToken;
    if (!rawRefreshToken && req.headers['x-refresh-token']) {
      rawRefreshToken = req.headers['x-refresh-token'];
    }

    if (rawRefreshToken) {
      const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
      const session = await Session.findOne({ refreshTokenHash: tokenHash });

      if (session) {
        // Disconnect sockets for this user
        try {
          const io = (await import('../services/socket.service.js')).getIO();
          io.to(session.userId.toString()).disconnectSockets(true);
        } catch (socketErr) {
          console.warn('Failed to disconnect user sockets:', socketErr.message);
        }

        // Delete the session
        await Session.deleteOne({ _id: session._id });

        // Log security event
        await SecurityLog.create({
          userId: session.userId,
          action: 'logout',
          ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
          userAgent: req.headers['user-agent'] || '',
        });
      }
    }

    // Clear cookies
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Logout user from all devices
 */
export const logoutAll = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Disconnect user sockets
    try {
      const io = (await import('../services/socket.service.js')).getIO();
      io.to(userId.toString()).disconnectSockets(true);
    } catch (socketErr) {
      console.warn('Failed to disconnect user sockets:', socketErr.message);
    }

    // Delete all sessions for the user
    await Session.deleteMany({ userId });

    // Log security event
    await SecurityLog.create({
      userId,
      action: 'logout_all_devices',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      userAgent: req.headers['user-agent'] || '',
    });

    // Clear cookies
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({
      status: 'success',
      message: 'Logged out of all devices successfully.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Google Sign-In / Sign-Up
 */
export const googleLogin = async (req, res, next) => {
  try {
    const { idToken, deviceId, deviceName } = req.body;
    if (!idToken) {
      return next(new AppError('Google ID Token is required.', 400));
    }

    // 1. Verify token with Google using built-in fetch
    const googleVerifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`;
    const response = await fetch(googleVerifyUrl);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google tokeninfo verification failed:', errorText);
      return next(new AppError('Failed to verify Google token.', 401));
    }
    
    const payload = await response.json();

    // Verify client ID matches
    const expectedClientId = process.env.GOOGLE_CLIENT_ID;
    if (!expectedClientId) {
      return next(new AppError('Google authentication is not configured on this server.', 503));
    }
    if (payload.aud !== expectedClientId) {
      return next(new AppError('Invalid Google Client ID aud.', 400));
    }

    const { email, name, picture, sub, email_verified } = payload;
    if (!email_verified) {
      return next(new AppError('Google email is not verified.', 400));
    }

    // 2. Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = crypto.randomBytes(16).toString('hex') + 'Aa1!';
      user = await User.create({
        fullName: name,
        email,
        password: randomPassword,
        googleId: sub,
        profilePhoto: picture || '',
        emailVerified: true,
        isVerified: true,
        status: 'active',
      });
    } else {
      let updated = false;
      if (!user.googleId) {
        user.googleId = sub;
        updated = true;
      }
      if (!user.emailVerified) {
        user.emailVerified = true;
        user.isVerified = true;
        user.status = 'active';
        updated = true;
      }
      if (picture && !user.profilePhoto) {
        user.profilePhoto = picture;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    }

    // 3. Issue JWT directly (bypassing OTP since Google is verified)
    user.lastLogin = Date.now();
    await user.save();

    // Create session for Google Login
    const clientDeviceId = deviceId || (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2));
    const clientDeviceName = deviceName || 'Google Auth Device';
    const userAgent = req.headers['user-agent'] || '';
    const { browser, operatingSystem } = parseUserAgent(userAgent);
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days trusted by default
    
    let session = await Session.findOne({ userId: user._id, deviceId: clientDeviceId });
    if (session) {
      session.browser = browser;
      session.operatingSystem = operatingSystem;
      session.ipAddress = ipAddress;
      session.userAgent = userAgent;
      session.isTrusted = true;
      session.expiresAt = expiresAt;
    } else {
      session = new Session({
        userId: user._id,
        deviceId: clientDeviceId,
        deviceName: clientDeviceName,
        browser,
        operatingSystem,
        ipAddress,
        userAgent,
        isTrusted: true,
        expiresAt,
        refreshTokenHash: 'temporary',
      });
    }

    // Log success login activity
    await LoginActivity.create({
      userId: user._id,
      browser,
      os: operatingSystem,
      ipAddress,
      status: 'success',
    });

    await sendTokenResponse(user, session, 200, res);
  } catch (err) {
    console.error('Google Auth Error:', err.message);
    return next(new AppError('Failed to authenticate with Google.', 401));
  }
};

/**
 * Get current logged in user details
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get active/trusted devices
 */
export const getTrustedDevices = async (req, res, next) => {
  try {
    const sessions = await Session.find({ userId: req.user._id }).sort({ lastActiveAt: -1 });

    // Get current refresh token to flag current session
    let rawRefreshToken = req.cookies.refreshToken;
    if (!rawRefreshToken && req.headers['x-refresh-token']) {
      rawRefreshToken = req.headers['x-refresh-token'];
    }
    const currentHash = rawRefreshToken
      ? crypto.createHash('sha256').update(rawRefreshToken).digest('hex')
      : null;

    const devices = sessions.map((session) => ({
      _id: session._id,
      deviceId: session.deviceId,
      deviceName: session.deviceName,
      browser: session.browser,
      os: session.operatingSystem,
      ipAddress: session.ipAddress,
      isTrusted: session.isTrusted,
      createdAt: session.createdAt,
      lastActive: session.lastActiveAt,
      isCurrent: currentHash ? session.refreshTokenHash === currentHash : false,
    }));

    res.status(200).json({
      status: 'success',
      sessions: devices, // for frontend SecuritySettings backwards compatibility
      devices,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Revoke device session
 */
export const revokeTrustedDevice = async (req, res, next) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) {
      return next(new AppError('Device session not found.', 404));
    }

    // Check if current session
    let rawRefreshToken = req.cookies.refreshToken;
    if (!rawRefreshToken && req.headers['x-refresh-token']) {
      rawRefreshToken = req.headers['x-refresh-token'];
    }
    const currentHash = rawRefreshToken
      ? crypto.createHash('sha256').update(rawRefreshToken).digest('hex')
      : null;
    const isCurrent = currentHash && session.refreshTokenHash === currentHash;

    if (isCurrent) {
      try {
        const io = (await import('../services/socket.service.js')).getIO();
        io.to(req.user._id.toString()).disconnectSockets(true);
      } catch (socketErr) {
        console.warn('Failed to disconnect user sockets:', socketErr.message);
      }
    }

    await Session.deleteOne({ _id: session._id });

    // Log security event
    await SecurityLog.create({
      userId: req.user._id,
      action: `device_revoked_${session.deviceId}`,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      userAgent: req.headers['user-agent'] || '',
    });

    if (isCurrent) {
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Device session revoked successfully.',
      isCurrent,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Rename device session
 */
export const renameTrustedDevice = async (req, res, next) => {
  try {
    const { deviceName } = req.body;
    if (!deviceName || deviceName.trim() === '') {
      return next(new AppError('Device name is required.', 400));
    }

    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { deviceName: deviceName.trim() },
      { new: true }
    );

    if (!session) {
      return next(new AppError('Device session not found.', 404));
    }

    res.status(200).json({
      status: 'success',
      message: 'Device renamed successfully.',
      session,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Login Activity Log list
 */
export const getLoginActivity = async (req, res, next) => {
  try {
    const activity = await LoginActivity.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      status: 'success',
      activity,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Security Events Log list
 */
export const getSecurityLogs = async (req, res, next) => {
  try {
    const logs = await SecurityLog.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      status: 'success',
      logs,
    });
  } catch (err) {
    next(err);
  }
};
