/**
 * WebSocket Handler - Real-time Updates
 */

import jwt from 'jsonwebtoken';

export const initializeSocket = (io) => {
  // Middleware to authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`[Socket] User ${socket.userId} connected`);

    // Join user-specific room
    socket.join(`user-${socket.userId}`);

    // Join role-based rooms
    if (socket.userRole === 'admin') {
      socket.join('admin-room');
    }
    if (socket.userRole === 'canteen_manager') {
      socket.join('canteen-manager-room');
    }
    if (socket.userRole === 'staff') {
      socket.join('staff-room');
    }

    // Listen for order tracking
    socket.on('join-order-tracking', (orderId) => {
      socket.join(`order-${orderId}`);
      console.log(`[Socket] User ${socket.userId} joined order tracking: ${orderId}`);
    });

    // Listen for canteen updates
    socket.on('join-canteen', (canteenId) => {
      socket.join(`canteen-${canteenId}`);
      console.log(`[Socket] User ${socket.userId} joined canteen: ${canteenId}`);
    });

    // Listen for live inventory updates
    socket.on('join-inventory-updates', () => {
      socket.join('inventory-updates');
      console.log(`[Socket] User ${socket.userId} joined inventory updates`);
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      console.log(`[Socket] User ${socket.userId} disconnected`);
    });

    // Error handler
    socket.on('error', (error) => {
      console.error(`[Socket Error] User ${socket.userId}:`, error);
    });
  });

  return io;
};

/**
 * Emit order status update to all users watching the order
 */
export const emitOrderStatusUpdate = (io, orderId, order) => {
  io.to(`order-${orderId}`).emit('order-status-updated', {
    orderId,
    status: order.status,
    estimatedTime: order.estimatedTime,
    lastUpdated: new Date()
  });

  // Also notify the user
  io.to(`user-${order.userId}`).emit('my-order-updated', {
    orderId,
    status: order.status
  });

  // Notify canteen managers
  if (order.canteen) {
    io.to(`canteen-${order.canteen}`).emit('order-status-update', {
      orderId,
      status: order.status,
      order: order,
      lastUpdated: new Date()
    });
  }
};

/**
 * Emit new order notification to admin/canteen managers
 */
export const emitNewOrderNotification = (io, order) => {
  io.to('admin-room').emit('new-order', {
    orderId: order._id,
    totalAmount: order.finalAmount,
    items: order.items,
    timestamp: new Date()
  });

  if (order.canteenId) {
    io.to('canteen-manager-room').emit('canteen-order', {
      orderId: order._id,
      canteenId: order.canteenId,
      totalAmount: order.finalAmount,
      items: order.items,
      timestamp: new Date()
    });
  }
};

/**
 * Emit low stock alert
 */
export const emitLowStockAlert = (io, itemName, currentStock, threshold, canteenId) => {
  io.to('admin-room').emit('low-stock-alert', {
    itemName,
    currentStock,
    threshold,
    canteenId,
    timestamp: new Date()
  });

  io.to('canteen-manager-room').emit('inventory-alert', {
    itemName,
    currentStock,
    threshold,
    timestamp: new Date()
  });
};

/**
 * Emit menu item update
 */
export const emitMenuItemUpdate = (io, itemId, updatedItem, action = 'updated') => {
  io.emit('menu-item-' + action, {
    itemId,
    item: updatedItem,
    timestamp: new Date(),
    action // 'created', 'updated', 'deleted'
  });
};

/**
 * Emit inventory update
 */
export const emitInventoryUpdate = (io, itemId, newStock, itemName) => {
  io.to('inventory-updates').emit('inventory-changed', {
    itemId,
    newStock,
    itemName,
    timestamp: new Date()
  });

  io.to('admin-room').emit('admin-inventory-update', {
    itemId,
    newStock,
    itemName
  });
};

/**
 * Emit admin activity to admin dashboard
 */
export const emitAdminActivity = (io, activity) => {
  io.to('admin-room').emit('admin-activity', {
    userId: activity.userId,
    action: activity.action,
    entity: activity.entity,
    entityId: activity.entityId,
    timestamp: new Date()
  });
};

/**
 * Emit payment update
 */
export const emitPaymentUpdate = (io, userId, paymentStatus, orderId) => {
  io.to(`user-${userId}`).emit('payment-updated', {
    orderId,
    paymentStatus,
    timestamp: new Date()
  });
};

/**
 * Emit live dashboard stats
 */
export const emitDashboardStats = (io, stats) => {
  io.to('admin-room').emit('dashboard-stats', {
    totalOrders: stats.totalOrders,
    totalRevenue: stats.totalRevenue,
    activeOrders: stats.activeOrders,
    lowStockItems: stats.lowStockItems,
    timestamp: new Date()
  });
};

/**
 * Broadcast notification to specific user
 */
export const notifyUser = (io, userId, notificationType, message) => {
  io.to(`user-${userId}`).emit('notification', {
    type: notificationType, // 'info', 'success', 'warning', 'error'
    message,
    timestamp: new Date()
  });
};

/**
 * Broadcast to all connected clients
 */
export const broadcastToAll = (io, eventName, data) => {
  io.emit(eventName, {
    ...data,
    timestamp: new Date()
  });
};

/**
 * Get connected users count
 */
export const getConnectedUsersCount = (io) => {
  return io.engine.clientsCount;
};

/**
 * Get users in specific room
 */
export const getUsersInRoom = (io, roomName) => {
  return io.sockets.adapter.rooms.get(roomName)?.size || 0;
};
