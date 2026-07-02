const express = require("express");
const router = express.Router();
const messageController = require("../controller/message.controller");
const {
  authMiddleware,
} = require("../../../common/middlewares/auth.middleware");
const {
  createConversationValidator,
  sendMessageValidator,
  messageQueryValidator,
} = require("../validator/message.validator");

router.use(authMiddleware);

router.post(
  "/messages/conversations",
  createConversationValidator,
  messageController.createConversation,
);
router.get(
  "/messages/conversations",
  messageQueryValidator,
  messageController.listConversations,
);
router.get(
  "/messages/conversations/:conversationId/messages",
  messageQueryValidator,
  messageController.getMessages,
);
router.post(
  "/messages/conversations/:conversationId/messages",
  sendMessageValidator,
  messageController.sendMessage,
);
router.post(
  "/messages/conversations/:conversationId/read",
  messageController.markConversationRead,
);
router.get("/messages/unread-count", messageController.getUnreadCount);
router.delete("/messages/:messageId", messageController.deleteMessage);

module.exports = router;
