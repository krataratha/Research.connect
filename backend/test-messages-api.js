require('dotenv').config();
const mongoose = require('mongoose');

// Require all models first so they are registered in Mongoose
require('./src/models/User');
require('./src/models/Profile');
require('./src/models/Conversation');
require('./src/models/Message');
require('./src/models/MessageAttachment');
require('./src/models/MessageReaction');
require('./src/models/PinnedChat');
require('./src/models/ArchivedChat');

const messageRepository = require('./src/modules/messages/repository/message.repository');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  const userId = "6a47c8bf5930ec6be9cbcb89";
  const convs = await messageRepository.getUserConversations(userId);
  console.log(JSON.stringify(convs, null, 2));
  process.exit(0);
}
test().catch(console.error);
