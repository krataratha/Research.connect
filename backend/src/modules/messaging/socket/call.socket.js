const logger = require('../../../common/logger/winston');
const CallHistory = require('../../../models/CallHistory');
const redisClient = require('../../../config/redis');

// In-memory fallback map for active calls when Redis is unavailable
const memoryActiveCalls = new Map(); // userId -> { callId, peerId, status, role }
const activeTimeouts = new Map();   // callId -> setTimeout ID

/**
 * Helper to check if a user is currently in a call
 */
const isUserInCall = async (userId) => {
  const userIdStr = userId.toString();
  if (redisClient && redisClient.isOpen && redisClient.isReady) {
    try {
      const activeCall = await redisClient.get(`user:${userIdStr}:active_call`);
      return !!activeCall;
    } catch (err) {
      logger.error(`Redis query user active call failed: ${err.message}`);
    }
  }
  return memoryActiveCalls.has(userIdStr);
};

/**
 * Helper to save active call state
 */
const setActiveCall = async (userId, callDetails) => {
  const userIdStr = userId.toString();
  if (redisClient && redisClient.isOpen && redisClient.isReady) {
    try {
      await redisClient.set(`user:${userIdStr}:active_call`, JSON.stringify(callDetails), { EX: 3600 }); // 1 hour safety TTL
      return;
    } catch (err) {
      logger.error(`Redis set user active call failed: ${err.message}`);
    }
  }
  memoryActiveCalls.set(userIdStr, callDetails);
};

/**
 * Helper to remove active call state
 */
const removeActiveCall = async (userId) => {
  const userIdStr = userId.toString();
  if (redisClient && redisClient.isOpen && redisClient.isReady) {
    try {
      await redisClient.del(`user:${userIdStr}:active_call`);
      return;
    } catch (err) {
      logger.error(`Redis del user active call failed: ${err.message}`);
    }
  }
  memoryActiveCalls.delete(userIdStr);
};

