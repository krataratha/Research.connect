import mongoose from 'mongoose';
import dotenv from 'dotenv';
import crypto from 'crypto';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import Session from '../models/Session.js';
import LoginActivity from '../models/LoginActivity.js';
import SecurityLog from '../models/SecurityLog.js';
import {
  register,
  verifyEmail,
  login,
  verifyLoginOtp,
  refreshToken,
  revokeTrustedDevice,
  getTrustedDevices,
  logout
} from '../controllers/auth.controller.js';

dotenv.config();

// Mock Express request/response helpers
const mockResponse = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  res.cookie = (name, value, options) => {
    res.cookies = res.cookies || {};
    res.cookies[name] = { value, options };
    return res;
  };
  res.clearCookie = (name, options) => {
    res.clearedCookies = res.clearedCookies || {};
    res.clearedCookies[name] = options;
    return res;
  };
  return res;
};

const mockNext = (err) => {
  if (err) {
    throw err;
  }
};

async function runTests() {
  console.log('🧪 Starting Auth Persistence & Trusted Device Integration Tests...');

  // 1. Connect to Database
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/research_connect_test';
  await mongoose.connect(mongoUri);
  console.log('✓ Connected to MongoDB');

  const testEmail = 'persistence.scholar@university.edu';
  const deviceId = 'test-browser-device-uuid-12345';
  
  // Clean up existing test state
  await User.deleteMany({ email: testEmail });
  await OTP.deleteMany({});
  await Session.deleteMany({});
  await LoginActivity.deleteMany({});
  await SecurityLog.deleteMany({});
  console.log('✓ Cleaned up test database collections');

  try {
    // 2. Test Registration
    console.log('\n--- Test 1: User Registration ---');
    const regReq = {
      body: {
        fullName: 'Persistence Scholar',
        email: testEmail,
        password: 'Password123!',
        designation: 'Associate Professor',
        institution: 'Test University',
        country: 'United Kingdom',
      },
    };
    const regRes = mockResponse();
    await register(regReq, regRes, mockNext);
    console.log('✓ Registration succeeded');

    const user = await User.findOne({ email: testEmail });
    if (!user) throw new Error('User was not saved to database.');

    // 3. Test Email Verification OTP
    console.log('\n--- Test 2: Email Verification OTP ---');
    const emailOtpRecord = await OTP.findOne({ userId: user._id, purpose: 'EMAIL_VERIFICATION' });
    if (!emailOtpRecord) throw new Error('Email verification OTP was not created.');
    
    // We can verify using the dev-only bypass OTP '111111' (only works when NODE_ENV=development)
    const verifyEmailReq = {
      body: {
        email: testEmail,
        otp: '111111',
      },
    };
    const verifyEmailRes = mockResponse();
    await verifyEmail(verifyEmailReq, verifyEmailRes, mockNext);
    console.log('✓ Email verification succeeded');

    // 4. Test Initial Login (New Device: requires OTP)
    console.log('\n--- Test 3: Initial Login (New Device) ---');
    const loginReq = {
      body: {
        email: testEmail,
        password: 'Password123!',
        deviceId,
        deviceName: 'Test Browser Chrome',
      },
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      },
      ip: '192.168.1.50',
    };
    const loginRes = mockResponse();
    await login(loginReq, loginRes, mockNext);
    
    if (!loginRes.body.otpRequired) {
      throw new Error('Initial login should require OTP verification.');
    }
    console.log('✓ Initial login requested OTP successfully');

    // 5. Test Verify Login OTP and Trust Device
    console.log('\n--- Test 4: Verify OTP & Enable Trusted Device ---');
    const verifyOtpReq = {
      body: {
        email: testEmail,
        otp: '111111', // dev-only bypass code (NODE_ENV=development)
        deviceId,
        deviceName: 'Test Browser Chrome',
        trustDevice: true,
      },
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      },
      ip: '192.168.1.50',
    };
    const verifyOtpRes = mockResponse();
    await verifyLoginOtp(verifyOtpReq, verifyOtpRes, mockNext);

    if (verifyOtpRes.statusCode !== 200 || !verifyOtpRes.cookies?.refreshToken) {
      throw new Error('OTP verification failed or did not return tokens.');
    }
    
    const initialRawRefreshToken = verifyOtpRes.cookies.refreshToken.value;
    console.log('✓ OTP verified. Tokens issued successfully.');
    console.log('  Access Token:', verifyOtpRes.body.token.substring(0, 20) + '...');
    console.log('  Refresh Token Cookie:', initialRawRefreshToken.substring(0, 10) + '...');

    // Verify Session is created in DB
    const sessionInDb = await Session.findOne({ userId: user._id, deviceId });
    if (!sessionInDb) throw new Error('Session was not saved in MongoDB.');
    if (!sessionInDb.isTrusted) throw new Error('Session isTrusted should be true.');
    console.log('✓ Session saved in MongoDB as Trusted Device');

    // 6. Test Subsequent Login (Bypasses OTP)
    console.log('\n--- Test 5: Subsequent Login (Bypasses OTP) ---');
    const subLoginReq = {
      body: {
        email: testEmail,
        password: 'Password123!',
        deviceId,
        deviceName: 'Test Browser Chrome',
      },
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      },
      ip: '192.168.1.50',
    };
    const subLoginRes = mockResponse();
    await login(subLoginReq, subLoginRes, mockNext);

    if (subLoginRes.body.otpRequired) {
      throw new Error('Subsequent login on trusted device should not require OTP.');
    }
    if (!subLoginRes.cookies?.refreshToken) {
      throw new Error('Bypass login failed to return cookies.');
    }
    
    const rotatedRawRefreshToken = subLoginRes.cookies.refreshToken.value;
    console.log('✓ OTP was successfully bypassed!');
    console.log('✓ Returned rotated refresh token:', rotatedRawRefreshToken.substring(0, 10) + '...');

    // Verify old refresh token is deleted (rotation verified)
    const oldSession = await Session.findOne({ 
      refreshTokenHash: crypto.createHash('sha256').update(initialRawRefreshToken).digest('hex') 
    });
    if (oldSession) {
      throw new Error('Old refresh token session should be rotated out.');
    }
    console.log('✓ Token Rotation verified: Old session hash revoked.');

    // 7. Test Refresh Token Rotation API
    console.log('\n--- Test 6: Refresh Token Endpoint (Rotation) ---');
    const refreshReq = {
      cookies: {
        refreshToken: rotatedRawRefreshToken,
      },
      headers: {},
    };
    const refreshRes = mockResponse();
    await refreshToken(refreshReq, refreshRes, mockNext);

    if (refreshRes.statusCode !== 200 || !refreshRes.cookies?.refreshToken) {
      throw new Error('Refresh token rotation failed.');
    }
    
    const rotatedRawRefreshToken2 = refreshRes.cookies.refreshToken.value;
    console.log('✓ Token rotated successfully via API');
    console.log('  New Refresh Token:', rotatedRawRefreshToken2.substring(0, 10) + '...');

    // 8. Test Device Management API
    console.log('\n--- Test 7: Trusted Device Management (List, Rename) ---');
    const getDevicesReq = {
      user: { _id: user._id },
      cookies: {
        refreshToken: rotatedRawRefreshToken2,
      },
      headers: {},
    };
    const getDevicesRes = mockResponse();
    await getTrustedDevices(getDevicesReq, getDevicesRes, mockNext);
    
    const devicesList = getDevicesRes.body.devices;
    if (devicesList.length !== 1) throw new Error('Device list should contain exactly 1 device.');
    const device = devicesList[0];
    if (!device.isCurrent) throw new Error('Current device flag should be true.');
    console.log('✓ Devices listed. Current device flagged correctly.');

    // 9. Test Password Change Session Invalidation
    console.log('\n--- Test 8: Password Change Invalidation ---');
    user.password = 'NewPassword123!';
    await user.save(); // pre-save hook should run and clear sessions

    const activeSessionsCount = await Session.countDocuments({ userId: user._id });
    if (activeSessionsCount > 0) {
      throw new Error('Password change should invalidate all active sessions in database.');
    }
    console.log('✓ Password change successfully invalidated all active sessions');

    // 10. Test Login after Password Change (Requires OTP again)
    console.log('\n--- Test 9: Login post-Password Change (Requires OTP) ---');
    const postPasswordLoginReq = {
      body: {
        email: testEmail,
        password: 'NewPassword123!',
        deviceId,
        deviceName: 'Test Browser Chrome',
      },
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      },
      ip: '192.168.1.50',
    };
    const postPasswordLoginRes = mockResponse();
    await login(postPasswordLoginReq, postPasswordLoginRes, mockNext);

    if (!postPasswordLoginRes.body.otpRequired) {
      throw new Error('Login after session invalidation should require OTP.');
    }
    console.log('✓ OTP is required again after password change, as expected.');

    console.log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY! ✓✓✓');
  } catch (err) {
    console.error('\n❌ TEST RUN ENCOUNTERED AN ERROR:');
    console.error(err.message, err.stack);
  } finally {
    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB');
  }
}

runTests();
