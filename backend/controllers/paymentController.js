import Transaction from '../models/Transaction.js';
import Order from '../models/Order.js';
import ApiResponse from '../utils/apiResponse.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Lazy-load Razorpay Instance
let razorpay = null;
const getRazorpayInstance = () => {
  if (!razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.warn('⚠️ WARNING: Razorpay keys not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env');
      throw new Error('Razorpay credentials not configured');
    }
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
  return razorpay;
};

// ✅ Initiate Payment for Order (works per canteen)
export const initiatePayment = async (req, res) => {
  try {
    const { orderId, amount, canteenId } = req.body;

    // Validate inputs
    if (!orderId || !amount || !canteenId) {
      return res.status(400).json(
        new ApiResponse(400, null, 'Missing required fields: orderId, amount, canteenId')
      );
    }

    // Get order details - populate both user and canteen
    const order = await Order.findById(orderId)
      .populate('user', 'name email phone')
      .populate('canteen', 'name');
    if (!order) {
      return res.status(404).json(new ApiResponse(404, null, 'Order not found'));
    }

    // Create Razorpay order
    const razorpayInstance = getRazorpayInstance();
    
    // Generate short receipt (max 40 chars for Razorpay)
    const shortOrderId = orderId.slice(-8); // Last 8 chars of order ID
    const timestamp = Date.now().toString().slice(-4); // Last 4 digits of timestamp
    const receipt = `ORD_${shortOrderId}_${timestamp}`.slice(0, 40); // Ensure max 40 chars
    
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: receipt,
      payment_capture: 1, // Auto-capture payment
      notes: {
        orderId: orderId,
        canteenId: canteenId,
        userId: order.user._id,
        canteenName: order.canteen?.name || 'Unknown Canteen'
      }
    });

    // Create transaction record
    const transaction = new Transaction({
      user: order.user._id,
      order: orderId,
      type: 'order',
      amount: amount,
      status: 'pending',
      paymentMethod: 'razorpay',
      canteen: canteenId,
      paymentGatewayId: razorpayOrder.id,
      paymentGatewayResponse: {
        razorpayOrderId: razorpayOrder.id,
        createdAt: new Date()
      },
      description: `Payment for Order from Canteen`
    });

    await transaction.save();

    console.log(`✅ Razorpay order created for Order ${orderId} from Canteen ${canteenId}`);
    console.log(`   Razorpay Order ID: ${razorpayOrder.id}`);
    console.log(`   Amount: ₹${amount}`);

    return res.json(new ApiResponse(200, {
      razorpayOrderId: razorpayOrder.id,
      amount: amount,
      currency: 'INR',
      transactionId: transaction._id,
      orderId: orderId,
      userEmail: order.user.email,
      userName: order.user.name,
      keyId: process.env.RAZORPAY_KEY_ID
    }, 'Razorpay order initiated successfully'));

  } catch (error) {
    console.error('❌ Payment initiation error:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      statusCode: error?.statusCode,
      stack: error?.stack?.split('\n')[0]
    });
    const errorMsg = error?.message || error?.toString?.() || 'Unknown error';
    return res.status(500).json(
      new ApiResponse(500, null, `Payment initiation failed: ${errorMsg}`)
    );
  }
};

// Verify payment (called after Razorpay payment)
export const verifyPayment = async (req, res) => {
  try {
    const { 
      razorpayOrderId, 
      razorpayPaymentId, 
      razorpaySignature, 
      orderId, 
      transactionId,
      canteenId 
    } = req.body;

    // Verify Razorpay signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpayOrderId + '|' + razorpayPaymentId);
    const generated_signature = hmac.digest('hex');

    if (generated_signature !== razorpaySignature) {
      console.error('❌ Signature mismatch for payment verification');
      return res.status(400).json(
        new ApiResponse(400, null, 'Invalid payment signature')
      );
    }

    // Find transaction
    const transaction = await Transaction.findById(transactionId)
      .populate('order', 'finalAmount canteen')
      .populate('user', 'name email');

    if (!transaction) {
      return res.status(404).json(new ApiResponse(404, null, 'Transaction not found'));
    }

    // Update transaction status
    transaction.razorpayPaymentId = razorpayPaymentId;
    transaction.razorpayOrderId = razorpayOrderId;
    transaction.status = 'completed';
    await transaction.save();

    // Update order payment status
    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus: 'completed' },
      { new: true }
    ).populate('canteen');

    console.log(`✅ Payment verified for Order ${orderId} from Canteen ${order?.canteen?.name}`);
    console.log(`   Razorpay Payment ID: ${razorpayPaymentId}`);
    console.log(`   Amount: ₹${transaction.amount}`);

    // Create and emit payment success notification
    if (global.notificationService) {
      await global.notificationService.createNotification(
        'payment',
        `✅ Payment received for Order #${orderId.toString().slice(-6).toUpperCase()} - ₹${transaction.amount}`,
        orderId,
        'Order'
      );
    }

    return res.json(new ApiResponse(200, {
      transaction,
      order
    }, 'Payment verified successfully'));
  } catch (error) {
    console.error('❌ Payment verification error:', error);
    return res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// Handle payment failure
export const handlePaymentFailure = async (req, res) => {
  try {
    const { orderId, transactionId, reason, canteenId } = req.body;

    // Find and update transaction
    const transaction = await Transaction.findByIdAndUpdate(
      transactionId,
      {
        status: 'failed',
        failureReason: reason || 'Payment failed'
      },
      { new: true }
    ).populate('canteen', 'name');

    // Update order payment status
    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus: 'failed' },
      { new: true }
    );

    console.log(`❌ Payment failed for Order ${orderId} from Canteen ${transaction?.canteen?.name}: ${reason}`);

    // Create and emit payment failure notification
    if (global.notificationService) {
      await global.notificationService.createNotification(
        'payment',
        `❌ Payment failed for Order #${orderId.toString().slice(-6).toUpperCase()} - ${reason}`,
        orderId,
        'Order'
      );
    }

    return res.json(new ApiResponse(200, {
      transaction,
      order
    }, 'Payment failure recorded'));
  } catch (error) {
    console.error('❌ Payment failure handling error:', error);
    return res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// Get transaction by order
export const getTransactionByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const transaction = await Transaction.findOne({ order: orderId })
      .populate('user', 'name email')
      .populate('order', 'finalAmount items');

    if (!transaction) {
      return res.status(404).json(new ApiResponse(404, null, 'Transaction not found'));
    }

    return res.json(new ApiResponse(200, { transaction }, 'Transaction fetched'));
  } catch (error) {
    console.error('❌ Error fetching transaction:', error);
    return res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// Create alert notification (for system errors, etc.)
export const createAlertNotification = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json(new ApiResponse(400, null, 'Message is required'));
    }

    if (global.notificationService) {
      const notification = await global.notificationService.createNotification(
        'alert',
        message,
        null,
        'User'
      );

      return res.json(new ApiResponse(200, { notification }, 'Alert notification created'));
    }

    return res.status(500).json(new ApiResponse(500, null, 'Notification service not available'));
  } catch (error) {
    console.error('❌ Error creating alert:', error);
    return res.status(500).json(new ApiResponse(500, null, error.message));
  }
};