module.exports = (io, socket) => {
  const userId = socket.user?.userId || socket.user?.id || socket.user?._id;
  if (!userId) {
    logger.warn(`socket.user is missing userId properties for call socket: ${socket.id}`);
    return;
  }

  const userIdStr = userId.toString();

  /**
   * 1. CALL_INVITE (or call:initiate)
   * Caller initiates WebRTC call session
   */
  const handleCallInvite = async ({ targetUserId, type, conversationId, callId }) => {
    if (!targetUserId) return;
    const targetUserIdStr = targetUserId.toString();
    const callerIdStr = userIdStr;

    try {
      // Check if target user is busy
      const isBusy = await isUserInCall(targetUserIdStr);
      if (isBusy) {
        logger.info(`📞 Calling: User ${targetUserIdStr} is busy. Rejecting call request from ${callerIdStr}.`);
        socket.emit('CALL_BUSY', { targetUserId: targetUserIdStr, callId });
        socket.emit('call:rejected', { callId, reason: 'busy' });
        
        // Log busy call history in DB
        const call = new CallHistory({
          _id: callId,
          caller: userId,
          receiver: targetUserId,
          status: 'busy',
          type: type || 'voice',
          participants: [userId, targetUserId],
          startedAt: new Date(),
          endedAt: new Date()
        });
        await call.save();
        return;
      }

      // Check if target user is online
      const presenceManager = require('../../../socket/presence/presence.manager');
      const targetOnline = await presenceManager.isUserOnline(targetUserIdStr);
      if (!targetOnline) {
        logger.info(`📞 Calling: Target User ${targetUserIdStr} is offline.`);
        socket.emit('CALL_TIMEOUT', { callId });
        socket.emit('call:rejected', { callId, reason: 'offline' });
        
        const call = new CallHistory({
          _id: callId,
          caller: userId,
          receiver: targetUserId,
          status: 'missed',
          type: type || 'voice',
          participants: [userId, targetUserId],
          startedAt: new Date(),
          endedAt: new Date()
        });
        await call.save();
        return;
      }

      logger.info(`📞 Call Invite: User ${callerIdStr} is calling ${targetUserIdStr} (CallId: ${callId})`);

      // Set active call status in Redis/Memory
      const callDetails = { callId, type: type || 'voice', peerId: targetUserIdStr };
      await setActiveCall(callerIdStr, { ...callDetails, role: 'caller', status: 'ringing' });
      await setActiveCall(targetUserIdStr, { ...callDetails, role: 'callee', status: 'ringing' });

      // Save starting CallHistory record
      let callRecord;
      if (callId) {
        callRecord = await CallHistory.findById(callId);
      }
      
      if (!callRecord) {
        callRecord = new CallHistory({
          _id: callId,
          caller: userId,
          receiver: targetUserId,
          status: 'missed', // default to missed in case they timeout
          type: type || 'voice',
          participants: [userId, targetUserId],
          startedAt: new Date()
        });
        await callRecord.save();
      }

      // Relay CALL_INVITE (and call:incoming) to receiver
      io.to(`user:${targetUserIdStr}`).emit('CALL_INVITE', {
        callerId: userId,
        callerName: socket.user.fullName || 'Researcher',
        callerImage: socket.user.profileImage || '',
        callId: callRecord._id,
        type: type || 'voice',
        conversationId
      });

      io.to(`user:${targetUserIdStr}`).emit('call:incoming', {
        callerId: userId,
        callerName: socket.user.fullName || 'Researcher',
        callerImage: socket.user.profileImage || '',
        callId: callRecord._id,
        type: type || 'voice',
        conversationId
      });

      // Set 30 seconds timer for Missed Call / Timeout
      const timeoutId = setTimeout(async () => {
        try {
          logger.info(`📞 Call Timeout: CallId ${callRecord._id} timed out after 30 seconds.`);
          
          // Clear active keys
          await removeActiveCall(callerIdStr);
          await removeActiveCall(targetUserIdStr);
          
          // Update database record
          callRecord.status = 'missed';
          callRecord.endedAt = new Date();
          callRecord.duration = 0;
          await callRecord.save();

          // Emit timeout events
          io.to(`user:${callerIdStr}`).emit('CALL_TIMEOUT', { callId: callRecord._id });
          io.to(`user:${targetUserIdStr}`).emit('CALL_TIMEOUT', { callId: callRecord._id });

          io.to(`user:${callerIdStr}`).emit('call:rejected', { callId: callRecord._id, reason: 'timeout' });
          io.to(`user:${targetUserIdStr}`).emit('call:hungup', { callId: callRecord._id });
          
          activeTimeouts.delete(callRecord._id.toString());
        } catch (timerErr) {
          logger.error(`Error during call timeout scheduler execution: ${timerErr.message}`);
        }
      }, 30000);

      activeTimeouts.set(callRecord._id.toString(), timeoutId);

    } catch (err) {
      logger.error(`Failed to initiate call via socket: ${err.message}`);
    }
  };

  socket.on('call:initiate', handleCallInvite);
  socket.on('CALL_INVITE', handleCallInvite);

  /**
   * 2. CALL_RINGING
   * Callee lets caller know that call invitation has been shown and is ringing
   */
  const handleCallRinging = ({ callerId, callId }) => {
    if (!callerId) return;
    io.to(`user:${callerId}`).emit('CALL_RINGING', { callId });
  };
  socket.on('CALL_RINGING', handleCallRinging);

  /**
   * 3. CALL_ACCEPT (or call:accept)
   * Callee accepts WebRTC call
   */
  const handleCallAccept = async ({ callerId, callId }) => {
    if (!callId) return;
    const callIdStr = callId.toString();

    try {
      // Clear timeout
      if (activeTimeouts.has(callIdStr)) {
        clearTimeout(activeTimeouts.get(callIdStr));
        activeTimeouts.delete(callIdStr);
      }

      // Update call states in Redis/Memory to active
      const callerIdStr = callerId.toString();
      await setActiveCall(callerIdStr, { callId, status: 'active', role: 'caller', peerId: userIdStr });
      await setActiveCall(userIdStr, { callId, status: 'active', role: 'callee', peerId: callerIdStr });

      // Update CallHistory in MongoDB
      const call = await CallHistory.findById(callId);
      if (call) {
        call.status = 'completed'; // default final status if completes successfully
        await call.save();
      }

      logger.info(`📞 Call Accepted: User ${userIdStr} accepted CallId ${callId}`);

      // Relay acceptance
      io.to(`user:${callerId}`).emit('CALL_ACCEPT', { callId, accepterId: userId });
      io.to(`user:${callerId}`).emit('call:accepted', { callId, accepterId: userId });
    } catch (err) {
      logger.error(`Failed to accept call via socket: ${err.message}`);
    }
  };

  socket.on('call:accept', handleCallAccept);
  socket.on('CALL_ACCEPT', handleCallAccept);

  /**
   * 4. CALL_REJECT (or call:reject)
   * Callee rejects incoming call invitation
   */
  const handleCallReject = async ({ callerId, callId }) => {
    if (!callId) return;
    const callIdStr = callId.toString();

    try {
      // Clear timeout
      if (activeTimeouts.has(callIdStr)) {
        clearTimeout(activeTimeouts.get(callIdStr));
        activeTimeouts.delete(callIdStr);
      }

      // Clean active call references
      const callerIdStr = callerId.toString();
      await removeActiveCall(callerIdStr);
      await removeActiveCall(userIdStr);

      // Update CallHistory DB record
      const call = await CallHistory.findById(callId);
      if (call) {
        call.status = 'rejected';
        call.endedAt = new Date();
        call.duration = 0;
        await call.save();
      }

      logger.info(`📞 Call Rejected: User ${userIdStr} rejected CallId ${callId}`);

      // Relay reject
      io.to(`user:${callerId}`).emit('CALL_REJECT', { callId, rejecterId: userId });
      io.to(`user:${callerId}`).emit('call:rejected', { callId, rejecterId: userId });
    } catch (err) {
      logger.error(`Failed to reject call via socket: ${err.message}`);
    }
  };

  socket.on('call:reject', handleCallReject);
  socket.on('CALL_REJECT', handleCallReject);

  /**
   * 5. CALL_CANCEL
   * Caller cancels call before receiver answers
   */
  const handleCallCancel = async ({ targetUserId, callId }) => {
    if (!callId) return;
    const callIdStr = callId.toString();

    try {
      if (activeTimeouts.has(callIdStr)) {
        clearTimeout(activeTimeouts.get(callIdStr));
        activeTimeouts.delete(callIdStr);
      }

      const targetUserIdStr = targetUserId.toString();
      await removeActiveCall(userIdStr);
      await removeActiveCall(targetUserIdStr);

      const call = await CallHistory.findById(callId);
      if (call) {
        call.status = 'cancelled';
        call.endedAt = new Date();
        call.duration = 0;
        await call.save();
      }

      logger.info(`📞 Call Cancelled: Caller ${userIdStr} cancelled CallId ${callId}`);

      io.to(`user:${targetUserIdStr}`).emit('CALL_CANCEL', { callId, cancellerId: userId });
      io.to(`user:${targetUserIdStr}`).emit('call:hungup', { callId });
    } catch (err) {
      logger.error(`Failed to cancel call via socket: ${err.message}`);
    }
  };
  socket.on('CALL_CANCEL', handleCallCancel);

  /**
   * 6. CALL_END (or call:hangup)
   * Active call gets hung up by either party
   */
  const handleCallEnd = async ({ targetUserId, callId, iceState, connectionState }) => {
    if (!callId) return;
    const callIdStr = callId.toString();

    try {
      if (activeTimeouts.has(callIdStr)) {
        clearTimeout(activeTimeouts.get(callIdStr));
        activeTimeouts.delete(callIdStr);
      }

      const targetUserIdStr = targetUserId.toString();
      await removeActiveCall(userIdStr);
      await removeActiveCall(targetUserIdStr);

      const call = await CallHistory.findById(callId);
      if (call) {
        call.endedAt = new Date();
        call.duration = Math.max(0, Math.round((call.endedAt - call.startedAt) / 1000));
        
        // Only set completed if it was accepted and running
        if (call.status !== 'rejected' && call.status !== 'cancelled' && call.status !== 'busy') {
          call.status = 'completed';
        }
        
        if (iceState) call.iceState = iceState;
        if (connectionState) call.connectionState = connectionState;
        
        await call.save();
      }

      logger.info(`📞 Call End: User ${userIdStr} hung up CallId ${callId}`);

      io.to(`user:${targetUserIdStr}`).emit('CALL_END', { callId, hangupperId: userId });
      io.to(`user:${targetUserIdStr}`).emit('call:hungup', { callId, hangupperId: userId });
    } catch (err) {
      logger.error(`Failed to hang up call via socket: ${err.message}`);
    }
  };

  socket.on('call:hangup', handleCallEnd);
  socket.on('CALL_END', handleCallEnd);

  /**
   * 7. WebRTC Signaling relay (offers, answers, ICE candidates)
   */
  socket.on('call:signal', async ({ targetUserId, signal, callId }) => {
    if (!targetUserId) return;
    const targetUserIdStr = targetUserId.toString();

    // Authorization check: Make sure this signal belongs to an active call involving sender
    const inCall = await isUserInCall(userIdStr);
    if (!inCall) {
      logger.warn(`Blocked unauthorized call:signal from ${userIdStr} to ${targetUserIdStr}. User not flagged in call.`);
      return;
    }

    // Relay compatibility signals
    io.to(`user:${targetUserIdStr}`).emit('call:signal', {
      senderId: userId,
      signal
    });

    // Relay precise specification signals
    if (signal.sdp) {
      if (signal.sdp.type === 'offer') {
        io.to(`user:${targetUserIdStr}`).emit('WEBRTC_OFFER', { senderId: userId, sdp: signal.sdp, callId });
      } else if (signal.sdp.type === 'answer') {
        io.to(`user:${targetUserIdStr}`).emit('WEBRTC_ANSWER', { senderId: userId, sdp: signal.sdp, callId });
      }
    } else if (signal.candidate) {
      io.to(`user:${targetUserIdStr}`).emit('ICE_CANDIDATE', { senderId: userId, candidate: signal.candidate, callId });
    }
  });

  // Explicit events relay
  socket.on('WEBRTC_OFFER', async ({ targetUserId, sdp, callId }) => {
    if (!targetUserId) return;
    io.to(`user:${targetUserId}`).emit('WEBRTC_OFFER', { senderId: userId, sdp, callId });
  });

  socket.on('WEBRTC_ANSWER', async ({ targetUserId, sdp, callId }) => {
    if (!targetUserId) return;
    io.to(`user:${targetUserId}`).emit('WEBRTC_ANSWER', { senderId: userId, sdp, callId });
  });

  socket.on('ICE_CANDIDATE', async ({ targetUserId, candidate, callId }) => {
    if (!targetUserId) return;
    io.to(`user:${targetUserId}`).emit('ICE_CANDIDATE', { senderId: userId, candidate, callId });
  });

  /**
   * 8. MEDIA_STATE_CHANGED
   * Relay microphone, camera, and screen sharing state updates to the peer
   */
  socket.on('MEDIA_STATE_CHANGED', ({ targetUserId, micActive, videoActive, screenSharing }) => {
    if (!targetUserId) return;
    io.to(`user:${targetUserId}`).emit('MEDIA_STATE_CHANGED', {
      senderId: userId,
      micActive,
      videoActive,
      screenSharing
    });
  });
};
