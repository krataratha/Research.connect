const logger = require('../../../common/logger/winston');
const Call = require('../../../models/Call');

module.exports = (io, socket) => {
  const userId = socket.user?.userId || socket.user?.id || socket.user?._id;
  if (!userId) {
    logger.warn(`socket.user is missing userId properties for call socket: ${socket.id}`);
    return;
  }

  /**
   * Caller initiates WebRTC call
   */
  socket.on('call:initiate', async ({ targetUserId, type, conversationId }) => {
    if (!targetUserId) return;
    const targetUserIdStr = targetUserId.toString();
    const callerIdStr = userId.toString();

    try {
      // 1. Log active call in database
      const call = new Call({
        initiatorId: userId,
        participants: [userId, targetUserId],
        type: type || 'voice',
        status: 'initiated',
        conversationId: conversationId || null,
        startTime: new Date()
      });
      await call.save();

      logger.info(`📞 Socket call:initiate: User ${callerIdStr} calling ${targetUserIdStr} (CallId: ${call._id})`);

      // 2. Emit call:incoming to callee
      io.to(`user:${targetUserIdStr}`).emit('call:incoming', {
        callerId: userId,
        callerName: socket.user.fullName || 'Researcher',
        callerImage: socket.user.profileImage || '',
        callId: call._id,
        type: call.type,
        conversationId
      });
    } catch (err) {
      logger.error(`Failed to initiate call via socket: ${err.message}`);
    }
  });

  
  /**
   * Receiver accepts WebRTC call
   */
  socket.on('call:accept', async ({ callerId, callId }) => {
    if (!callId) return;

    try {
      const call = await Call.findById(callId);
      if (call) {
        call.status = 'answered';
        await call.save();
      }

      logger.info(`📞 Socket call:accept: User ${userId} accepted CallId ${callId}`);

      // Emit call:accepted to caller
      io.to(`user:${callerId}`).emit('call:accepted', {
        callId,
        accepterId: userId
      });
    } catch (err) {
      logger.error(`Failed to accept call via socket: ${err.message}`);
    }
  });

  /**
   * Receiver rejects WebRTC call
   */
  socket.on('call:reject', async ({ callerId, callId }) => {
    if (!callId) return;

    try {
      const call = await Call.findById(callId);
      if (call) {
        call.status = 'rejected';
        call.endTime = new Date();
        call.duration = Math.round((call.endTime - call.startTime) / 1000);
        await call.save();
      }

      logger.info(`📞 Socket call:reject: User ${userId} rejected CallId ${callId}`);

      // Emit call:rejected to caller
      io.to(`user:${callerId}`).emit('call:rejected', {
        callId,
        rejecterId: userId
      });
    } catch (err) {
      logger.error(`Failed to reject call via socket: ${err.message}`);
    }
  });

  /**
   * Active call hangup/cancel
   */
  socket.on('call:hangup', async ({ targetUserId, callId }) => {
    if (!callId) return;

    try {
      const call = await Call.findById(callId);
      if (call && call.status !== 'completed') {
        call.status = call.status === 'answered' ? 'completed' : 'missed';
        call.endTime = new Date();
        call.duration = Math.round((call.endTime - call.startTime) / 1000);
        await call.save();
      }

      logger.info(`📞 Socket call:hangup: User ${userId} hung up CallId ${callId}`);

      // Emit call:hungup to target user
      if (targetUserId) {
        io.to(`user:${targetUserId}`).emit('call:hungup', {
          callId,
          hangupperId: userId
        });
      }
    } catch (err) {
      logger.error(`Failed to hang up call via socket: ${err.message}`);
    }
  });

  /**
   * WebRTC Signaling relay (offers, answers, ICE candidates)
   */
  socket.on('call:signal', ({ targetUserId, signal }) => {
    if (!targetUserId) return;
    io.to(`user:${targetUserId}`).emit('call:signal', {
      senderId: userId,
      signal
    });
  });
};
