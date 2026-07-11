import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import { createOTP, verifyOTP } from '../services/otp.service.js';
import { register, login, verifyEmail, verifyLoginOtp, resendLoginOtp, forgotPassword, verifyResetOtp, resetPassword } from '../controllers/auth.controller.js';

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
  console.log('🧪 Starting Auth & OTP System Integration Tests...');

  // 1. Connect to Database
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/research_connect_test';
  await mongoose.connect(mongoUri);
  console.log('✓ Connected to MongoDB');

  // Clear existing test users
  const testEmail = 'test.scholar@university.edu';
  await User.deleteMany({ email: testEmail });
  await OTP.deleteMany({});
  console.log('✓ Cleaned up test database');

  try {
    // 2. Test Registration
    console.log('\n--- Test 1: User Registration ---');
    const regReq = {
      body: {
        fullName: 'Test Scholar',
        email: testEmail,
        password: 'Password123!',
        designation: 'Associate Professor',
        institution: 'Test University',
        country: 'United Kingdom',
      },
    };
    const regRes = mockResponse();
    await register(regReq, regRes, mockNext);
    
    console.log('Registration Status:', regRes.statusCode);
    console.log('Registration Response:', regRes.body);
    
    const user = await User.findOne({ email: testEmail });
    if (!user) throw new Error('User was not saved to database.');
    if (user.emailVerified) throw new Error('User email should not be verified yet.');
    console.log('✓ User created successfully in pending_verification state');

    // 3. Test Email Verification OTP
    console.log('\n--- Test 2: Email Verification OTP ---');
    const emailOtpRecord = await OTP.findOne({ userId: user._id, purpose: 'EMAIL_VERIFICATION' });
    if (!emailOtpRecord) throw new Error('Email verification OTP was not created.');
    console.log('Generated OTP Record found in DB');

    // We need to retrieve the actual plain text OTP. Since we hashed it, we can bypass or query it,
    // but wait: for testing, let's look at the console log output or we can just mock a verification.
    // In our test, since we have the db record, we can verify it by finding the OTP from the service.
    // Let's verify using the controller verifyEmail. But wait, how do we know the plain OTP?
    // Let's make a test-only route or let's create a temporary OTP using our service so we know the plain text!
    const plainEmailOtp = await createOTP(user._id, 'EMAIL_VERIFICATION');
    console.log(`Created known OTP for testing: ${plainEmailOtp}`);

    const verifyReq = {
      body: {
        email: testEmail,
        otp: plainEmailOtp,
      },
    };
    const verifyRes = mockResponse();
    await verifyEmail(verifyReq, verifyRes, mockNext);
    console.log('Email Verification Status:', verifyRes.statusCode);
    console.log('Email Verification Response:', verifyRes.body);

    const verifiedUser = await User.findOne({ email: testEmail });
    if (!verifiedUser.emailVerified) throw new Error('User emailVerified was not set to true.');
    if (verifiedUser.status !== 'active') throw new Error('User status was not set to active.');
    console.log('✓ Email verified and account activated successfully');

    // 4. Test Login Credentials Step
    console.log('\n--- Test 3: Login (Step 1 - Credentials) ---');
    const loginReq = {
      body: {
        email: testEmail,
        password: 'Password123!',
      },
    };
    const loginRes = mockResponse();
    await login(loginReq, loginRes, mockNext);
    console.log('Login Step 1 Status:', loginRes.statusCode);
    console.log('Login Step 1 Response:', loginRes.body);
    if (!loginRes.body.otpRequired) throw new Error('Login should require OTP for verified users.');
    console.log('✓ Credentials verified, Login OTP requested');

    // 5. Test Login OTP Step (2FA)
    console.log('\n--- Test 4: Login (Step 2 - OTP Verification) ---');
    const plainLoginOtp = await createOTP(user._id, 'LOGIN');
    console.log(`Created known Login OTP: ${plainLoginOtp}`);

    const verifyLoginReq = {
      body: {
        email: testEmail,
        otp: plainLoginOtp,
      },
    };
    const verifyLoginRes = mockResponse();
    await verifyLoginOtp(verifyLoginReq, verifyLoginRes, mockNext);
    console.log('Login Step 2 Status:', verifyLoginRes.statusCode);
    console.log('Login Step 2 JWT Token Issued:', !!verifyLoginRes.body.token);
    console.log('Login Step 2 Cookies Set:', Object.keys(verifyLoginRes.cookies || {}));
    if (!verifyLoginRes.body.token) throw new Error('JWT Access Token was not issued.');
    console.log('✓ Login successful, JWT token and cookies issued');

    // 6. Test Account Lockout
    console.log('\n--- Test 5: Account Lockout after 5 Failed Attempts ---');
    // We will attempt to login with an incorrect password 5 times
    const badLoginReq = {
      body: {
        email: testEmail,
        password: 'WrongPassword!',
      },
    };

    let lockedOut = false;
    for (let i = 1; i <= 6; i++) {
      const badLoginRes = mockResponse();
      try {
        await login(badLoginReq, badLoginRes, (err) => {
          if (err && err.message.includes('locked')) {
            lockedOut = true;
            console.log(`Attempt ${i}: Successfully locked out with message: "${err.message}"`);
          } else if (err) {
            console.log(`Attempt ${i}: Failed as expected: "${err.message}"`);
          }
        });
      } catch (err) {
        if (err.message.includes('locked')) {
          lockedOut = true;
          console.log(`Attempt ${i}: Successfully locked out with message: "${err.message}"`);
        }
      }
    }
    if (!lockedOut) throw new Error('Account was not locked out after 5 failed attempts.');
    console.log('✓ Account lockout verified');

    // Reset lockout for next tests
    const userToReset = await User.findOne({ email: testEmail });
    userToReset.loginAttempts = 0;
    userToReset.lockUntil = undefined;
    await userToReset.save();
    console.log('✓ Lockout reset for testing forgot password');

    // 7. Test Forgot Password & Reset
    console.log('\n--- Test 6: Forgot Password & Reset Flow ---');
    const forgotReq = {
      body: { email: testEmail },
    };
    const forgotRes = mockResponse();
    await forgotPassword(forgotReq, forgotRes, mockNext);
    console.log('Forgot Password Status:', forgotRes.statusCode);

    const plainResetOtp = await createOTP(user._id, 'PASSWORD_RESET');
    console.log(`Created known Reset OTP: ${plainResetOtp}`);

    // Verify reset OTP to get temporary reset token
    const verifyResetReq = {
      body: {
        email: testEmail,
        otp: plainResetOtp,
      },
    };
    const verifyResetRes = mockResponse();
    await verifyResetOtp(verifyResetReq, verifyResetRes, mockNext);
    console.log('Verify Reset OTP Status:', verifyResetRes.statusCode);
    const resetToken = verifyResetRes.body.token;
    console.log('Temporary Reset Token Issued:', !!resetToken);
    if (!resetToken) throw new Error('Reset token was not issued.');

    // Perform password reset using token
    const resetReq = {
      body: {
        email: testEmail,
        token: resetToken,
        password: 'NewPassword123!',
      },
    };
    const resetRes = mockResponse();
    await resetPassword(resetReq, resetRes, mockNext);
    console.log('Reset Password Status:', resetRes.statusCode);
    console.log('Reset Password Response:', resetRes.body);

    // Verify new password works
    const newLoginReq = {
      body: {
        email: testEmail,
        password: 'NewPassword123!',
      },
    };
    const newLoginRes = mockResponse();
    await login(newLoginReq, newLoginRes, mockNext);
    console.log('New Password Login Status:', newLoginRes.statusCode);
    if (!newLoginRes.body.otpRequired) throw new Error('Login with new password failed.');
    console.log('✓ Password reset and login with new password verified');

    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉');

  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    console.error(err.stack);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

runTests();
