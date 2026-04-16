import Notification from '../models/Notification.js';

class NotificationService {
  constructor(io) {
    this.io = io;
  }

  /**
   * Create and emit a notification
   * @param {String} type - 'order', 'payment', 'cancel', 'alert'
   * @param {String} message - Notification message
   * @param {ObjectId} relatedId - Document ID (orderId, transactionId, etc.)
   * @param {String} refModel - 'Order' | 'Transaction' | 'User'
   */
  async createNotification(type, message, relatedId, refModel = 'Order') {
    try {
      // Save to database
      const notification = new Notification({
        type,
        message,
        relatedId,
        refModel,
        isRead: false
      });

      const saved = await notification.save();
      console.log(`✅ Notification saved: ${type} - ${message}`);

      // Emit to all connected admins via Socket.IO
      this.emitToAdmins('new_notification', {
        _id: saved._id,
        type: saved.type,
        message: saved.message,
        relatedId: saved.relatedId,
        createdAt: saved.createdAt,
        isRead: saved.isRead
      });

      return saved;
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Emit notification to all connected admin clients
   */
  emitToAdmins(eventName, data) {
    if (this.io) {
      this.io.to('admin-dashboard').emit(eventName, data);
      console.log(`📡 Emitted ${eventName} to admin-dashboard:`, data);
    }
  }

  /**
   * Get all notifications (for admin)
   */
  async getNotifications(limit = 50, skip = 0) {
    try {
      const notifications = await Notification.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      const total = await Notification.countDocuments();
      const unread = await Notification.countDocuments({ isRead: false });

      return {
        notifications,
        total,
        unread,
        skip,
        limit
      };
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    try {
      const result = await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
      );
      console.log(`✅ Notification marked as read: ${notificationId}`);
      return result;
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    try {
      await Notification.updateMany(
        { isRead: false },
        { isRead: true }
      );
      console.log('✅ All notifications marked as read');
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount() {
    try {
      const count = await Notification.countDocuments({ isRead: false });
      return count;
    } catch (error) {
      console.error('❌ Error getting unread count:', error);
      throw error;
    }
  }
}

export default NotificationService;
