import express from 'express';
import authController from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/setup-admin', authController.setupAdmin); // One-time admin setup

// Protected routes
router.post('/logout', auth, authController.logout);
router.get('/me', auth, authController.getMe);
router.put('/profile', auth, authController.updateProfile);

export default router;
