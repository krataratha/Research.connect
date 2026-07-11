const mongoose = require('mongoose');
const repo = require('./src/modules/messages/repository/message.repository.js');
mongoose.connect('mongodb://researchconnectdb:researchconnectdb@ac-qpuswwn-shard-00-00.0x5pbm5.mongodb.net:27017,ac-qpuswwn-shard-00-01.0x5pbm5.mongodb.net:27017,ac-qpuswwn-shard-00-02.0x5pbm5.mongodb.net:27017/research_connect?ssl=true&replicaSet=atlas-t9ah7c-shard-0&authSource=admin')
.then(async () => {
  try {
    // Require User model first so it is registered
    require('./src/models/User.js');
    require('./src/modules/messages/model/Conversation.js');
    require('./src/modules/messages/model/Message.js');
    require('./src/modules/messages/model/PinnedChat.js');
    require('./src/modules/messages/model/ArchivedChat.js');

    const convs = await repo.getUserConversations('6a47c8bf5930ec6be9cbcb89');
    console.log('Conversations count:', convs.length);
    console.log('First conv participants count:', convs[0].participants.length);
    console.log('First conv otherParticipant:', convs[0].otherParticipant);
    console.log(JSON.stringify(convs, null, 2));
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
});
