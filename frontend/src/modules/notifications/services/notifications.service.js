import axiosInstance from '../../../api/axiosInstance';

class NotificationsService {
  /**
   * Get cursor paginated notifications
   * @param {object} params - query parameters like limit, cursor, type, isRead 
   */
  async getNotifications(params = {}) {
    const res = await axiosInstance.get('/v1/notifications', { params });
    return res.data;
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount() {
    const res = await axiosInstance.get('/v1/notifications/unread-count');
    return res.data;
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(notificationId) {
    const res = await axiosInstance.patch(`/v1/notifications/${notificationId}/read`);
    return res.data;
  }

  /**
   * Mark all notifications as read
   */
  async markAllRead() {
    const res = await axiosInstance.patch('/v1/notifications/read-all');
    return res.data;
  }

  /**
   * Delete a single notification
   */
  async deleteNotification(notificationId) {
    const res = await axiosInstance.delete(`/v1/notifications/${notificationId}`);
    return res.data;
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications() {
    const res = await axiosInstance.delete('/v1/notifications/clear-all');
    return res.data;
  }

  /**
   * Update notification settings preference
   */
  async updateSettings(settings = {}) {
    const res = await axiosInstance.patch('/v1/notifications/settings', settings);
    return res.data;
  }
}

export default new NotificationsService();
