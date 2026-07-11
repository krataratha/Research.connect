const axios = require('axios');
const mongoose = require('mongoose');

async function testApi() {
  await mongoose.connect('mongodb://researchconnectdb:researchconnectdb@ac-qpuswwn-shard-00-00.0x5pbm5.mongodb.net:27017,ac-qpuswwn-shard-00-01.0x5pbm5.mongodb.net:27017,ac-qpuswwn-shard-00-02.0x5pbm5.mongodb.net:27017/research_connect?ssl=true&replicaSet=atlas-t9ah7c-shard-0&authSource=admin');
  const EmailOtp = require('./src/models/EmailOtp');

  const testEmail = 'api-test-user@test.com';

  console.log("Registering user via API...");
  try {
    const regRes = await axios.post('http://localhost:5000/api/v1/auth/register', {
      firstName: 'Api',
      lastName: 'Test',
      email: testEmail,
      password: 'password123',
      confirmPassword: 'password123',
      country: 'US',
      researcherType: 'non_researcher',
      organization: 'Self',
      occupation: 'Tester',
      interest: 'Testing',
      acceptTerms: true,
      acceptPrivacy: true
    });
    console.log("Register Res:", regRes.data);
  } catch (err) {
    console.log("Register Error:", err.response?.data || err.message);
    if (err.response?.data?.message !== 'Email is already registered') {
      process.exit(1);
    }
  }

  console.log("Fetching OTP from DB...");
  const otpRecord = await EmailOtp.findOne({ email: testEmail, purpose: 'registration' }).sort({ createdAt: -1 });
  console.log("DB OTP Hash:", otpRecord ? otpRecord.otp : 'Not Found');
  
  if (!otpRecord) process.exit(1);

  // We can't unhash it, but wait, the OTP is printed in the terminal...
  // Wait, I can't read the terminal from here. But wait, I can just generate an OTP and mock it?
  // No, I can't unhash it.
}

testApi().catch(console.error);
