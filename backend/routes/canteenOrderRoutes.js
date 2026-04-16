import express from 'express';
import { protect } from '../middleware/auth.js';
import { requireCanteenManager } from '../middleware/rbac.js';
import * as orderCtrl from '../controllers/canteenOrderController.js';

const router = express.Router();

const canteenAuth = [protect, requireCanteenManager];

// Order management routes
router.get('/:canteenId/orders/new', canteenAuth, orderCtrl.getNewOrders);
router.get('/:canteenId/orders/active', canteenAuth, orderCtrl.getActiveOrders);
router.get('/:canteenId/orders', canteenAuth, orderCtrl.getAllCanteenOrders);
router.patch('/orders/:orderId/status', canteenAuth, orderCtrl.updateOrderStatus);

export default router;
