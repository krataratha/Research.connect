import './config/env.js';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import OTP from './models/OTP.js';

async function run() {
  try {
    await connectDB();
    const record = await OTP.findOne({ email: 'test.researcher@example.com' });
    console.log('RESULT_OTP:' + (record ? record.otp : 'NOT_FOUND'));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}
run();
