import Notification from '../models/Notification.js';
import ApiResponse from '../utils/apiResponse.js';

// Get all notifications with pagination
export const getNotifications = async (req, res) => {
  try {
    const { limit = 50, skip = 0 } = req.query;
    const parseLimit = Math.min(parseInt(limit) || 50, 100);
    const parseSkip = parseInt(skip) || 0;

    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(parseLimit)
      .skip(parseSkip)
      .lean();

    const total = await Notification.countDocuments();
    const unread = await Notification.countDocuments({ isRead: false });

    console.log(`📬 Fetched ${notifications.length} notifications (unread: ${unread})`);

    return res.json(new ApiResponse(200, {
      notifications,
      pagination: {
        total,
        unread,
        skip: parseSkip,
        limit: parseLimit,
        hasMore: parseSkip + parseLimit < total
      }
    }, 'Notifications fetched successfully'));
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    return res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// Get notifications by type
export const getNotificationsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { limit = 20, skip = 0 } = req.query;

    if (!['order', 'payment', 'cancel', 'alert'].includes(type)) {
      return res.status(400).json(new ApiResponse(400, null, 'Invalid notification type'));
    }

    const notifications = await Notification.find({ type })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const total = await Notification.countDocuments({ type });

    console.log(`📬 Fetched ${notifications.length} ${type} notifications`);

    return res.json(new ApiResponse(200, {
      notifications,
      total,
      type
    }, `${type} notifications fetched`));
  } catch (error) {
    console.error('❌ Error fetching notifications by type:', error);
    return res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// Get unread count
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ isRead: false });
    console.log(`📊 Unread notifications: ${count}`);
    return res.json(new ApiResponse(200, { unread: count }, 'Unread count fetched'));
  } catch (error) {
    console.error('❌ Error getting unread count:', error);
    return res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// Mark single notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json(new ApiResponse(404, null, 'Notification not found'));
    }

    console.log(`✅ Notification marked as read: ${notificationId}`);
    return res.json(new ApiResponse(200, { notification }, 'Notification marked as read'));
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    return res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    console.log('🔄 Attempting to mark all notifications as read...');
    
    const result = await Notification.updateMany(
      { isRead: false },
      { $set: { isRead: true } }
    );

    console.log(`✅ Marked ${result.modifiedCount} notifications as read`);
    return res.json(new ApiResponse(200, {
      marked: result.modifiedCount
    }, 'All notifications marked as read'));
  } catch (error) {
    console.error('❌ Error marking all as read:', error.message, error.stack);
    return res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const result = await Notification.findByIdAndDelete(notificationId);

    if (!result) {
      return res.status(404).json(new ApiResponse(404, null, 'Notification not found'));
    }

    console.log(`🗑️ Notification deleted: ${notificationId}`);
    return res.json(new ApiResponse(200, null, 'Notification deleted'));
  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    return res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// Clear all notifications
export const clearAllNotifications = async (req, res) => {
  try {
    const result = await Notification.deleteMany({});

    console.log(`🗑️ Deleted ${result.deletedCount} notifications`);
    return res.json(new ApiResponse(200, {
      deleted: result.deletedCount
    }, 'All notifications cleared'));
  } catch (error) {
    console.error('❌ Error clearing notifications:', error);
    return res.status(500).json(new ApiResponse(500, null, error.message));
  }
};
