import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiClock, FiTruck, FiX } from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  // Fetch order data
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        console.log('📥 Fetching order:', orderId);
        
        const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch order');
        }

        const data = await response.json();
        console.log('✅ Order fetched:', data);
        setOrder(data.order || data.data?.order || data);
      } catch (error) {
        console.error('❌ Error fetching order:', error);
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    if (orderId && token) {
      fetchOrder();
    }
  }, [orderId, token]);

  // WebSocket for real-time updates
  useEffect(() => {
    if (!order) return;

    const newSocket = io('http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected');
      newSocket.emit('join-order', orderId);
    });

    newSocket.on('order-status-update', (data) => {
      console.log('🔄 Order status updated:', data);
      setOrder(prev => ({
        ...prev,
        status: data.status,
        updatedAt: new Date()
      }));
      toast.success(`Order ${data.status}!`);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [order, orderId]);

  const getStatusTimeline = (status) => {
    const allStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];
    return allStatuses.map(s => ({
      status: s,
      completed: allStatuses.indexOf(s) <= allStatuses.indexOf(status)
    }));
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      confirmed: '✓',
      preparing: '👨‍🍳',
      ready: '📦',
      completed: '🎉',
      cancelled: '❌'
    };
    return icons[status] || '📦';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Waiting for confirmation',
      confirmed: 'Order confirmed',
      preparing: 'Preparing your food',
      ready: 'Ready for pickup',
      completed: 'Order completed',
      cancelled: 'Order cancelled'
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Loading State */}
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-semibold">Loading order details...</p>
            </div>
          ) : !order ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-lg">
              <FiX className="text-6xl text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
              <p className="text-gray-600 mb-6">This order doesn't exist or you don't have access to it.</p>
              <button
                onClick={() => navigate('/menu')}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold"
              >
                Back to Menu
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">📦 Order Tracking</h1>
                <p className="text-lg text-gray-600">Order ID: <span className="font-mono font-bold text-green-600">{order._id?.slice(-8) || orderId?.slice(-8)}</span></p>
                <p className="text-sm text-gray-500 mt-1">{order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}</p>
              </div>

              {/* Status Alert */}
              {order.status === 'cancelled' && (
                <motion.div
                  className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <p className="text-red-700 font-semibold">⚠️ This order has been cancelled</p>
                </motion.div>
              )}

              {/* Status Timeline */}
              <motion.div
                className="bg-white rounded-lg shadow-lg p-8 mb-8"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Order Status</h2>

                <div className="space-y-6">
                  {getStatusTimeline(order.status).map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-6"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      {/* Step Circle */}
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl transition flex-shrink-0 ${
                          item.completed
                            ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        {getStatusIcon(item.status)}
                      </div>

                      {/* Step Info */}
                      <div className="flex-1">
                        <h3
                          className={`text-xl font-bold transition capitalize ${
                            item.completed
                              ? 'text-gray-900'
                              : 'text-gray-400'
                          }`}
                        >
                          {item.status}
                        </h3>
                        <p className={`text-sm mt-1 ${item.completed ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>
                          {item.completed ? 'Completed' : 'Waiting...'}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Order Details Grid */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {/* Estimated Time */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                      <FiClock />
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm font-semibold">Estimated Time</p>
                      <p className="text-2xl font-bold text-gray-900">{order.estimatedTime || '25'} min</p>
                    </div>
                  </div>
                </div>

                {/* Order Mode */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                      {order.orderMode === 'dine-in' ? '🍽️' : order.orderMode === 'delivery' ? '🚗' : '🛍️'}
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm font-semibold">Order Mode</p>
                      <p className="text-2xl font-bold text-gray-900 capitalize">{order.orderMode || 'dine-in'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Items Summary */}
              <motion.div
                className="bg-white rounded-lg shadow-lg p-6 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">📋 Order Items</h3>
                <div className="space-y-3 mb-4">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200">
                        <div>
                          <span className="text-gray-900 font-medium">{item.menuItem?.name || 'Item'}</span>
                          <span className="text-gray-500 ml-2">x{item.quantity}</span>
                        </div>
                        <span className="text-gray-700 font-semibold">₹{(item.price || 0) * (item.quantity || 1)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No items in order</p>
                  )}
                </div>
                
                <div className="border-t border-gray-300 pt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Subtotal</span>
                    <span className="text-gray-900 font-semibold">₹{order.totalAmount || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Tax (5%)</span>
                    <span className="text-gray-900 font-semibold">₹{order.tax || 0}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-green-600">₹{order.finalAmount || 0}</span>
                  </div>
                </div>
              </motion.div>

              {/* Canteen & Delivery Info */}
              <motion.div
                className="space-y-4 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                {/* Canteen */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center gap-4">
                    <FiMapPin className="text-3xl text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Canteen</p>
                      <p className="text-lg font-bold text-gray-900">{order.canteen?.name || 'Canteen'}</p>
                      {order.canteen?.location && (
                        <p className="text-sm text-gray-500 mt-1">{order.canteen.location}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delivery Address (if applicable) */}
                {order.orderMode === 'delivery' && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                    <div className="flex gap-4">
                      <FiTruck className="text-3xl text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-blue-900 font-semibold mb-1">Delivery Address</p>
                        <p className="text-blue-800 capitalize">{order.specialRequests || 'Your location'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Method */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <p className="text-sm text-gray-600 font-semibold mb-2">Payment Method</p>
                  <p className="text-lg font-bold text-gray-900 capitalize">{order.paymentMethod || 'Card'}</p>
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                className="flex gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <button
                  onClick={() => navigate('/orders')}
                  className="flex-1 bg-gray-200 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-300 font-semibold transition"
                >
                  My Orders
                </button>
                <button
                  onClick={() => navigate('/menu')}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold transition"
                >
                  Order More
                </button>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
