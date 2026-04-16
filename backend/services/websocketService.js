import { Server } from 'socket.io';

class WebSocketService {
  constructor() {
    this.io = null;
    this.userSockets = new Map();
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      socket.on('authenticate', (userId) => {
        this.userSockets.set(userId, socket.id);
        socket.userId = userId;
        console.log(`User ${userId} authenticated`);
      });

      socket.on('join-canteen', (canteenId) => {
        socket.join(`canteen-${canteenId}`);
        console.log(`Socket ${socket.id} joined canteen-${canteenId}`);
      });

      socket.on('join-order', (orderId) => {
        socket.join(`order-${orderId}`);
        console.log(`Socket ${socket.id} joined order room for order-${orderId}`);
      });

      socket.on('join-admin', () => {
        socket.join('admin-dashboard');
        console.log(`Socket ${socket.id} joined admin-dashboard`);
      });

      socket.on('disconnect', () => {
        if (socket.userId) {
          this.userSockets.delete(socket.userId);
        }
        console.log(`Client disconnected: ${socket.id}`);
      });
    });

    return this.io;
  }

  emitOrderUpdate(order) {
    if (!this.io) return;

    // Notify user
    const userSocketId = this.userSockets.get(order.user.toString());
    if (userSocketId) {
      this.io.to(userSocketId).emit('order-update', {
        orderId: order._id,
        status: order.status,
        estimatedTime: order.estimatedTime,
        message: this.getStatusMessage(order.status)
      });
    }

    // Notify canteen staff
    this.io.to(`canteen-${order.canteen}`).emit('new-order', {
      orderId: order._id,
      items: order.items,
      orderMode: order.orderMode,
      status: order.status
    });
  }

  emitStatusChange(orderId, userId, canteenId, status) {
    if (!this.io) return;

    // Emit to specific order room (for order tracking page)
    this.io.to(`order-${orderId}`).emit('order-status-update', {
      orderId,
      status,
      message: this.getStatusMessage(status),
      timestamp: new Date()
    });

    // Emit to user's personal socket
    const userSocketId = this.userSockets.get(userId.toString());
    if (userSocketId) {
      this.io.to(userSocketId).emit('status-changed', {
        orderId,
        status,
        message: this.getStatusMessage(status),
        timestamp: new Date()
      });
    }

    // Emit to canteen staff
    this.io.to(`canteen-${canteenId}`).emit('order-status-updated', {
      orderId,
      status
    });
  }

  emitWalletUpdate(userId, balance, transaction) {
    if (!this.io) return;

    const userSocketId = this.userSockets.get(userId.toString());
    if (userSocketId) {
      this.io.to(userSocketId).emit('wallet-update', {
        balance,
        transaction
      });
    }
  }

  getStatusMessage(status) {
    const messages = {
      pending: 'Order received! Waiting for confirmation',
      confirmed: 'Order confirmed! Preparing your food',
      preparing: 'Your order is being prepared',
      ready: 'Order ready for pickup!',
      completed: 'Order completed. Enjoy your meal!',
      cancelled: 'Order has been cancelled'
    };
    return messages[status] || 'Order status updated';
  }

  // Broadcast order creation to admin dashboard
  emitOrderCreated(order) {
    if (!this.io) return;
    this.io.to('admin-dashboard').emit('order-created', {
      orderId: order._id,
      canteen: order.canteen,
      total: order.total || order.finalAmount,
      status: order.status,
      timestamp: new Date()
    });
    console.log('🎯 Broadcasting order-created to admin dashboard');
  }

  // Broadcast order updates to admin dashboard in real-time
  emitOrderUpdatedAdmin(order) {
    if (!this.io) return;
    this.io.to('admin-dashboard').emit('order-updated', {
      orderId: order._id,
      status: order.status,
      timestamp: new Date()
    });
    console.log('🔄 Broadcasting order-updated to admin dashboard');
  }

  // Broadcast order completion to admin dashboard
  emitOrderCompleted(order) {
    if (!this.io) return;
    this.io.to('admin-dashboard').emit('order-completed', {
      orderId: order._id,
      revenue: order.finalAmount || order.total,
      status: order.status,
      timestamp: new Date()
    });
    console.log('✅ Broadcasting order-completed to admin dashboard');
  }

  // Broadcast transaction to admin dashboard (real-time)
  emitTransactionCreated(transaction) {
    if (!this.io) return;
    this.io.to('admin-dashboard').emit('transaction-created', {
      _id: transaction._id,
      user: transaction.user,
      type: transaction.type,
      amount: transaction.amount,
      status: transaction.status,
      paymentMethod: transaction.paymentMethod,
      createdAt: transaction.createdAt,
      timestamp: new Date()
    });
    console.log('💳 Broadcasting transaction-created to admin dashboard');
  }

  // Broadcast menu updates to admin dashboard
  emitMenuUpdated(canteenId, data) {
    if (!this.io) return;
    this.io.to('admin-dashboard').emit('menu-updated', {
      canteenId,
      data,
      timestamp: new Date()
    });
    console.log('🔄 Broadcasting menu-updated to admin dashboard');
  }

  // Emit menu item added to canteen room (for real-time updates)
  emitMenuItemAdded(canteenId, item) {
    if (!this.io) return;
    this.io.to(`canteen-${canteenId}`).emit('menu-item-added', {
      canteenId,
      item,
      timestamp: new Date()
    });
    this.io.to('admin-dashboard').emit('menu-updated', {
      canteenId,
      event: 'item-added',
      item,
      timestamp: new Date()
    });
    console.log(`➕ Menu item added to canteen ${canteenId}`);
  }

  // Emit menu item updated to canteen room (for real-time updates)
  emitMenuItemUpdated(canteenId, item) {
    if (!this.io) return;
    this.io.to(`canteen-${canteenId}`).emit('menu-updated', {
      canteenId,
      item,
      event: 'item-updated',
      timestamp: new Date()
    });
    this.io.to('admin-dashboard').emit('menu-updated', {
      canteenId,
      event: 'item-updated',
      item,
      timestamp: new Date()
    });
    console.log(`✏️ Menu item updated in canteen ${canteenId}`);
  }

  // Emit menu item deleted to canteen room (for real-time updates)
  emitMenuItemDeleted(canteenId, itemId) {
    if (!this.io) return;
    this.io.to(`canteen-${canteenId}`).emit('menu-item-deleted', {
      canteenId,
      itemId,
      timestamp: new Date()
    });
    this.io.to('admin-dashboard').emit('menu-updated', {
      canteenId,
      event: 'item-deleted',
      itemId,
      timestamp: new Date()
    });
    console.log(`🗑️ Menu item deleted from canteen ${canteenId}`);
  }

  // General dashboard update broadcast
  emitDashboardUpdate(eventType, data) {
    if (!this.io) return;
    this.io.to('admin-dashboard').emit('dashboard-update', {
      eventType,
      data,
      timestamp: new Date()
    });
    console.log(`📊 Broadcasting ${eventType} to admin dashboard`);
  }
}

export default new WebSocketService();
