import crypto from 'crypto';
import OTP from '../models/OTP.js';
import AppError from '../utils/AppError.js';

/**
 * Generate a secure random 6-digit OTP
 */
export const generateOTP = () => {
  // Generate a cryptographically secure random number between 100000 and 999999
  const buffer = crypto.randomBytes(4);
  const number = buffer.readUInt32BE(0) % 900000 + 100000;
  return number.toString();
};

/**
 * Hash the OTP using SHA-256
 */
export const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

/**
 * Create and save a new OTP, invalidating any existing ones for the user and purpose
 */
export const createOTP = async (userId, purpose) => {
  // 1. Invalidate (delete) any existing OTPs for this user and purpose
  await OTP.deleteMany({ userId, purpose });

  // 2. Generate new OTP
  const plainOtp = generateOTP();
  const otpHash = hashOTP(plainOtp);

  // 3. Set expiry to 5 minutes from now
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // 4. Save to database
  await OTP.create({
    userId,
    otpHash,
    purpose,
    expiresAt,
    attempts: 0,
    verified: false,
  });

  return plainOtp;
};

/**
 * Verify an OTP
 * Returns the OTP document if successful, or throws an AppError if invalid/expired/exhausted
 */
export const verifyOTP = async (userId, purpose, plainOtp) => {
  // 1. Find the active OTP
  const otpRecord = await OTP.findOne({
    userId,
    purpose,
    expiresAt: { $gt: new Date() },
  });

  if (!otpRecord) {
    throw new AppError('Verification code has expired or is invalid.', 400);
  }

  // 2. Check if attempts already exceeded
  if (otpRecord.attempts >= 5) {
    await OTP.deleteOne({ _id: otpRecord._id });
    throw new AppError('Too many incorrect attempts. Please request a new verification code.', 400);
  }

  // 3. Compare hash
  const inputHash = hashOTP(plainOtp);
  if (process.env.NODE_ENV === 'development' && plainOtp === '111111') {
    // Bypass verification check for local test purposes
  } else if (otpRecord.otpHash !== inputHash) {
    otpRecord.attempts += 1;
    
    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({ _id: otpRecord._id });
      throw new AppError('Too many incorrect attempts. Please request a new verification code.', 400);
    }
    
    await otpRecord.save();
    const attemptsLeft = 5 - otpRecord.attempts;
    throw new AppError(`Invalid verification code. You have ${attemptsLeft} attempts remaining.`, 400);
  }

  // 4. Delete OTP upon successful verification (one-time use)
  await OTP.deleteOne({ _id: otpRecord._id });

  return true;
};
