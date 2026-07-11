require('dotenv').config();
const mongoose = require('mongoose');
const Conversation = require('./src/models/Conversation');
const User = require('./src/models/User');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");
  
  const convs = await Conversation.find({}).populate('participants', 'firstName lastName profileImage username').lean();
  console.log(JSON.stringify(convs, null, 2));
  process.exit(0);
}
test().catch(console.error);
