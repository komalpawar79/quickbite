import Wallet from '../models/Wallet.js';
import User from '../models/User.js';

// Get wallet details
const getWallet = async (req, res) => {
  try {
    const userId = req.user.id;

    let wallet = await Wallet.findOne({ userId });

    // If wallet doesn't exist, create one
    if (!wallet) {
      wallet = new Wallet({ userId });
      await wallet.save();
    }

    res.status(200).json({
      success: true,
      wallet: {
        balance: wallet.balance,
        totalAdded: wallet.totalAdded,
        totalSpent: wallet.totalSpent,
        recentTransactions: wallet.transactions.slice(-10).reverse(),
      },
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch wallet',
    });
  }
};

// Add money to wallet
const addMoney = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, paymentMethod } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount. Please add at least ₹1',
      });
    }

    if (amount > 100000) {
      return res.status(400).json({
        success: false,
        error: 'Maximum limit is ₹100,000 per transaction',
      });
    }

    let wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      wallet = new Wallet({ userId });
    }

    // In real scenario, process payment here
    // For now, we'll add directly (assume payment is verified)

    wallet.balance += amount;
    wallet.totalAdded += amount;

    wallet.transactions.push({
      type: 'credit',
      amount,
      description: `Money added via ${paymentMethod || 'Online'}`,
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date(),
    });

    await wallet.save();

    res.status(200).json({
      success: true,
      message: `₹${amount} added to wallet successfully!`,
      wallet: {
        balance: wallet.balance,
        totalAdded: wallet.totalAdded,
        totalSpent: wallet.totalSpent,
      },
    });
  } catch (error) {
    console.error('Add money error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to add money',
    });
  }
};

// Use wallet for payment
const useWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, orderId, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount',
      });
    }

    let wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found',
      });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({
        success: false,
        error: `Insufficient balance. You have ₹${wallet.balance}`,
        availableBalance: wallet.balance,
      });
    }

    wallet.balance -= amount;
    wallet.totalSpent += amount;

    wallet.transactions.push({
      type: 'debit',
      amount,
      description: description || 'Order payment',
      orderId,
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date(),
    });

    await wallet.save();

    res.status(200).json({
      success: true,
      message: `₹${amount} deducted from wallet`,
      wallet: {
        balance: wallet.balance,
        totalAdded: wallet.totalAdded,
        totalSpent: wallet.totalSpent,
      },
    });
  } catch (error) {
    console.error('Use wallet error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to use wallet',
    });
  }
};

// Get wallet transactions
const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, skip = 0 } = req.query;

    let wallet = await Wallet.findOne({ userId }).populate('transactions.orderId');

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found',
      });
    }

    const allTransactions = wallet.transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(skip, skip + parseInt(limit));

    res.status(200).json({
      success: true,
      transactions: allTransactions,
      totalTransactions: wallet.transactions.length,
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch transactions',
    });
  }
};

// Refund money to wallet
const refundToWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, reason, orderId } = req.body;

    let wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      wallet = new Wallet({ userId });
    }

    wallet.balance += amount;
    wallet.totalAdded += amount;

    wallet.transactions.push({
      type: 'credit',
      amount,
      description: `Refund: ${reason}`,
      orderId,
      transactionId: `REFUND-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date(),
    });

    await wallet.save();

    res.status(200).json({
      success: true,
      message: `₹${amount} refunded to wallet`,
      wallet: {
        balance: wallet.balance,
        totalAdded: wallet.totalAdded,
        totalSpent: wallet.totalSpent,
      },
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process refund',
    });
  }
};

// Check wallet balance
const checkBalance = async (req, res) => {
  try {
    const userId = req.user.id;

    let wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      wallet = new Wallet({ userId });
      await wallet.save();
    }

    res.status(200).json({
      success: true,
      balance: wallet.balance,
      isActive: wallet.isActive,
    });
  } catch (error) {
    console.error('Check balance error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to check balance',
    });
  }
};

export default {
  getWallet,
  addMoney,
  useWallet,
  getTransactions,
  refundToWallet,
  checkBalance,
};
