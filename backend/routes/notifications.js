import express from 'express';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';
import * as notificationCtrl from '../controllers/notificationController.js';

const router = express.Router();

// All routes require authentication and admin role
const adminAuth = [protect, requireAdmin];

// Get all notifications
router.get('/', adminAuth, notificationCtrl.getNotifications);

// Get notifications by type
router.get('/type/:type', adminAuth, notificationCtrl.getNotificationsByType);

// Get unread count
router.get('/unread/count', adminAuth, notificationCtrl.getUnreadCount);

// ✅ Mark ALL as read BEFORE marking individual (order matters in Express!)
router.put('/all/read', adminAuth, notificationCtrl.markAllAsRead);

// Mark single notification as read
router.put('/:notificationId/read', adminAuth, notificationCtrl.markAsRead);

// ✅ Clear ALL notifications BEFORE deleting individual
router.delete('/all/clear', adminAuth, notificationCtrl.clearAllNotifications);

// Delete single notification
router.delete('/:notificationId', adminAuth, notificationCtrl.deleteNotification);

export default router;
