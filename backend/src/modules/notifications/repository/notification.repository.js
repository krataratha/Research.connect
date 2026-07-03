const BaseRepository = require("../../../common/repository/base.repository");
const Notification = require("../../../models/Notification");

class NotificationRepository extends BaseRepository {
  constructor() {
    super(Notification);
  }

  /**
   * Get cursor paginated notifications
   * @param {string} recipientId 
   * @param {object} options 
   */
  async getNotificationsWithCursor(recipientId, options = {}) {
    const { limit = 20, cursor = null, type = null, isRead = null } = options;
    const query = { recipientId };

    if (type) {
      query.type = type;
    }
    
    if (isRead !== null) {
      query.isRead = isRead === 'true' || isRead === true;
    }

    if (cursor) {
      query._id = { $lt: cursor }; // Since we sort by -createdAt / -_id, previous pages are "newer", so we get ids less than cursor
    }

    // Fetch limit + 1 documents to determine if there is a next page
    const docs = await this.model.find(query)
      .sort({ _id: -1 })
      .limit(Number(limit) + 1)
      .populate('actorId', 'firstName lastName username email profileImage')
      .lean();

    const hasNextPage = docs.length > limit;
    if (hasNextPage) {
      docs.pop();
    }

    const nextCursor = docs.length > 0 ? docs[docs.length - 1]._id : null;

    return {
      docs,
      nextCursor,
      hasNextPage
    };
  }

  /**
   * Get total unread notifications count
   * @param {string} recipientId 
   */
  async getUnreadCount(recipientId) {
    return await this.model.countDocuments({ recipientId, isRead: false });
  }
}

module.exports = new NotificationRepository();
