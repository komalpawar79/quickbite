import express from 'express';
import { protect } from '../middleware/auth.js';
import { requireCanteenManager } from '../middleware/rbac.js';
import {
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getCanteenMenu
} from '../controllers/canteenMenuController.js';

const router = express.Router();

// All routes require authentication and canteen manager role
router.use(protect, requireCanteenManager);

// Get canteen's own menu items
router.get('/menu', getCanteenMenu);

// Add menu item
router.post('/menu/add', addMenuItem);

// Update menu item
router.patch('/menu/:itemId', updateMenuItem);

// Delete menu item
router.delete('/menu/:itemId', deleteMenuItem);

export default router;
