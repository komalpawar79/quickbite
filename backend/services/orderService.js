import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import Wallet from '../models/Wallet.js';
import Canteen from '../models/Canteen.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import QRCode from 'qrcode';
import mongoose from 'mongoose';

class OrderService {
  async createOrder(userId, orderData) {
    try {
      const { canteenId, items, orderMode, paymentMethod, specialRequests, deliveryAddress, tableNumber } = orderData;

      // Validation
      if (!canteenId) throw new Error('Canteen ID is required');
      if (!items || !Array.isArray(items) || items.length === 0) throw new Error('Items array is required and cannot be empty');
      if (!orderMode) throw new Error('Order mode is required');
      if (!paymentMethod) throw new Error('Payment method is required');

      console.log('Creating order with data:', { canteenId, itemsLength: items.length, orderMode, paymentMethod });

      const canteen = await Canteen.findById(canteenId);
      if (!canteen) throw new Error('Canteen not found');

      // Fetch user to get phone number
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      const userPhone = user.phone || '';

      let totalAmount = 0;
      const validatedItems = [];

      for (const item of items) {
        if (!item.menuItem) throw new Error('Menu item ID is required for each item');
        
        const menuItem = await MenuItem.findById(item.menuItem);
        if (!menuItem) throw new Error(`Menu item ${item.menuItem} not found`);
        if (!menuItem.isAvailable) throw new Error(`${menuItem.name} is not available`);

        const itemTotal = menuItem.price * item.quantity;
        totalAmount += itemTotal;

        validatedItems.push({
          menuItem: menuItem._id,
          quantity: item.quantity,
          price: menuItem.price,
          specialInstructions: item.specialInstructions || ''
        });

        menuItem.ordersCount += item.quantity;
        await menuItem.save();
      }

      const taxRate = 0.05;
      const tax = totalAmount * taxRate;
      const discount = 0;
      const finalAmount = totalAmount + tax - discount;

      if (paymentMethod === 'wallet') {
        const wallet = await Wallet.findOne({ userId });
        if (!wallet || wallet.balance < finalAmount) {
          throw new Error('Insufficient wallet balance');
        }

        wallet.balance -= finalAmount;
        wallet.totalSpent += finalAmount;
        wallet.transactions.push({
          type: 'debit',
          amount: finalAmount,
          description: 'Order payment',
          transactionId: `TXN-${Date.now()}`,
          date: new Date()
        });
        await wallet.save();
      }

      const qrData = JSON.stringify({
        orderId: new mongoose.Types.ObjectId(),
        canteen: canteenId,
        timestamp: Date.now()
      });
      const qrCode = await QRCode.toDataURL(qrData);

      const order = new Order({
        user: userId,
        canteen: canteenId,
        items: validatedItems,
        orderMode,
        totalAmount,
        discount,
        tax,
        finalAmount,
        paymentMethod,
        paymentStatus: paymentMethod === 'wallet' ? 'completed' : 'pending',
        specialRequests,
        userPhone,
        deliveryAddress,
        tableNumber,
        estimatedTime: 30,
        qrCode
      });

      await order.save();
      await order.populate('user canteen items.menuItem');

      // ✅ Create transaction record for the order payment
      const transaction = new Transaction({
        user: userId,
        order: order._id,
        type: 'order',
        amount: finalAmount,
        status: paymentMethod === 'wallet' || paymentMethod === 'upi' ? 'completed' : 'pending',
        paymentMethod,
        canteen: canteenId,
        description: `Order from ${canteen.name}`,
        paymentGatewayId: null
      });

      await transaction.save();
      console.log(`✅ Transaction created for order ${order._id}`);

      return order;
    } catch (error) {
      throw error;
    }
  }

  async updateOrderStatus(orderId, status) {
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');

    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['completed'],
      completed: [],
      cancelled: []
    };

    if (!validTransitions[order.status].includes(status)) {
      throw new Error(`Cannot transition from ${order.status} to ${status}`);
    }

    order.status = status;

    if (status === 'completed') {
      order.actualTime = Math.round((Date.now() - order.createdAt) / 60000);
    }

    await order.save();
    await order.populate('user canteen items.menuItem');
    return order;
  }

  async getUserOrders(userId, { page = 1, limit = 10, status = null }) {
    const query = { user: userId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('canteen', 'name location')
        .populate('items.menuItem', 'name price image')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query)
    ]);

    return {
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    };
  }

  async cancelOrder(orderId, userId) {
    try {
      const order = await Order.findById(orderId);
      if (!order) throw new Error('Order not found');
      if (order.user.toString() !== userId) throw new Error('Unauthorized');

      if (['completed', 'cancelled'].includes(order.status)) {
        throw new Error('Order cannot be cancelled');
      }

      if (order.paymentStatus === 'completed' && order.paymentMethod === 'wallet') {
        const wallet = await Wallet.findOne({ userId });
        if (wallet) {
          wallet.balance += order.finalAmount;
          wallet.transactions.push({
            type: 'credit',
            amount: order.finalAmount,
            description: `Refund for cancelled order`,
            orderId: order._id,
            transactionId: `REFUND-${Date.now()}`,
            date: new Date()
          });
          await wallet.save();
        }
        order.paymentStatus = 'refunded';
      }

      order.status = 'cancelled';
      await order.save();
      return order;
    } catch (error) {
      throw error;
    }
  }

  async submitFeedback(orderId, userId, { rating, comment }) {
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');
    if (order.user.toString() !== userId) throw new Error('Unauthorized');
    if (order.status !== 'completed') throw new Error('Can only rate completed orders');

    order.feedback = { rating, comment, submittedAt: new Date() };
    await order.save();

    for (const item of order.items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      if (menuItem) {
        const newReviewCount = menuItem.reviewCount + 1;
        menuItem.rating = ((menuItem.rating * menuItem.reviewCount) + rating) / newReviewCount;
        menuItem.reviewCount = newReviewCount;
        await menuItem.save();
      }
    }

    return order;
  }

  async getCanteenActiveOrders(canteenId) {
    return await Order.find({
      canteen: canteenId,
      status: { $in: ['pending', 'confirmed', 'preparing', 'ready'] }
    })
      .populate('user', 'name phone')
      .populate('items.menuItem', 'name')
      .sort({ createdAt: 1 });
  }

  async getCanteenCompletedOrders(canteenId, limit = 50) {
    try {
      const orders = await Order.find({
        canteen: canteenId,
        status: 'completed'
      })
        .populate('user', 'name phone email')
        .populate('items.menuItem', 'name price category')
        .sort({ updatedAt: -1 })
        .limit(limit);
      
      return orders;
    } catch (error) {
      console.error('Error in getCanteenCompletedOrders:', error);
      throw new Error(`Failed to fetch completed orders: ${error.message}`);
    }
  }
}

export default new OrderService();
