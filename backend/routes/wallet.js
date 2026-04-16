import express from 'express';
import walletController from '../controllers/walletController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// All wallet routes require authentication
router.use(auth);

// Get wallet details
router.get('/balance', walletController.getWallet);

// Check balance
router.get('/check', walletController.checkBalance);

// Get transactions
router.get('/transactions', walletController.getTransactions);

// Add money to wallet
router.post('/add-money', walletController.addMoney);

// Use wallet for payment
router.post('/pay', walletController.useWallet);

// Refund to wallet
router.post('/refund', walletController.refundToWallet);

export default router;
