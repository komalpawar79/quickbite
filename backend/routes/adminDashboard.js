import express from 'express';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';
import * as adminCtrl from '../controllers/adminDashboardController.js';

const router = express.Router();

// All routes require authentication and admin role
const adminAuth = [protect, requireAdmin];

// ==================== DASHBOARD OVERVIEW ====================
router.get('/stats', adminAuth, adminCtrl.getAdminStats);
router.get('/analytics/top-items', adminAuth, adminCtrl.getTopSellingItems);
router.get('/analytics/active-canteens', adminAuth, adminCtrl.getActiveCanteens);
router.get('/analytics/user-growth', adminAuth, adminCtrl.getUserGrowth);
router.get('/analytics/order-volume', adminAuth, adminCtrl.getOrderVolumeChart);
router.get('/analytics/category-sales', adminAuth, adminCtrl.getCategorySales);

// ==================== USER MANAGEMENT ====================
router.get('/users', adminAuth, adminCtrl.getAllUsers);
router.post('/users', adminAuth, adminCtrl.createUser);
router.patch('/users/:id/status', adminAuth, adminCtrl.updateUserStatus);
router.patch('/users/:id/role', adminAuth, adminCtrl.updateUserRole);
router.get('/users/export', adminAuth, adminCtrl.exportUsers);

// ==================== CANTEEN MANAGEMENT ====================
router.get('/canteens', adminAuth, adminCtrl.getAllCanteens);
router.post('/canteens', adminAuth, adminCtrl.createCanteen);
router.patch('/canteens/:id', adminAuth, adminCtrl.updateCanteen);
router.patch('/canteens/:id/status', adminAuth, adminCtrl.updateCanteenStatus);
router.delete('/canteens/:id', adminAuth, adminCtrl.deleteCanteen);

// ==================== CATEGORY & MENU ====================
router.get('/categories', adminAuth, adminCtrl.getAllCategories);
router.post('/categories', adminAuth, adminCtrl.createCategory);
router.patch('/categories/:id', adminAuth, adminCtrl.updateCategory);
router.delete('/categories/:id', adminAuth, adminCtrl.deleteCategory);

router.get('/menu-items', adminAuth, adminCtrl.getAllMenuItems);
router.post('/menu-items', adminAuth, adminCtrl.createMenuItem);
router.patch('/menu-items/:id', adminAuth, adminCtrl.updateMenuItem);
router.delete('/menu-items/:id', adminCtrl.deleteMenuItem);

// ==================== ORDERS ====================
router.get('/orders', adminAuth, adminCtrl.getAllOrders);
router.patch('/orders/:id/status', adminAuth, adminCtrl.updateOrderStatus);
router.post('/orders/:id/refund', adminAuth, adminCtrl.refundOrder);

// ==================== PAYMENTS & TRANSACTIONS ====================
router.get('/transactions', adminAuth, adminCtrl.getAllTransactions);
router.get('/settlements', adminAuth, adminCtrl.getAllSettlements);
router.patch('/settlements/:id/approve', adminAuth, adminCtrl.approveSettlement);

// ==================== REPORTS ====================
router.get('/reports/:type', adminAuth, adminCtrl.generateReport);

// ==================== SUBSCRIPTION PLANS ====================
router.get('/plans', adminAuth, adminCtrl.getAllPlans);
router.post('/plans', adminAuth, adminCtrl.createPlan);
router.patch('/plans/:id', adminAuth, adminCtrl.updatePlan);
router.delete('/plans/:id', adminCtrl.deletePlan);

// ==================== NOTIFICATIONS ====================
router.get('/notifications', adminAuth, adminCtrl.getNotifications);
router.post('/notify/email', adminAuth, adminCtrl.sendNotification);
router.post('/notify/sms', adminAuth, adminCtrl.sendNotification);

// ==================== ADMIN SETTINGS ====================
router.get('/settings', adminAuth, adminCtrl.getAdminSettings);
router.put('/settings', adminAuth, adminCtrl.updateAdminSettings);
router.get('/settings/restaurant', adminAuth, adminCtrl.getRestaurantInfo);
router.put('/settings/restaurant', adminAuth, adminCtrl.updateRestaurantInfo);
router.get('/settings/health', adminAuth, adminCtrl.getHealthStatus);
router.put('/settings/health', adminAuth, adminCtrl.updateHealthStatus);

// ==================== SYSTEM CONFIG ====================
router.get('/config', adminAuth, adminCtrl.getSystemConfig);
router.put('/config', adminAuth, adminCtrl.updateSystemConfig);

// ==================== HEALTH & PERFORMANCE ====================
router.get('/health', adminAuth, adminCtrl.getSystemHealth);
router.get('/performance', adminAuth, adminCtrl.getPerformanceMetrics);

export default router;
