const notificationRepository = require("../repository/notification.repository");
const Profile = require("../../../models/Profile");
const { emitToUser } = require("../../../config/socket");
const logger = require("../../../common/logger/winston");
const { NotFoundError, UnauthorizedError } = require("../../../common/errors/AppError");

class NotificationService {
  /**
   * Helper to map notification type to profile settings key
   */
  _getSettingsKey(type) {
    if (type.startsWith('follow')) return 'follow';
    if (type.startsWith('connection')) return 'connection';
    if (type.startsWith('publication')) return 'publication';
    if (type.startsWith('comment')) return 'comment';
    if (type.startsWith('mention')) return 'mention';
    return 'system';
  }

  /**
   * Create a notification and dispatch via WebSockets
   */
  async createNotification(data) {
    const { recipientId, actorId, type, title, message, targetType, targetId, targetUrl, metadata } = data;

    // Check recipient's notification preference settings
    const profile = await Profile.findOne({ userId: recipientId });
    if (profile && profile.notificationSettings) {
      const settingsKey = this._getSettingsKey(type);
      const isEnabled = profile.notificationSettings[settingsKey];
      if (isEnabled === false) {
        logger.info(`Skipping notification of type [${type}] for user [${recipientId}] per notification settings.`);
        return null;
      }
    }

    // Save notification
    const notification = await notificationRepository.create({
      recipientId,
      actorId,
      type,
      title,
      message,
      targetType,
      targetId,
      targetUrl,
      metadata
    });

    // Populate actor details for client display
    const populated = await Notification.findById(notification._id)
      .populate('actorId', 'firstName lastName username email profileImage')
      .lean();

    // Get updated unread count
    const unreadCount = await notificationRepository.getUnreadCount(recipientId);

    // Emit real-time WebSocket events
    emitToUser(recipientId, "notification:new", populated);
    emitToUser(recipientId, "notification:count", { count: unreadCount });

    return populated;
  }

  /**
   * Get paginated notifications list
   */
  async getNotifications(recipientId, options = {}) {
    return await notificationRepository.getNotificationsWithCursor(recipientId, options);
  }

  /**
   * Get unread count
   */
  async getUnreadCount(recipientId) {
    const count = await notificationRepository.getUnreadCount(recipientId);
    return { count };
  }

  /**
   * Mark single notification as read
   */
  async markAsRead(notificationId, recipientId) {
    const notification = await notificationRepository.findById(notificationId);
    if (!notification) {
      throw new NotFoundError("Notification not found");
    }

    if (notification.recipientId.toString() !== recipientId.toString()) {
      throw new UnauthorizedError("You are not authorized to access this notification");
    }

    notification.isRead = true;
    await notification.save();

    const unreadCount = await notificationRepository.getUnreadCount(recipientId);
    emitToUser(recipientId, "notification:update", notification);
    emitToUser(recipientId, "notification:count", { count: unreadCount });

    return notification;
  }

  /**
   * Mark all notifications as read
   */
  async markAllRead(recipientId) {
    await notificationRepository.updateMany({ recipientId, isRead: false }, { isRead: true });
    
    emitToUser(recipientId, "notification:count", { count: 0 });
    return { success: true, message: "All notifications marked as read." };
  }

  /**
   * Delete single notification
   */
  async deleteNotification(notificationId, recipientId) {
    const notification = await notificationRepository.findById(notificationId);
    if (!notification) {
      throw new NotFoundError("Notification not found");
    }

    if (notification.recipientId.toString() !== recipientId.toString()) {
      throw new UnauthorizedError("You are not authorized to delete this notification");
    }

    await notificationRepository.delete(notificationId);

    const unreadCount = await notificationRepository.getUnreadCount(recipientId);
    emitToUser(recipientId, "notification:count", { count: unreadCount });

    return { success: true, message: "Notification deleted." };
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(recipientId) {
    await notificationRepository.model.deleteMany({ recipientId });
    emitToUser(recipientId, "notification:count", { count: 0 });
    return { success: true, message: "All notifications cleared." };
  }

  /**
   * Update notification settings preferences
   */
  async updateSettings(userId, settings = {}) {
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      throw new NotFoundError("Profile not found");
    }

    // Merge settings
    profile.notificationSettings = {
      ...profile.notificationSettings.toObject(),
      ...settings
    };

    await profile.save();
    return profile.notificationSettings;
  }
}

// Inline import helper since Mongoose Model requires Notification name resolution
const Notification = require("../../../models/Notification");

module.exports = new NotificationService();
