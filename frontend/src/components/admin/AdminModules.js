import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import io from 'socket.io-client';
import toast from 'react-hot-toast';

// Category Management
export const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/admin/dashboard/categories');
      setCategories(res.data?.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const addCategory = async (e) => {
    e.preventDefault();
    await api.post('/admin/dashboard/categories', { name });
    setName('');
    fetchCategories();
  };

  const deleteCategory = async (id) => {
    await api.delete(`/admin/dashboard/categories/${id}`);
    fetchCategories();
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Category Management</h2>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <form onSubmit={addCategory} className="flex gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            className="flex-1 px-4 py-2 border rounded-lg"
            required
          />
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
            Add Category
          </button>
        </form>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div key={cat._id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
            <span className="font-medium">{cat.name}</span>
            <button onClick={() => deleteCategory(cat._id)} className="text-red-600 hover:text-red-800">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Order Management
export const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/admin/dashboard/orders', { params: { page, limit: 20 } });
      setOrders(res.data?.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    }
  };

  const updateStatus = async (id, status) => {
    await api.patch(`/admin/dashboard/orders/${id}/status`, { status });
    fetchOrders();
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Order Management</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Canteen</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="px-6 py-4 text-sm">{order._id.slice(-8)}</td>
                <td className="px-6 py-4">{order.user?.name}</td>
                <td className="px-6 py-4 font-semibold text-blue-600">{order.userPhone || 'N/A'}</td>
                <td className="px-6 py-4">{order.canteen?.name}</td>
                <td className="px-6 py-4">₹{order.finalAmount}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    className="px-2 py-1 border rounded text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Transaction Management
export const TransactionManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, totalAmount: 0 });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchTransactions();
    
    // Connect to WebSocket for real-time updates
    const socketInstance = io('http://localhost:5000', {
      query: { room: 'admin-dashboard' }
    });

    socketInstance.on('connect', () => {
      console.log('✅ Connected to WebSocket for real-time updates');
    });

    socketInstance.on('transaction-created', (transactionData) => {
      console.log('💳 New transaction received:', transactionData);
      // Add new transaction to the top of the list
      setTransactions(prev => [
        {
          _id: transactionData._id,
          user: { name: transactionData.user?.name || 'Unknown' },
          type: transactionData.type,
          amount: transactionData.amount,
          status: transactionData.status,
          createdAt: transactionData.createdAt
        },
        ...prev
      ]);
      // Update stats
      updateStats([{
        _id: transactionData._id,
        user: { name: transactionData.user?.name || 'Unknown' },
        type: transactionData.type,
        amount: transactionData.amount,
        status: transactionData.status,
        createdAt: transactionData.createdAt
      }, ...transactions]);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard/transactions?limit=100');
      const transactionData = res.data?.transactions || [];
      setTransactions(transactionData);
      updateStats(transactionData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (transactionData) => {
    const total = transactionData.length;
    const completed = transactionData.filter(t => t.status === 'completed').length;
    const pending = transactionData.filter(t => t.status === 'pending').length;
    const totalAmount = transactionData.reduce((sum, t) => sum + (t.amount || 0), 0);
    
    setStats({ total, completed, pending, totalAmount });
  };

  // Filter transactions by selected date
  const getFilteredTransactions = () => {
    if (!selectedDate) return transactions;
    return transactions.filter(txn => {
      const txnDate = new Date(txn.createdAt).toISOString().split('T')[0];
      return txnDate === selectedDate;
    });
  };

  const filteredTransactions = getFilteredTransactions();
  const filteredTotal = filteredTransactions.length;
  const filteredAmount = filteredTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Payment & Transactions</h2>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <p className="text-blue-600 text-sm font-semibold">Total Transactions</p>
          <p className="text-3xl font-bold text-blue-800">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <p className="text-green-600 text-sm font-semibold">Completed</p>
          <p className="text-3xl font-bold text-green-800">{stats.completed}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
          <p className="text-yellow-600 text-sm font-semibold">Pending</p>
          <p className="text-3xl font-bold text-yellow-800">{stats.pending}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <p className="text-purple-600 text-sm font-semibold">Total Amount</p>
          <p className="text-3xl font-bold text-purple-800">₹{stats.totalAmount}</p>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <p className="text-green-700 text-sm">
          🔄 Real-time updates enabled - {transactions.length} transactions loaded {loading && '(Loading...)'}
        </p>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-lg shadow p-6 mb-6 border border-gray-200">
        <div className="flex items-center gap-4">
          <label className="text-sm font-semibold text-gray-700">Filter by Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          />
          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium transition"
          >
            Today
          </button>
        </div>
      </div>

      {/* Filtered Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
          <p className="text-indigo-600 text-sm font-semibold">Transactions on {selectedDate}</p>
          <p className="text-3xl font-bold text-indigo-800">{filteredTotal}</p>
        </div>
        <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-lg p-4 border border-rose-200">
          <p className="text-rose-600 text-sm font-semibold">Total Amount on {selectedDate}</p>
          <p className="text-3xl font-bold text-rose-800">₹{filteredAmount}</p>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                    <span className="text-gray-600">Loading transactions...</span>
                  </div>
                </td>
              </tr>
            ) : filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  No transactions on {selectedDate}
                </td>
              </tr>
            ) : (
              filteredTransactions.map((txn) => (
                <tr key={txn._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-medium">{txn._id.slice(-8)}</td>
                  <td className="px-6 py-4">{txn.user?.name || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      txn.type === 'order' ? 'bg-blue-100 text-blue-800' :
                      txn.type === 'refund' ? 'bg-red-100 text-red-800' :
                      txn.type === 'wallet_recharge' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {txn.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      txn.paymentMethod === 'cash' ? 'bg-green-100 text-green-800' :
                      txn.paymentMethod === 'card' ? 'bg-blue-100 text-blue-800' :
                      txn.paymentMethod === 'upi' ? 'bg-purple-100 text-purple-800' :
                      txn.paymentMethod === 'wallet' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      <span className="capitalize">{txn.paymentMethod || 'unknown'}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold">₹{txn.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      txn.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      txn.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{new Date(txn.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Reports Module
export const ReportsModule = () => {
  const [reportType, setReportType] = useState('orders');
  const [format, setFormat] = useState('csv');
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const reports = [
    {
      id: 'orders',
      icon: '📦',
      name: 'Orders Report',
      description: 'Complete overview of all orders with details like Order ID, items, amount, payment method & status',
      color: 'bg-blue'
    },
    {
      id: 'revenue',
      icon: '💰',
      name: 'Revenue Report',
      description: 'Daily & monthly revenue trends with breakdown by payment method (COD vs UPI)',
      color: 'bg-green'
    },
    {
      id: 'payment',
      icon: '🧾',
      name: 'Payment Report',
      description: 'All payment transactions with status, method, and transaction IDs',
      color: 'bg-purple'
    },
    {
      id: 'top-items',
      icon: '🍔',
      name: 'Top Selling Items',
      description: 'Most popular menu items by order frequency and revenue generated',
      color: 'bg-yellow'
    },
    {
      id: 'user-activity',
      icon: '👥',
      name: 'Customer Report',
      description: 'User engagement metrics including total users, repeat customers & orders per user',
      color: 'bg-indigo'
    },
    {
      id: 'cancelled',
      icon: '❌',
      name: 'Cancelled / Failed Orders',
      description: 'Cancellations and failed payments with reasons for operational insights',
      color: 'bg-red'
    }
  ];

  const generateReport = async () => {
    try {
      setLoading(true);
      
      if (!startDate || !endDate) {
        alert('Please select both start and end dates');
        return;
      }

      if (new Date(startDate) > new Date(endDate)) {
        alert('Start date must be before end date');
        return;
      }

      console.log(`📊 Generating ${reportType} report...`);
      console.log(`📅 Date range: ${startDate} to ${endDate}`);
      console.log(`📁 Format: ${format}`);

      const params = {
        format,
        startDate,
        endDate
      };

      const res = await api.get(`/admin/dashboard/reports/${reportType}`, {
        params,
        responseType: 'blob'
      });

      console.log('✅ Response received:', {
        status: res.status,
        contentType: res.headers['content-type'],
        dataType: typeof res.data,
        dataSize: res.data.size
      });

      // Check if response is actually a Blob
      if (!(res.data instanceof Blob)) {
        throw new Error(`Invalid response format. Expected Blob, got ${typeof res.data}`);
      }

      // res.data is already a Blob - use it directly!
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      const fileName = `${reportType}-report-${startDate}_to_${endDate}.${format}`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      
      console.log(`📥 Downloading file: ${fileName}`);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Download completed!');
    } catch (error) {
      console.error('❌ Report error:', error);
      alert('Error generating report: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const currentReport = reports.find(r => r.id === reportType);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl font-bold mb-2">📊 Reports & Downloads</h2>
        <p className="text-gray-600">Generate comprehensive business reports and download data in multiple formats</p>
      </div>

      {/* Report Type Selection */}
      <div>
        <h3 className="text-2xl font-bold mb-4">Select Report Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map(report => (
            <button
              key={report.id}
              onClick={() => setReportType(report.id)}
              className={`p-4 rounded-lg border-2 transition text-left ${
                reportType === report.id
                  ? 'border-green-600 bg-green-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="text-3xl mb-2">{report.icon}</div>
              <h4 className="font-bold text-gray-900 mb-1">{report.name}</h4>
              <p className="text-xs text-gray-600">{report.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Report Configuration */}
      <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-600">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span>{currentReport?.icon}</span>
          {currentReport?.name} - Configure & Download
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: Date Range */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-gray-700">📅 Date Range</label>
            <div className="space-y-3 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                📌 Selected: {startDate} to {endDate}
              </p>
            </div>
          </div>

          {/* Column 2: Format Selection */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-gray-700">💾 Download Format</label>
            <div className="space-y-2">
              {[
                { value: 'csv', label: '📄 CSV (.csv)', desc: 'Universal format' },
                { value: 'json', label: '📋 JSON (.json)', desc: 'Raw data' }
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFormat(opt.value)}
                  className={`w-full text-left p-3 rounded-lg transition border-2 font-medium ${
                    format === opt.value
                      ? 'border-purple-600 bg-purple-50 text-purple-800'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div>{opt.label}</div>
                  <div className="text-xs text-gray-500 font-normal">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Column 3: Summary */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              📋 Report Summary
            </h4>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-600 font-semibold">Report Type</p>
                <p className="text-sm font-bold text-gray-900">{currentReport?.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold">Date Range</p>
                <p className="text-sm font-bold text-gray-900">{startDate} to {endDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold">Format</p>
                <p className="text-sm font-bold text-gray-900">{format.toUpperCase()}</p>
              </div>
              <button
                onClick={generateReport}
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold flex items-center justify-center gap-2 transition"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <span>⬇️ Download Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Download Help Section */}
      <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
          <span>💡</span> About This Report
        </h3>
        <p className="text-blue-800 text-sm leading-relaxed">
          {currentReport?.description} This data will be exported in your selected format and includes all relevant
          information for analysis, record-keeping, and stakeholder reporting.
        </p>
      </div>

      {/* Footer Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl mb-2">📥</div>
          <p className="text-sm font-semibold text-gray-700">CSV Export</p>
          <p className="text-xs text-gray-600">For data analysis</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl mb-2">📊</div>
          <p className="text-sm font-semibold text-gray-700">Excel Export</p>
          <p className="text-xs text-gray-600">Professional use</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl mb-2">📋</div>
          <p className="text-sm font-semibold text-gray-700">JSON Export</p>
          <p className="text-xs text-gray-600">For developers</p>
        </div>
      </div>
    </div>
  );
};

// Subscription Plans
export const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await api.get('/admin/dashboard/plans');
      setPlans(res.data?.plans || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      setPlans([]);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Subscription Plans</h2>
      <div className="grid grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan._id} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
            <p className="text-3xl font-bold text-green-600 mb-4">₹{plan.price}</p>
            <ul className="space-y-2 text-sm">
              {plan.features?.map((f, i) => <li key={i}>✓ {f}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

// Notification Center
export const NotificationCenter = () => {
  const [type, setType] = useState('email');
  const [message, setMessage] = useState('');

  const sendNotification = async (e) => {
    e.preventDefault();
    await api.post('/admin/dashboard/notify/email', { type, message, recipients: [] });
    setMessage('');
    alert('Notification sent!');
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Notification Center</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={sendNotification}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-4 py-2 border rounded-lg">
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              rows="4"
              required
            />
          </div>
          <button type="submit" className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
            Send Notification
          </button>
        </form>
      </div>
    </div>
  );
};

// Messages Management
export const MessagesManagement = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [reply, setReply] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await api.get('/messages', { params: { status: filter === 'all' ? undefined : filter } });
      console.log('Messages API response:', res);
      setMessages(res.data?.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (messageId) => {
    if (!reply.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    try {
      await api.put(`/messages/${messageId}/reply`, { reply });
      toast.success('Reply sent successfully!');
      setReply('');
      setSelectedMessage(null);
      fetchMessages();
    } catch (error) {
      toast.error('Failed to send reply');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await api.delete(`/messages/${messageId}`);
        toast.success('Message deleted');
        fetchMessages();
      } catch (error) {
        toast.error('Failed to delete message');
      }
    }
  };

  const handleToggleStar = async (messageId) => {
    try {
      await api.put(`/messages/${messageId}/star`);
      fetchMessages();
    } catch (error) {
      toast.error('Failed to update message');
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Messages & Inquiries</h2>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        {['all', 'new', 'read', 'replied'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === status
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 text-lg">No messages found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  onClick={() => setSelectedMessage(msg)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${
                    selectedMessage?._id === msg._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  } ${msg.status === 'new' ? 'bg-yellow-50' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{msg.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          msg.status === 'new' ? 'bg-yellow-100 text-yellow-800' :
                          msg.status === 'read' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {msg.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{msg.email}</p>
                      <p className="text-sm font-medium text-gray-800 mt-1">{msg.subject}</p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{msg.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStar(msg._id);
                      }}
                      className="text-2xl"
                    >
                      {msg.isStarred ? '⭐' : '☆'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message Detail and Reply */}
          {selectedMessage && (
            <div className="bg-white rounded-lg shadow p-6 lg:col-span-1">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Message Details</h3>
                <button
                  onClick={() => handleDeleteMessage(selectedMessage._id)}
                  className="text-red-600 hover:text-red-800 text-sm font-semibold"
                >
                  Delete
                </button>
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b">
                <div>
                  <p className="text-xs text-gray-600 font-semibold">FROM</p>
                  <p className="font-semibold text-gray-900">{selectedMessage.name}</p>
                  <p className="text-sm text-gray-600">{selectedMessage.email}</p>
                  {selectedMessage.phone && (
                    <p className="text-sm text-gray-600">📱 {selectedMessage.phone}</p>
                  )}
                </div>

                <div>
                  <p className="text-xs text-gray-600 font-semibold">SUBJECT</p>
                  <p className="font-semibold text-gray-900">{selectedMessage.subject}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-600 font-semibold">MESSAGE</p>
                  <p className="text-gray-800 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>

                {selectedMessage.reply && (
                  <div className="bg-green-50 p-3 rounded">
                    <p className="text-xs text-green-700 font-semibold mb-2">YOUR REPLY:</p>
                    <p className="text-gray-800">{selectedMessage.reply}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Replied on {new Date(selectedMessage.repliedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {selectedMessage.status !== 'replied' && (
                <div>
                  <label className="block text-sm font-semibold mb-2">Send Reply:</label>
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type your reply here..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
                    rows="4"
                  />
                  <button
                    onClick={() => handleReply(selectedMessage._id)}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold transition"
                  >
                    Send Reply
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// System Settings
export const SystemSettings = () => {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">System Settings</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">System configuration options will be displayed here.</p>
      </div>
    </div>
  );
};

// Health Monitoring
export const HealthMonitoring = () => {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await api.get('/admin/dashboard/health');
      setHealth(res.data?.health || null);
    } catch (error) {
      console.error('Error fetching health:', error);
      setHealth(null);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Platform Health</h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">System Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="text-green-600 font-semibold">{health?.status}</span>
            </div>
            <div className="flex justify-between">
              <span>Database:</span>
              <span className="text-green-600 font-semibold">{health?.database}</span>
            </div>
            <div className="flex justify-between">
              <span>Uptime:</span>
              <span className="font-semibold">{Math.floor(health?.uptime / 60)} min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;
