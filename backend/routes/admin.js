import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getDashboardStats,
  getPeakHourData,
  getWeeklyRevenue,
  getTopItems,
  getLiveOrders,
  getMenuItems,
  getLowStockAlerts,
  getStaff,
  getCoupons,
  getCategoryDistribution,
  updateOrderStatus,
  addMenuItem
} from '../controllers/adminController.js';

const router = express.Router();

// Dashboard stats
router.get('/dashboard/stats', protect, getDashboardStats);
router.get('/dashboard/peak-hours', protect, getPeakHourData);
router.get('/dashboard/weekly-revenue', protect, getWeeklyRevenue);
router.get('/dashboard/top-items', protect, getTopItems);
router.get('/dashboard/live-orders', protect, getLiveOrders);
router.get('/dashboard/menu-items', protect, getMenuItems);
router.get('/dashboard/low-stock', protect, getLowStockAlerts);
router.get('/dashboard/staff', protect, getStaff);
router.get('/dashboard/coupons', protect, getCoupons);
router.get('/dashboard/category-distribution', protect, getCategoryDistribution);

// Order management
router.put('/orders/:orderId/status', protect, updateOrderStatus);

// Menu management
router.post('/menu/add', protect, addMenuItem);

export default router;
