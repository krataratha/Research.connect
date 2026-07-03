const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notification.controller');
const { authMiddleware } = require('../../../common/middlewares/auth.middleware');
const { 
  validateNotificationId, 
  validateSettingsUpdate 
} = require('../validators/notification.validator');

// All routes are protected
router.use(authMiddleware);

// GET API endpoints
router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);

// PATCH API endpoints
router.patch('/read-all', notificationController.markAllRead);
router.patch('/:notificationId/read', validateNotificationId, notificationController.markAsRead);
router.patch('/settings', validateSettingsUpdate, notificationController.updateSettings);

// DELETE API endpoints
router.delete('/clear-all', notificationController.clearAllNotifications);
router.delete('/:notificationId', validateNotificationId, notificationController.deleteNotification);

module.exports = router;
