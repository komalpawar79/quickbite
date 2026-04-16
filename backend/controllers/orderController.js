import orderService from '../services/orderService.js';
import websocketService from '../services/websocketService.js';
import ApiResponse from '../utils/apiResponse.js';
import Transaction from '../models/Transaction.js';

const createOrder = async (req, res) => {
  try {
    const userId = req.userId;
    console.log('Create order request - User ID:', userId);
    console.log('Order data:', req.body);
    
    const order = await orderService.createOrder(userId, req.body);
    
    // Fetch the transaction that was created with the order
    const transaction = await Transaction.findOne({ order: order._id })
      .populate('user', 'name email')
      .populate('order', 'finalAmount');
    
    // Emit WebSocket events
    websocketService.emitOrderUpdate(order);
    websocketService.emitOrderCreated(order); // Notify admin dashboard
    if (transaction) {
      websocketService.emitTransactionCreated(transaction); // Real-time transaction update
    }

    // Create and emit notification
    if (global.notificationService) {
      await global.notificationService.createNotification(
        'order',
        `New order received (#${order._id.toString().slice(-6).toUpperCase()})`,
        order._id,
        'Order'
      );
    }

    res.status(201).json(
      new ApiResponse(201, { order }, 'Order created successfully')
    );
  } catch (error) {
    console.error('Create order error:', {
      message: error.message,
      stack: error.stack,
      body: req.body
    });
    res.status(500).json(
      new ApiResponse(500, null, error.message || 'Failed to create order')
    );
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.userId);
    res.json(new ApiResponse(200, { order }, 'Order fetched successfully'));
  } catch (error) {
    const status = error.message === 'Order not found' ? 404 : 500;
    res.status(status).json(new ApiResponse(status, null, error.message));
  }
};

const getUserOrders = async (req, res) => {
  try {
    const { page, limit, status } = req.query;
    const result = await orderService.getUserOrders(req.userId, { page, limit, status });
    res.json(new ApiResponse(200, result, 'Orders fetched successfully'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, status);
    
    // Emit WebSocket event to user
    websocketService.emitStatusChange(
      order._id,
      order.user._id,
      order.canteen._id,
      status
    );

    // Broadcast to admin dashboard
    websocketService.emitOrderUpdatedAdmin(order);

    // If order is completed, notify admin dashboard for revenue update
    if (status === 'completed') {
      websocketService.emitOrderCompleted(order);
    }

    res.json(new ApiResponse(200, { order }, 'Order status updated'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

const submitFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const order = await orderService.submitFeedback(req.params.id, req.userId, { rating, comment });
    res.json(new ApiResponse(200, { order }, 'Feedback submitted successfully'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await orderService.cancelOrder(req.params.id, req.userId);
    
    // Emit WebSocket event
    websocketService.emitStatusChange(
      order._id,
      order.user,
      order.canteen,
      'cancelled'
    );

    // Create and emit notification
    if (global.notificationService) {
      await global.notificationService.createNotification(
        'cancel',
        `Order #${order._id.toString().slice(-6).toUpperCase()} cancelled`,
        order._id,
        'Order'
      );
    }

    res.json(new ApiResponse(200, { order }, 'Order cancelled successfully'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

const getCanteenOrders = async (req, res) => {
  try {
    const orders = await orderService.getCanteenActiveOrders(req.params.canteenId);
    res.json(new ApiResponse(200, { orders }, 'Canteen orders fetched'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

const getCanteenCompletedOrders = async (req, res) => {
  try {
    const orders = await orderService.getCanteenCompletedOrders(req.params.canteenId);
    res.json(new ApiResponse(200, { orders, success: true }));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

export default {
  createOrder,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  submitFeedback,
  cancelOrder,
  getCanteenOrders,
  getCanteenCompletedOrders
};
