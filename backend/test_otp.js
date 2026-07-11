const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const EmailOtp = require('./src/models/EmailOtp');

async function testOtp() {
  await mongoose.connect('mongodb://researchconnectdb:researchconnectdb@ac-qpuswwn-shard-00-00.0x5pbm5.mongodb.net:27017,ac-qpuswwn-shard-00-01.0x5pbm5.mongodb.net:27017,ac-qpuswwn-shard-00-02.0x5pbm5.mongodb.net:27017/research_connect?ssl=true&replicaSet=atlas-t9ah7c-shard-0&authSource=admin');
  
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  console.log("Generated OTP:", otpCode);
  
  const otpSalt = await bcrypt.genSalt(10);
  const hashedOtp = await bcrypt.hash(otpCode, otpSalt);
  
  const record = await EmailOtp.create({
    email: 'test@example.com',
    otp: hashedOtp,
    purpose: 'registration',
    expiresAt: new Date(Date.now() + 100000)
  });
  
  const fetched = await EmailOtp.findOne({ email: 'test@example.com', purpose: 'registration' }).sort({ createdAt: -1 });
  console.log("Fetched Hash:", fetched.otp);
  
  const isMatch = await bcrypt.compare(otpCode, fetched.otp);
  console.log("Is Match:", isMatch);
  
  process.exit(0);
}
testOtp().catch(console.error);
