const mongoose = require('mongoose');
mongoose.connect('mongodb://researchconnectdb:researchconnectdb@ac-qpuswwn-shard-00-00.0x5pbm5.mongodb.net:27017,ac-qpuswwn-shard-00-01.0x5pbm5.mongodb.net:27017,ac-qpuswwn-shard-00-02.0x5pbm5.mongodb.net:27017/research_connect?ssl=true&replicaSet=atlas-t9ah7c-shard-0&authSource=admin')
.then(async () => {
  try {
    const emptyConvs = await mongoose.connection.db.collection('conversations').find({ $or: [{ participants: { $size: 0 } }, { participants: { $size: 1 } }] }).toArray();
    console.log('Conversations with 0 or 1 participants:', JSON.stringify(emptyConvs, null, 2));
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
});
