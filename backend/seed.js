require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/modules/authentication/models/user.model');
const Profile = require('./src/modules/profile/models/profile.model');

async function seed() {
  try {
    await mongoose.connect('mongodb://researchconnectdb:researchconnectdb@ac-qpuswwn-shard-00-00.0x5pbm5.mongodb.net:27017,ac-qpuswwn-shard-00-01.0x5pbm5.mongodb.net:27017,ac-qpuswwn-shard-00-02.0x5pbm5.mongodb.net:27017/research_connect?ssl=true&replicaSet=atlas-t9ah7c-shard-0&authSource=admin');
    
    // Create test user
    const existing = await User.findOne({ email: 'test@researchconnect.com' });
    if (existing) {
      console.log('Test user already exists:', existing._id);
      process.exit(0);
    }

    const testUser = await User.create({
      firstName: 'Sarah',
      lastName: 'Jenkins',
      email: 'test@researchconnect.com',
      password: 'Password123!',
      isEmailVerified: true,
      role: 'user'
    });

    await Profile.create({
      user: testUser._id,
      headline: 'AI Researcher at DeepMind',
      about: 'I love testing messaging systems!',
      department: 'Computer Science',
      institution: 'DeepMind'
    });

    console.log('Successfully created test user: Sarah Jenkins (test@researchconnect.com / Password123!)');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
