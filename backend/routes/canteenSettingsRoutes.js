import express from 'express';
import { protect } from '../middleware/auth.js';
import { requireCanteenManager } from '../middleware/rbac.js';
import * as settingsCtrl from '../controllers/canteenSettingsController.js';

const router = express.Router();

const canteenAuth = [protect, requireCanteenManager];

// Settings routes
router.get('/:canteenId/settings', canteenAuth, settingsCtrl.getCanteenSettings);
router.patch('/:canteenId/schedule', canteenAuth, settingsCtrl.updateCanteenSchedule);
router.patch('/:canteenId/status', canteenAuth, settingsCtrl.toggleCanteenStatus);
router.patch('/:canteenId/details', canteenAuth, settingsCtrl.updateCanteenDetails);

export default router;
