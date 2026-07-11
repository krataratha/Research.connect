require('dotenv').config();
const mongoose = require('mongoose');
const Conversation = require('./src/modules/messages/model/Conversation');
const Message = require('./src/modules/messages/model/Message');

async function fixSeedChat() {
  try {
    await mongoose.connect('mongodb://researchconnectdb:researchconnectdb@ac-qpuswwn-shard-00-00.0x5pbm5.mongodb.net:27017,ac-qpuswwn-shard-00-01.0x5pbm5.mongodb.net:27017,ac-qpuswwn-shard-00-02.0x5pbm5.mongodb.net:27017/research_connect?ssl=true&replicaSet=atlas-t9ah7c-shard-0&authSource=admin');
    
    // User IDs
    const binoreId = new mongoose.Types.ObjectId('6a47c8bf5930ec6be9cbcb89');
    
    const User = require('./src/models/User');
    const alice = await User.findOne({ _id: { $ne: binoreId } });

    if (!alice) {
      console.log('No other users found in the database. Creating one...');
      const newUser = new User({
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice.smith@university.edu',
        password: 'Password123!',
        role: 'researcher',
        status: 'active',
        username: 'alicesmith'
      });
      await newUser.save();
      console.log('Created Alice:', newUser._id);
      return process.exit(0);
    }

    const aliceId = alice._id;
    console.log('Using real user Alice:', aliceId, alice.firstName);

    // Delete the broken conversations
    await Conversation.deleteMany({
      participants: binoreId
    });
    console.log('Deleted old broken conversations.');

    // Create a new valid Conversation
    const conversation = await Conversation.create({
      participants: [binoreId, aliceId]
    });
    console.log('Created valid conversation:', conversation._id);

    // Create some messages
    const message = await Message.create({
      conversationId: conversation._id,
      senderId: aliceId,
      receiverId: binoreId,
      content: 'Hi Binore! I saw your recent research paper. Fantastic work!',
      status: 'delivered'
    });
    
    conversation.lastMessage = message._id;
    await conversation.save();
    
    console.log('Seeded valid chat successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
}

fixSeedChat();
