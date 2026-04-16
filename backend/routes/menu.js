import express from 'express';
import MenuItem from '../models/MenuItem.js';
import Canteen from '../models/Canteen.js';
import { protect } from '../middleware/auth.js';
import {
  getMenuByCanteen,
  getMenuItemById,
  searchMenu,
  getRecommendations,
  getAllMenuItems,
  getMenuByCategory,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem
} from '../controllers/menuController.js';

const router = express.Router();

/**
 * GET /api/menu
 * Get all menu items (real database, no sample data)
 */
router.get('/', getAllMenuItems);

/**
 * GET /api/menu/search?q=<query>&canteenId=<optional>
 * Search menu items by name, description, or tags
 */
router.get('/search', searchMenu);

/**
 * GET /api/menu/category/:category
 * Get menu items by category
 */
router.get('/category/:category', getMenuByCategory);

/**
 * GET /api/menu/canteen/:canteenId
 * Get menu items for specific canteen with filters and sorting
 * Query params: cuisine, dietary, category, sortBy (price|rating|popular|newest)
 */
router.get('/canteen/:canteenId', getMenuByCanteen);

/**
 * GET /api/menu/recommendations/:canteenId
 * Get top recommended items for a canteen
 */
router.get('/recommendations/:canteenId', getRecommendations);

/**
 * POST /api/menu
 * Add new menu item (admin/manager only)
 */
router.post('/', protect, addMenuItem);

/**
 * PUT /api/menu/:id
 * Update menu item (admin/manager only)
 */
router.put('/:id', protect, updateMenuItem);

/**
 * DELETE /api/menu/:id
 * Delete menu item (admin/manager only)
 */
router.delete('/:id', protect, deleteMenuItem);

/**
 * GET /api/menu/:id
 * Get specific menu item by ID
 */
router.get('/:id', getMenuItemById);

export default router;
