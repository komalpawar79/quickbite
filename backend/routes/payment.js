import express from 'express';
import { protect } from '../middleware/auth.js';
import * as paymentCtrl from '../controllers/paymentController.js';

const router = express.Router();

// Initiate payment (create Razorpay order) - per canteen
router.post('/initiate', protect, paymentCtrl.initiatePayment);

// Verify payment after Razorpay success
router.post('/verify', protect, paymentCtrl.verifyPayment);

// Handle payment failure
router.post('/failure', protect, paymentCtrl.handlePaymentFailure);

// Get transaction by order ID
router.get('/transaction/:orderId', protect, paymentCtrl.getTransactionByOrder);

// Create alert notification (admin only)
router.post('/alert', protect, paymentCtrl.createAlertNotification);

export default router;
