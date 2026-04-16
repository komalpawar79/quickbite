import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiCheckCircle, FiXCircle, FiPackage } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import useOrderStore from '../store/orderStore';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { orders, isLoading, fetchUserOrders, initWebSocket } = useOrderStore();

  useEffect(() => {
    if (user) {
      fetchUserOrders();
      initWebSocket();
    }
  }, [user, fetchUserOrders, initWebSocket]);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      preparing: 'bg-purple-100 text-purple-700',
      ready: 'bg-green-100 text-green-700',
      completed: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <FiClock className="text-yellow-600" />,
      confirmed: <FiCheckCircle className="text-blue-600" />,
      preparing: <FiPackage className="text-purple-600" />,
      ready: <FiCheckCircle className="text-green-600" />,
      completed: <FiCheckCircle className="text-gray-600" />,
      cancelled: <FiXCircle className="text-red-600" />
    };
    return icons[status] || <FiClock />;
  };

  const filteredOrders = orders;

  return (
    <div className="min-h-screen bg-gray-50  py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-dark  mb-8">My Orders</h1>

          {/* Orders List */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-white  rounded-lg">
              <FiPackage className="mx-auto text-6xl text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700  mb-2">
                No orders found
              </h3>
              <p className="text-gray-500 mb-6">Start ordering delicious food!</p>
              <button
                onClick={() => navigate('/menu')}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white  rounded-lg shadow-lg p-6 hover:shadow-xl transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-dark ">
                        Order #{order._id?.slice(-6)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600  mt-1">
                        {order.canteen?.name || 'Canteen'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="font-semibold capitalize">{order.status}</span>
                      </div>
                      <p className="text-xl font-bold text-green-600 mt-2">
                        ₹{order.finalAmount}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-t border-gray-200  pt-4 mb-4">
                    <h4 className="font-semibold text-gray-700  mb-2">Items:</h4>
                    <div className="space-y-2">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-600 ">
                            {item.menuItem?.name || 'Item'} x {item.quantity}
                          </span>
                          <span className="font-semibold text-gray-700 ">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    {order.status === 'pending' && (
                      <button
                        onClick={async () => {
                          if (!window.confirm('Are you sure you want to cancel this order?')) return;
                          
                          try {
                            const response = await fetch(`http://localhost:5000/api/orders/${order._id}/cancel`, {
                              method: 'PUT',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                              }
                            });

                            const data = await response.json();

                            if (!response.ok) {
                              throw new Error(data.error || 'Failed to cancel order');
                            }

                            toast.success('✅ Order cancelled successfully!');
                            // Refresh orders list
                            fetchUserOrders();
                          } catch (error) {
                            console.error('Cancel error:', error);
                            toast.error(error.message || 'Failed to cancel order');
                          }
                        }}
                        className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold transition"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MyOrdersPage;
