const express = require('express');
const router = express.Router();
const messageController = require('../controller/message.controller');
const { authMiddleware } = require('../../../common/middlewares/auth.middleware');
const { upload, validateUpload } = require('../../upload/middleware/upload.middleware');
const {
  validateSendMessage,
  validateMessageId,
  validateReaction,
  validateConversationId
} = require('../validators/message.validator');

// All messages routes require active session auth
router.use(authMiddleware);

// GET Conversation lists & search
router.get('/', messageController.getUserConversations);
router.get('/search', messageController.searchMessages);
router.get('/shared-files', messageController.getSharedFiles);

// GET Message history
router.get('/:conversationId', validateConversationId, messageController.getConversationMessages);

// POST Send message
router.post('/send', validateSendMessage, messageController.sendMessage);

// PATCH Mark read
router.patch('/:conversationId/read', validateConversationId, messageController.markAsRead);

// PATCH Pin / Unpin
router.patch('/:conversationId/pin', validateConversationId, messageController.pinConversation);
router.patch('/:conversationId/unpin', validateConversationId, messageController.unpinConversation);

// PATCH Archive / Unarchive
router.patch('/:conversationId/archive', validateConversationId, messageController.archiveConversation);
router.patch('/:conversationId/restore', validateConversationId, messageController.restoreConversation);

// PATCH Edit Message
router.patch('/edit', messageController.editMessage);

// DELETE Delete Message (both Everyone and Me)
router.delete('/delete', validateMessageId, messageController.deleteMessage);

// POST Reactions
router.post('/reaction', validateReaction, messageController.reactToMessage);

// POST File Attachment Upload
router.post('/upload', upload.single('file'), validateUpload, messageController.uploadAttachment);

// ── Conversation-scoped aliases (matches frontend messagingApi.js routes) ─────
// GET  /conversations          → list all conversations
router.get('/conversations', messageController.getUserConversations);

// POST /conversations          → start or retrieve a conversation
router.post('/conversations', messageController.createConversation);
router.post('/conversations/create', messageController.createConversation);

// GET  /conversations/:id/messages  → paginated message history
router.get('/conversations/:conversationId/messages', validateConversationId, messageController.getConversationMessages);

// POST /conversations/:id/messages  → send a message
router.post('/conversations/:conversationId/messages', validateConversationId, messageController.sendMessageToConversation);

// POST /conversations/:id/read → mark conversation as read
router.post('/conversations/:conversationId/read', validateConversationId, messageController.markAsRead);

// Groups
router.post('/group/create', messageController.createGroup);
router.post('/group/invite', messageController.inviteToGroup);

// Calls (WebRTC Logs)
router.post('/call/start', messageController.startCall);
router.post('/call/end', messageController.endCall);
router.get('/call/history', messageController.getCallHistory);
router.post('/video/start', messageController.startCall);
router.post('/video/end', messageController.endCall);

// Status/Read Receipts Shortcuts
router.post('/read', messageController.markAsRead);
router.post('/delivered', (req, res) => res.status(200).json({ success: true, message: 'Delivered' }));
router.post('/typing', (req, res) => res.status(200).json({ success: true, message: 'Typing logged' }));

module.exports = router;
