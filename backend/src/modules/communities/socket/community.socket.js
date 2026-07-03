const logger = require('../../../common/logger/winston');
const CommunityMessage = require('../model/CommunityMessage');
const User = require('../../../models/User');

module.exports = (io, socket) => {
  socket.on('community:join', ({ communityId }) => {
    if (!communityId) return;
    const room = `community:${communityId}`;
    socket.join(room);
    logger.info(`🔌 User ${socket.user?.id} joined community room: ${room}`);
  });

  socket.on('community:leave', ({ communityId }) => {
    if (!communityId) return;
    const room = `community:${communityId}`;
    socket.leave(room);
    logger.info(`🔌 User ${socket.user?.id} left community room: ${room}`);
  });

  socket.on('community:message', async ({ communityId, text, attachments = [] }) => {
    if (!communityId || !text) return;

    const senderId = socket.user?.id || socket.user?._id;
    const room = `community:${communityId}`;

    try {
      const message = await CommunityMessage.create({ communityId, senderId, text, attachments });
      const sender = await User.findById(senderId).select('firstName lastName avatar').lean();

      io.to(room).emit('community:message', { ...message.toJSON(), senderId: sender });
    } catch (err) {
      logger.error(`Failed handling community:message event: ${err.message}`);
    }
  });

  socket.on('community:typing', ({ communityId }) => {
    if (!communityId) return;
    socket.to(`community:${communityId}`).emit('community:typing', {
      userId: socket.user?.id,
      username: socket.user?.username
    });
  });

  socket.on('community:stopTyping', ({ communityId }) => {
    if (!communityId) return;
    socket.to(`community:${communityId}`).emit('community:stopTyping', { userId: socket.user?.id });
  });
};
