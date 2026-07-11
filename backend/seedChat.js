require('dotenv').config();
const mongoose = require('mongoose');
const Conversation = require('./src/modules/messages/model/Conversation');
const Message = require('./src/modules/messages/model/Message');

async function seedChat() {
  try {
    await mongoose.connect('mongodb://researchconnectdb:researchconnectdb@ac-qpuswwn-shard-00-00.0x5pbm5.mongodb.net:27017,ac-qpuswwn-shard-00-01.0x5pbm5.mongodb.net:27017,ac-qpuswwn-shard-00-02.0x5pbm5.mongodb.net:27017/research_connect?ssl=true&replicaSet=atlas-t9ah7c-shard-0&authSource=admin');
    
    // User IDs
    const binoreId = new mongoose.Types.ObjectId('6a47c8bf5930ec6be9cbcb89');
    const aliceId = new mongoose.Types.ObjectId('6a47b53878f3d31e8ea5b56e');

    // Create a Conversation
    let conversation = await Conversation.findOne({
      isGroup: false,
      participants: { $all: [binoreId, aliceId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [binoreId, aliceId],
        isGroup: false
      });
    }

    // Create an initial message from Alice
    const message = await Message.create({
      conversationId: conversation._id,
      senderId: aliceId,
      receiverId: binoreId,
      content: 'Hi Binore! I saw your recent publication and wanted to discuss a potential collaboration. Are you free to chat?',
      status: 'delivered'
    });

    conversation.lastMessage = message._id;
    await conversation.save();

    console.log('Successfully seeded a conversation between you and Alice Smith!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedChat();
