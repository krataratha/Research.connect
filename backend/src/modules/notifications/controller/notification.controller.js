const notificationService = require("../service/notification.service");

class NotificationController {
  async getNotifications(req, res, next) {
    try {
      const recipientId = req.user.id || req.user._id;
      const { limit, cursor, type, isRead } = req.query;

      const data = await notificationService.getNotifications(recipientId, {
        limit,
        cursor,
        type,
        isRead
      });

      res.status(200).json({
        success: true,
        message: "Notifications retrieved successfully",
        data,
        error: null
      });
    } catch (err) {
      next(err);
    }
  }

  async getUnreadCount(req, res, next) {
    try {
      const recipientId = req.user.id || req.user._id;
      const data = await notificationService.getUnreadCount(recipientId);

      res.status(200).json({
        success: true,
        message: "Unread count retrieved successfully",
        data,
        error: null
      });
    } catch (err) {
      next(err);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const recipientId = req.user.id || req.user._id;
      const { notificationId } = req.params;

      const data = await notificationService.markAsRead(notificationId, recipientId);

      res.status(200).json({
        success: true,
        message: "Notification marked as read",
        data,
        error: null
      });
    } catch (err) {
      next(err);
    }
  }

  async markAllRead(req, res, next) {
    try {
      const recipientId = req.user.id || req.user._id;
      await notificationService.markAllRead(recipientId);

      res.status(200).json({
        success: true,
        message: "All notifications marked as read",
        data: null,
        error: null
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteNotification(req, res, next) {
    try {
      const recipientId = req.user.id || req.user._id;
      const { notificationId } = req.params;

      await notificationService.deleteNotification(notificationId, recipientId);

      res.status(200).json({
        success: true,
        message: "Notification deleted successfully",
        data: null,
        error: null
      });
    } catch (err) {
      next(err);
    }
  }

  async clearAllNotifications(req, res, next) {
    try {
      const recipientId = req.user.id || req.user._id;
      await notificationService.clearAllNotifications(recipientId);

      res.status(200).json({
        success: true,
        message: "All notifications cleared successfully",
        data: null,
        error: null
      });
    } catch (err) {
      next(err);
    }
  }

  async updateSettings(req, res, next) {
    try {
      const userId = req.user.id || req.user._id;
      const settings = req.body;

      const data = await notificationService.updateSettings(userId, settings);

      res.status(200).json({
        success: true,
        message: "Notification settings updated successfully",
        data,
        error: null
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NotificationController();
