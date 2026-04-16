import express from 'express';
import { protect } from '../middleware/auth.js';
import { requireCanteenManager } from '../middleware/rbac.js';
import * as analyticsCtrl from '../controllers/canteenAnalyticsController.js';

const router = express.Router();

const canteenAuth = [protect, requireCanteenManager];

// Analytics routes
router.get('/:canteenId/kpis', canteenAuth, analyticsCtrl.getCanteenKPIs);
router.get('/:canteenId/popular-items', canteenAuth, analyticsCtrl.getPopularItems);
router.get('/:canteenId/revenue-chart', canteenAuth, analyticsCtrl.getRevenueChart);

export default router;
