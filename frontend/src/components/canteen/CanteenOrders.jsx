import React, { useEffect, useState } from 'react';
import useCanteenOrderStore from '../../store/canteenOrderStore';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const CanteenOrders = () => {
  const { user } = useAuthStore();
  const { newOrders, activeOrders, completedOrders, loading, fetchNewOrders, fetchActiveOrders, fetchCompletedOrders, setupWebSocket, updateStatus } = useCanteenOrderStore();
  const [statusFilter, setStatusFilter] = useState('pending');

  useEffect(() => {
    if (user?.canteenId) {
      // Initial fetch
      fetchNewOrders(user.canteenId);
      fetchActiveOrders(user.canteenId);
      fetchCompletedOrders(user.canteenId);
      
      // Setup WebSocket for real-time updates
      setupWebSocket(user.canteenId);
      
      // Periodic refresh
      const interval = setInterval(() => {
        fetchNewOrders(user.canteenId);
        fetchActiveOrders(user.canteenId);
        fetchCompletedOrders(user.canteenId);
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await updateStatus(orderId, status);
      toast.success('Order status updated!');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const OrderCard = ({ order }) => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold">Order #{order._id.slice(-6)}</h3>
          <p className="text-sm text-gray-600 font-medium">{order.user?.name}</p>
          {order.userPhone && (
            <p className="text-sm font-semibold text-blue-600 mt-1">📱 {order.userPhone}</p>
          )}
          {order.deliveryAddress && (
            <div className="mt-2 flex items-start gap-2 text-sm bg-blue-50 p-2 rounded">
              <span className="text-lg">📍</span>
              <div>
                <p className="text-gray-700 font-semibold">Delivery Location:</p>
                <p className="text-gray-600">{order.deliveryAddress}</p>
              </div>
            </div>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
          order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
          order.status === 'preparing' ? 'bg-purple-100 text-purple-700' :
          order.status === 'ready' ? 'bg-green-100 text-green-700' :
          order.status === 'completed' ? 'bg-gray-100 text-gray-700' :
          'bg-red-100 text-red-700'
        }`}>{order.status}</span>
      </div>
      
      {/* Items Section */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-semibold text-gray-700">Items</h4>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
              {order.orderMode === 'dine-in' && '🍽️ Dine-In'}
              {order.orderMode === 'takeaway' && '🛍️ Takeaway'}
              {order.orderMode === 'delivery' && '🚚 Delivery'}
            </span>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
              {order.paymentMethod === 'upi' && '📱 UPI'}
              {order.paymentMethod === 'cash' && '💵 Cash'}
              {order.paymentMethod === 'card' && '💳 Card'}
              {order.paymentMethod === 'wallet' && '👛 Wallet'}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          {order.items?.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm">
              <span className="text-gray-700">{item.menuItem?.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-gray-600">x {item.quantity}</span>
                <span className="font-semibold text-gray-800 min-w-[60px] text-right">Rs.{item.price * item.quantity}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Total Section */}
      <div className="bg-green-50 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-gray-800">Total</span>
          <span className="text-xl font-bold text-green-600">Rs.{order.finalAmount}</span>
        </div>
      </div>
      <div className="flex gap-2">
        {order.status === 'pending' && (
          <>
            <button onClick={() => handleStatusUpdate(order._id, 'confirmed')} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg">Accept</button>
            <button onClick={() => handleStatusUpdate(order._id, 'cancelled')} className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg">Reject</button>
          </>
        )}
        {order.status === 'confirmed' && (
          <button onClick={() => handleStatusUpdate(order._id, 'preparing')} className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg">Start Preparing</button>
        )}
        {order.status === 'preparing' && (
          <button onClick={() => handleStatusUpdate(order._id, 'ready')} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg">Mark Ready</button>
        )}
        {order.status === 'ready' && (
          <button onClick={() => handleStatusUpdate(order._id, 'completed')} className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg">Complete</button>
        )}
      </div>
    </div>
  );

  const allOrders = [...newOrders, ...activeOrders, ...completedOrders];
  const filteredOrders = allOrders.filter(order => order.status === statusFilter);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Order Management</h2>
      
      {/* Status Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${
              statusFilter === status
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">
          {`${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Orders`}
          {filteredOrders.length > 0 && <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full ml-2">{filteredOrders.length}</span>}
        </h3>
        {loading ? <div className="text-center py-8">Loading...</div> : filteredOrders.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center"><p className="text-gray-600">No orders found</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => <OrderCard key={order._id} order={order} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default CanteenOrders;
