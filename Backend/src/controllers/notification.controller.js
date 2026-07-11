import Notification from '../models/Notification.js';
import AppError from '../utils/AppError.js';

/**
 * GET /api/notifications
 * Retrieve all notifications for authenticated user
 */
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ user: userId })
      .populate('sender', 'fullName role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Notification.countDocuments({ user: userId });

    res.status(200).json({
      status: 'success',
      results: notifications.length,
      total,
      page,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read
 */
export const markAllRead = async (req, res, next) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { user: userId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/notifications/:id
 * Delete a specific notification
 */
export const deleteNotification = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const notificationId = req.params.id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: userId
    });

    if (!notification) {
      return next(new AppError('Notification not found or access denied', 404));
    }

    res.status(200).json({
      status: 'success',
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
