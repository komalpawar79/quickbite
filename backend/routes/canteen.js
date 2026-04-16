import express from 'express';
import { getAllCanteens, getCanteenById, debugMenuItems } from '../controllers/canteenController.js';

const router = express.Router();

// Get all canteens with menu items
router.get('/', getAllCanteens);

// Debug endpoint - check menu items
router.get('/debug/menu-items', debugMenuItems);

// Get canteen by ID with menu items
router.get('/:id', getCanteenById);

export default router;
