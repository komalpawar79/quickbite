import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiTrendingUp, FiUsers, FiShoppingCart, FiMenu, FiBox, FiLogOut, FiDownload, FiPlus, FiEdit, FiTrash2, FiAlertCircle, FiClock, FiChevronDown } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // ============= STATE FOR REAL DATA =============
  const [stats, setStats] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [liveOrders, setLiveOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [staff, setStaff] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Menu form states
  const [menuFormData, setMenuFormData] = useState({
    name: '',
    price: '',
    category: 'lunch',
    description: ''
  });

  const API_BASE_URL = 'http://localhost:5000/api';

  // ✅ Auth Guard - Only admins can access
  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'admin') {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // ============= FETCH DATA FROM BACKEND =============
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchDashboardData();
    }
  }, [isAuthenticated, user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch all dashboard data in parallel
      const [statsRes, peakHoursRes, weeklyRevRes, topItemsRes, liveOrdersRes, menuItemsRes, lowStockRes, staffRes, couponsRes, categoryRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/dashboard/stats`, { headers }),
        fetch(`${API_BASE_URL}/admin/dashboard/peak-hours`, { headers }),
        fetch(`${API_BASE_URL}/admin/dashboard/weekly-revenue`, { headers }),
        fetch(`${API_BASE_URL}/admin/dashboard/top-items`, { headers }),
        fetch(`${API_BASE_URL}/admin/dashboard/live-orders`, { headers }),
        fetch(`${API_BASE_URL}/admin/dashboard/menu-items`, { headers }),
        fetch(`${API_BASE_URL}/admin/dashboard/low-stock`, { headers }),
        fetch(`${API_BASE_URL}/admin/dashboard/staff`, { headers }),
        fetch(`${API_BASE_URL}/admin/dashboard/coupons`, { headers }),
        fetch(`${API_BASE_URL}/admin/dashboard/category-distribution`, { headers })
      ]);

      const statsData = await statsRes.json();
      const peakHoursData = await peakHoursRes.json();
      const weeklyRevData = await weeklyRevRes.json();
      const topItemsData = await topItemsRes.json();
      const liveOrdersData = await liveOrdersRes.json();
      const menuItemsData = await menuItemsRes.json();
      const lowStockData = await lowStockRes.json();
      const staffData = await staffRes.json();
      const couponsData = await couponsRes.json();
      const categoryData = await categoryRes.json();

      // Update state with fetched data
      if (statsData.success) setStats(statsData.data.stats);
      if (peakHoursData.success) setSalesData(peakHoursData.data.salesData);
      if (weeklyRevData.success) setRevenueData(weeklyRevData.data.revenueData);
      if (topItemsData.success) setTopItems(topItemsData.data.topItems);
      if (liveOrdersData.success) setLiveOrders(liveOrdersData.data.liveOrders);
      if (menuItemsData.success) setMenuItems(menuItemsData.data.menuItems);
      if (lowStockData.success) setLowStockAlerts(lowStockData.data.alerts);
      if (staffData.success) setStaff(staffData.data.staff);
      if (couponsData.success) setCoupons(couponsData.data.coupons);
      if (categoryData.success) setCategoryDistribution(categoryData.data.categoryData);

      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handler to add menu item
  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    
    if (!menuFormData.name || !menuFormData.price) {
      alert('Please fill name and price');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Get first canteen ID (or you can add canteen selector)
      const canteenRes = await fetch(`${API_BASE_URL}/canteens`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const canteenData = await canteenRes.json();
      const canteenId = canteenData.canteens?.[0]?._id || '1';

      const response = await fetch(`${API_BASE_URL}/menu`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...menuFormData,
          canteen: canteenId
        })
      });

      const data = await response.json();
      
      if (data.success || response.status === 201) {
        // Add to local state
        setMenuItems([...menuItems, data.data.item]);
        
        // Reset form
        setMenuFormData({
          name: '',
          price: '',
          category: 'lunch',
          description: ''
        });
        setShowAddMenu(false);
        
        alert('Menu item added successfully!');
      } else {
        alert('Error adding menu item: ' + data.message);
      }
    } catch (err) {
      console.error('Error adding menu item:', err);
      alert('Failed to add menu item');
    }
  };

  // Handler to delete menu item
  const handleDeleteMenuItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/menu/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      
      if (data.success || response.status === 200) {
        setMenuItems(menuItems.filter(item => item.id !== itemId && item._id !== itemId));
        alert('Menu item deleted successfully!');
      } else {
        alert('Error deleting menu item');
      }
    } catch (err) {
      console.error('Error deleting menu item:', err);
      alert('Failed to delete menu item');
    }
  };

  // ============= UI COMPONENTS =============
  const getIcon = (iconName) => {
    const icons = {
      ShoppingCart: <FiShoppingCart />,
      TrendingUp: <FiTrendingUp />,
      Box: <FiBox />,
      Users: <FiUsers />
    };
    return icons[iconName] || <FiBox />;
  };

  const StatCard = ({ stat }) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className="bg-white border border-gray-200 p-6 rounded-xl shadow-soft hover:shadow-md transition-all"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 text-sm font-semibold">{stat.label}</p>
          <p className="text-3xl font-bold text-primary-900 mt-2">{stat.value}</p>
          <p className="text-green-600 text-sm mt-2 font-semibold">{stat.change}</p>
        </div>
        <div className={`text-3xl p-3 rounded-lg ${stat.color === 'primary' ? 'bg-primary-100 text-primary-600' : 'bg-secondary-100 text-secondary-600'}`}>
          {getIcon(stat.icon)}
        </div>
      </div>
    </motion.div>
  );

  const StatusBadge = ({ status }) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Preparing': 'bg-blue-100 text-blue-800',
      'Ready': 'bg-green-100 text-green-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Active': 'bg-green-100 text-green-800',
      'Inactive': 'bg-gray-100 text-gray-800',
      'Present': 'bg-green-100 text-green-800',
      'Absent': 'bg-red-100 text-red-800',
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
  };

  // ============= SECTIONS =============
  const OverviewSection = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900 mx-auto mb-4"></div>
            <p className="text-gray-600 font-semibold">Loading dashboard...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-semibold">Error loading dashboard: {error}</p>
          <button onClick={fetchDashboardData} className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Retry
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <StatCard key={i} stat={stat} />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Peak Hour Traffic */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-6 rounded-xl shadow-soft border border-gray-200"
          >
            <h3 className="text-lg font-bold text-dark mb-4">Peak Hour Traffic</h3>
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="time" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="orders" stroke="#d99a27" strokeWidth={2} dot={{ fill: '#d99a27' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-600 text-center py-8">No data available</p>
            )}
          </motion.div>

          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-6 rounded-xl shadow-soft border border-gray-200"
          >
            <h3 className="text-lg font-bold text-dark mb-4">Weekly Revenue</h3>
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#d99a27" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="target" fill="#cbd5e1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-600 text-center py-8">No data available</p>
            )}
          </motion.div>
        </div>

        {/* Top Items & Live Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Items */}
          <motion.div className="bg-white p-6 rounded-xl shadow-soft border border-gray-200">
            <h3 className="text-lg font-bold text-dark mb-4">🏆 Top 5 Items</h3>
            <div className="space-y-3">
              {topItems.length > 0 ? (
                topItems.map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition">
                    <div>
                      <p className="font-semibold text-dark">{item.name}</p>
                      <p className="text-xs text-gray-600">{item.orders} orders • ₹{item.revenue.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary-900">{item.stock} left</p>
                      <p className="text-xs text-gray-500">{item.category}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center py-4">No top items data</p>
              )}
            </div>
          </motion.div>

          {/* Low Stock Alerts */}
          <motion.div className="bg-white p-6 rounded-xl shadow-soft border border-gray-200">
            <h3 className="text-lg font-bold text-dark mb-4">⚠️ Low Stock Alerts</h3>
            <div className="space-y-3">
              {lowStockAlerts.length > 0 ? (
                lowStockAlerts.map((alert, i) => (
                  <div key={i} className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                    <FiAlertCircle className="text-red-600 mr-3 flex-shrink-0" size={20} />
                    <div className="flex-1">
                      <p className="font-semibold text-red-900">{alert.item}</p>
                      <p className="text-xs text-red-700">Stock: {alert.stock}{alert.unit} (Min: {alert.minLevel}{alert.unit})</p>
                    </div>
                    <button className="ml-2 px-3 py-1 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700">Order</button>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center py-4">No low stock items</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Live Orders */}
        <motion.div className="bg-white p-6 rounded-xl shadow-soft border border-gray-200">
          <h3 className="text-lg font-bold text-dark mb-4">📱 Live Orders</h3>
          {liveOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-primary-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-dark">Order ID</th>
                    <th className="px-4 py-3 text-left font-semibold text-dark">Student</th>
                    <th className="px-4 py-3 text-left font-semibold text-dark">Items</th>
                    <th className="px-4 py-3 text-left font-semibold text-dark">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-dark">Time Left</th>
                  </tr>
                </thead>
                <tbody>
                  {liveOrders.map((order, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-semibold text-primary-900">{order.id}</td>
                      <td className="px-4 py-3 text-gray-900">{order.student}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{order.items}</td>
                      <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                      <td className="px-4 py-3 text-gray-600"><FiClock className="inline mr-1" size={14} />{order.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 text-center py-4">No live orders</p>
          )}
        </motion.div>
      </div>
    );
  };

  const MenuManagementSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-dark">Menu Management</h3>
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition"
        >
          <FiPlus /> Add Menu Item
        </button>
      </div>

      {showAddMenu && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-soft border border-gray-200 space-y-4"
        >
          <form onSubmit={handleAddMenuItem}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Item Name (e.g., Paneer Butter Masala)"
                value={menuFormData.name}
                onChange={(e) => setMenuFormData({...menuFormData, name: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-dark"
                required
              />
              <input
                type="number"
                placeholder="Price (₹)"
                value={menuFormData.price}
                onChange={(e) => setMenuFormData({...menuFormData, price: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-dark"
                required
              />
              <select
                value={menuFormData.category}
                onChange={(e) => setMenuFormData({...menuFormData, category: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-dark"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="snacks">Snacks</option>
                <option value="beverages">Beverages</option>
                <option value="desserts">Desserts</option>
                <option value="special">Special</option>
              </select>
            </div>
            <textarea
              placeholder="Description"
              value={menuFormData.description}
              onChange={(e) => setMenuFormData({...menuFormData, description: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-dark"
              rows="2"
            />
            <button type="submit" className="w-full px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition">
              Add Item
            </button>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.length > 0 ? (
          menuItems.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white p-6 rounded-xl shadow-soft border border-gray-200 hover:shadow-md transition"
            >
              <div className="text-5xl mb-3">{item.image || '🍽️'}</div>
              <h4 className="font-bold text-dark">{item.name}</h4>
              <p className="text-sm text-gray-600 mb-2">{item.category}</p>
              <div className="flex justify-between items-center mb-3">
                <span className="text-lg font-bold text-primary-900">₹{item.price}</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded ${item.stock > 20 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {item.stock} in stock
                </span>
              </div>
              <div className="flex space-x-2">
                <button className="flex-1 px-3 py-2 bg-secondary-100 text-secondary-700 rounded hover:bg-secondary-200 text-sm font-semibold flex items-center justify-center gap-1 transition">
                  <FiEdit size={14} /> Edit
                </button>
                <button
                  onClick={() => handleDeleteMenuItem(item.id || item._id)}
                  className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-semibold flex items-center justify-center gap-1 transition"
                >
                  <FiTrash2 size={14} /> Delete
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-gray-600 col-span-3 text-center py-8">No menu items available</p>
        )}
      </div>
    </div>
  );

  const OrderManagementSection = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-dark ">Order Management</h3>
      <motion.div className="bg-white  p-6 rounded-lg shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-green-100 ">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Order ID</th>
                <th className="px-4 py-3 text-left font-semibold">Student</th>
                <th className="px-4 py-3 text-left font-semibold">Items</th>
                <th className="px-4 py-3 text-left font-semibold">Amount</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {liveOrders.map((order, i) => (
                <tr key={i} className="border-b  hover:bg-green-50 :bg-green-900/10">
                  <td className="px-4 py-3 font-semibold text-green-600">{order.id}</td>
                  <td className="px-4 py-3">{order.student}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 ">{order.items}</td>
                  <td className="px-4 py-3 font-semibold">₹350</td>
                  <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700">Print</button>
                      <button className="px-3 py-1 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700">Cancel</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );

  const InventorySection = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-dark ">Inventory & Stock Control</h3>
      
      {/* Stock Alerts */}
      <motion.div className="bg-white  p-6 rounded-lg shadow-soft">
        <h4 className="text-lg font-bold text-dark  mb-4">⚠️ Critical Stock Alerts</h4>
        <div className="space-y-3">
          {lowStockAlerts.map((alert, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-red-50  border border-red-200  rounded-lg">
              <div>
                <p className="font-bold text-red-900 ">{alert.item}</p>
                <p className="text-sm text-red-700 ">Current Stock: {alert.stock}{alert.unit}</p>
              </div>
              <button className="px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700">Place Order</button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Inventory Table */}
      <motion.div className="bg-white  p-6 rounded-lg shadow-soft">
        <h4 className="text-lg font-bold text-dark  mb-4">📦 Stock Levels</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-green-100 ">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Item</th>
                <th className="px-4 py-2 text-left font-semibold">Current Stock</th>
                <th className="px-4 py-2 text-left font-semibold">Min Level</th>
                <th className="px-4 py-2 text-left font-semibold">Status</th>
                <th className="px-4 py-2 text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {topItems.map((item, i) => (
                <tr key={i} className="border-b ">
                  <td className="px-4 py-3 font-semibold">{item.name}</td>
                  <td className="px-4 py-3">{item.stock} kg</td>
                  <td className="px-4 py-3">20 kg</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.stock > 20 ? 'Active' : 'Critical'} />
                  </td>
                  <td className="px-4 py-3">
                    <button className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">Update</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );

  const StaffManagementSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-dark ">Staff Management</h3>
        <button className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">
          <FiPlus /> Add Staff
        </button>
      </div>

      <motion.div className="bg-white  p-6 rounded-lg shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-green-100 ">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Name</th>
                <th className="px-4 py-3 text-left font-semibold">Role</th>
                <th className="px-4 py-3 text-left font-semibold">Shift</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Performance</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.length > 0 ? (
                staff.map((member, i) => (
                  <tr key={i} className="border-b  hover:bg-green-50 :bg-green-900/10">
                    <td className="px-4 py-3 font-semibold">{member.name}</td>
                    <td className="px-4 py-3 text-sm">{member.role}</td>
                    <td className="px-4 py-3 text-sm">{member.shift}</td>
                    <td className="px-4 py-3"><StatusBadge status={member.status} /></td>
                    <td className="px-4 py-3 font-bold text-yellow-600">⭐ {member.performance.toFixed(1)}</td>
                    <td className="px-4 py-3">
                      <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">Edit</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-3 text-center text-gray-600">No staff members</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );

  const AnalyticsSection = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-dark">Analytics & Reports</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Analysis */}
        <motion.div className="bg-white p-6 rounded-xl shadow-soft border border-gray-200">
          <h4 className="text-lg font-bold text-dark mb-4">Revenue vs Target</h4>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#d99a27" />
                <Bar dataKey="target" fill="#cbd5e1" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-600 text-center py-8">No data available</p>
          )}
        </motion.div>

        {/* Category Distribution */}
        <motion.div className="bg-white p-6 rounded-xl shadow-soft border border-gray-200">
          <h4 className="text-lg font-bold text-dark mb-4">Veg vs Non-Veg Orders</h4>
          {categoryDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryDistribution} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name} ${value}%`} outerRadius={80} fill="#d99a27" dataKey="value">
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-600 text-center py-8">No data available</p>
          )}
        </motion.div>
      </div>

      {/* Reports */}
      <motion.div className="bg-white p-6 rounded-xl shadow-soft border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-lg font-bold text-dark">📊 Reports</h4>
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition">
            <FiDownload /> Export
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-primary-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-primary-900">₹1,34,730</p>
            <p className="text-xs text-green-600 mt-1">↑ 12% from last week</p>
          </div>
          <div className="p-4 bg-secondary-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold text-secondary-900">1,456</p>
            <p className="text-xs text-green-600 mt-1">↑ 8% from last week</p>
          </div>
          <div className="p-4 bg-primary-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Avg Order Value</p>
            <p className="text-2xl font-bold text-primary-900">₹92.50</p>
            <p className="text-xs text-green-600 mt-1">↑ 5% from last week</p>
          </div>
          <div className="p-4 bg-secondary-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Active Users</p>
            <p className="text-2xl font-bold text-secondary-900">856</p>
            <p className="text-xs text-green-600 mt-1">↑ 3% from last week</p>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const CouponsSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-dark">Offers & Coupons</h3>
        <button
          onClick={() => setShowAddCoupon(!showAddCoupon)}
          className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition"
        >
          <FiPlus /> Create Coupon
        </button>
      </div>

      {showAddCoupon && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-soft border border-gray-200 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Coupon Code (e.g., SAVE20)" className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-dark" />
            <select className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-dark">
              <option>Percentage Discount</option>
              <option>Flat Discount</option>
            </select>
            <input type="number" placeholder="Discount Value" className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-dark" />
            <input type="date" className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-dark" />
          </div>
          <button className="w-full px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition">Create Coupon</button>
        </motion.div>
      )}

      <motion.div className="bg-white p-6 rounded-xl shadow-soft border border-gray-200">
        <div className="space-y-4">
          {coupons.length > 0 ? (
            coupons.map((coupon, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-primary-50 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-bold text-dark text-lg">{coupon.code}</p>
                  <p className="text-sm text-gray-600">{coupon.type} • {coupon.discount} off</p>
                  <p className="text-xs text-gray-500 mt-1">Usage: {coupon.usage}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={coupon.status} />
                  <div className="mt-2 flex space-x-2">
                    <button className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded text-xs hover:bg-secondary-200 transition">Edit</button>
                    <button className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition">Delete</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600 text-center py-8">No coupons available</p>
          )}
        </div>
      </motion.div>
    </div>
  );

  const SettingsSection = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-dark">Settings & Configuration</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Canteen Settings */}
        <motion.div className="bg-white p-6 rounded-xl shadow-soft border border-gray-200">
          <h4 className="text-lg font-bold text-dark mb-4">🏢 Canteen Settings</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Canteen Name</label>
              <input type="text" defaultValue="Main Canteen" className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-dark" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Operating Hours</label>
              <div className="grid grid-cols-2 gap-2">
                <input type="time" defaultValue="08:00" className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-dark" />
                <input type="time" defaultValue="21:00" className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-dark" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tax Rate (%)</label>
              <input type="number" defaultValue="5" className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-dark" />
            </div>
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition">Save Changes</button>
          </div>
        </motion.div>

        {/* Notification Settings */}
        <motion.div className="bg-white p-6 rounded-xl shadow-soft border border-gray-200">
          <h4 className="text-lg font-bold text-dark mb-4">🔔 Notifications</h4>
          <div className="space-y-3">
            <label className="flex items-center p-3 bg-primary-50 rounded-lg cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600" />
              <span className="ml-3 font-semibold text-dark">New Order Alerts</span>
            </label>
            <label className="flex items-center p-3 bg-secondary-50 rounded-lg cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-secondary-600" />
              <span className="ml-3 font-semibold text-dark">Low Stock Alerts</span>
            </label>
            <label className="flex items-center p-3 bg-primary-50 rounded-lg cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-primary-600" />
              <span className="ml-3 font-semibold text-dark">Daily Reports</span>
            </label>
          </div>
        </motion.div>
      </div>
    </div>
  );

  // ✅ If not authenticated or not admin, show loading while redirecting
  if (!isAuthenticated || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50  flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600  font-semibold">Checking admin access...</p>
        </div>
      </div>
    );
  }

  // ============= MAIN RENDER =============
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.div
        animate={{ width: sidebarOpen ? 280 : 0 }}
        className="bg-gradient-to-b from-green-50 to-white text-slate-900 overflow-hidden border-r border-green-200"
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold">🍽️ QuickBite</h2>
          <p className="text-slate-600 text-sm">Admin Panel</p>
        </div>

        <nav className="mt-8 space-y-2 px-4">
          {[
            { id: 'overview', label: 'Dashboard', icon: '📊' },
            { id: 'menu', label: 'Menu Mgmt', icon: '🍜' },
            { id: 'orders', label: 'Orders', icon: '📦' },
            { id: 'inventory', label: 'Inventory', icon: '📦' },
            { id: 'staff', label: 'Staff', icon: '👥' },
            { id: 'analytics', label: 'Analytics', icon: '📈' },
            { id: 'coupons', label: 'Coupons', icon: '🎫' },
            { id: 'settings', label: 'Settings', icon: '⚙️' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition ${
                activeTab === item.id
                  ? 'bg-green-600 text-white'
                  : 'text-slate-900 hover:bg-green-100'
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 shadow-soft">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <FiMenu className="text-2xl text-dark" />
              </button>
              <h1 className="text-2xl font-bold text-dark">Admin Dashboard</h1>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold">
                  A
                </div>
                <span className="text-sm font-semibold text-dark">Admin</span>
                <FiChevronDown className={`transition ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-dark">Administrator</p>
                    <p className="text-xs text-gray-600">admin@quickbite.com</p>
                  </div>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50 transition text-dark font-semibold text-sm">
                    Profile Settings
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50 transition text-dark font-semibold text-sm">
                    Change Password
                  </button>
                  <hr className="my-2" />
                  <button
                    onClick={() => {
                      // Logout logic
                      navigate('/login');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 transition text-red-600 font-semibold text-sm flex items-center space-x-2 group"
                  >
                    <FiLogOut size={16} />
                    <span>Logout</span>
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-gray-100">
          {activeTab === 'overview' && <OverviewSection />}
          {activeTab === 'menu' && <MenuManagementSection />}
          {activeTab === 'orders' && <OrderManagementSection />}
          {activeTab === 'inventory' && <InventorySection />}
          {activeTab === 'staff' && <StaffManagementSection />}
          {activeTab === 'analytics' && <AnalyticsSection />}
          {activeTab === 'coupons' && <CouponsSection />}
          {activeTab === 'settings' && <SettingsSection />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
