import React, { useState, useEffect } from 'react';
import { RefreshCw, Filter, Download } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
    
    // Set up real-time sync - fetch data every 20 seconds
    const interval = setInterval(() => {
      fetchOrders();
    }, 20000);

    return () => clearInterval(interval);
  }, [page, filterStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let url = `/admin/dashboard/orders?page=${page}&limit=50`;
      if (filterStatus) url += `&status=${filterStatus}`;
      
      const res = await api.get(url);
      const ordersList = res.data?.orders || [];
      setOrders(ordersList);
      setTotalPages(res.data?.pages || 1);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/admin/dashboard/orders/${orderId}/status`, { status: newStatus });
      toast.success('Order status updated!');
      fetchOrders();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleRefund = async (orderId) => {
    if (window.confirm('Are you sure you want to refund this order?')) {
      try {
        await api.post(`/admin/dashboard/orders/${orderId}/refund`);
        toast.success('Order refunded successfully!');
        fetchOrders();
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to refund order');
      }
    }
  };

  const filteredOrders = orders.filter(o =>
    (o._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    preparing: 'bg-purple-100 text-purple-800',
    ready: 'bg-green-100 text-green-800',
    completed: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const paymentStatusColors = {
    pending: 'text-yellow-600',
    completed: 'text-green-600',
    failed: 'text-red-600',
    refunded: 'text-green-600'
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold">Orders Management</h2>
          <p className="text-gray-600 text-sm mt-1">Last updated: {lastUpdated.toLocaleTimeString()}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Orders</label>
            <input
              type="text"
              placeholder="Search by ID, user name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
            >
              <option value="">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : filteredOrders.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Order ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">User</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Payment</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <p className="font-mono text-sm text-gray-900">{order._id?.slice(-8) || '-'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{order.user?.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">{order.user?.email || '-'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">₹{(order.finalAmount || 0).toFixed(2)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status || 'pending'}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border-0 ${statusColors[order.status] || statusColors.pending}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className={`text-sm font-medium ${paymentStatusColors[order.paymentStatus] || paymentStatusColors.pending}`}>
                            {(order.paymentStatus || 'pending').charAt(0).toUpperCase() + (order.paymentStatus || 'pending').slice(1)}
                          </p>
                          <p className="text-xs text-gray-500">{order.paymentMethod || '-'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                          <p className="text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {order.paymentStatus !== 'refunded' && order.status !== 'completed' && (
                            <button
                              onClick={() => handleRefund(order._id)}
                              className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                            >
                              Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <p className="text-sm text-gray-600">{filteredOrders.length} orders</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center h-64 text-gray-500">
            <p>No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersManagement;
