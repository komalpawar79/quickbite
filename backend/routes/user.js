import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Placeholder for user routes
router.get('/profile', protect, (req, res) => {
  res.json({ success: true, message: 'User profile' });
});

router.put('/preferences', protect, (req, res) => {
  res.json({ success: true, message: 'Preferences updated' });
});

export default router;
