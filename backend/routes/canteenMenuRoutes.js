import express from 'express';
import { protect } from '../middleware/auth.js';
import { requireCanteenManager } from '../middleware/rbac.js';
import * as menuCtrl from '../controllers/canteenMenuController.js';

const router = express.Router();

const canteenAuth = [protect, requireCanteenManager];

// Menu management routes
router.get('/:canteenId/menu', canteenAuth, menuCtrl.getCanteenMenu);
router.post('/:canteenId/menu', canteenAuth, menuCtrl.addMenuItem);
router.patch('/menu/:itemId', canteenAuth, menuCtrl.updateMenuItem);
router.patch('/menu/:itemId/toggle', canteenAuth, menuCtrl.toggleItemAvailability);
router.delete('/menu/:itemId', canteenAuth, menuCtrl.deleteMenuItem);

export default router;
