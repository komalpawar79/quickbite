import React, { useState, useEffect, useRef } from 'react';
import { Users, Store, ShoppingCart, DollarSign, RefreshCw, Zap } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import io from 'socket.io-client';

const DashboardOverview = () => {
  const [stats, setStats] = useState(null);
  const [topItems, setTopItems] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [orderVolume, setOrderVolume] = useState([]);
  const [categorySales, setCategorySales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);
  const socketRef = useRef(null);
  const refreshTimeoutRef = useRef(null);

  // Initialize WebSocket connection & fetch initial data
  useEffect(() => {
    fetchData();
    initializeWebSocket();
    
    // Fallback polling every 10 seconds if WebSocket fails
    const pollInterval = setInterval(() => {
      fetchData();
    }, 10000);

    return () => {
      clearInterval(pollInterval);
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // Initialize WebSocket for real-time updates
  const initializeWebSocket = () => {
    try {
      const token = localStorage.getItem('token');
      
      socketRef.current = io('http://localhost:5000', {
        auth: { token },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });

      socketRef.current.on('connect', () => {
        console.log('✅ WebSocket connected to admin dashboard');
        setIsRealtimeActive(true);
        socketRef.current.emit('authenticate', localStorage.getItem('userId'));
        socketRef.current.emit('join-admin');
      });

      // Listen for order updates
      socketRef.current.on('order-created', () => {
        console.log('🆕 New order detected - Refreshing dashboard');
        debouncedRefresh();
      });

      socketRef.current.on('order-updated', () => {
        console.log('✏️ Order updated - Refreshing dashboard');
        debouncedRefresh();
      });

      socketRef.current.on('order-completed', () => {
        console.log('✅ Order completed - Updating revenue');
        debouncedRefresh();
      });

      // Listen for menu updates
      socketRef.current.on('menu-updated', () => {
        console.log('🔄 Menu updated - Refreshing analytics');
        debouncedRefresh();
      });

      // Listen for admin dashboard broadcast events
      socketRef.current.on('dashboard-update', () => {
        console.log('📊 Dashboard update event received');
        debouncedRefresh();
      });

      socketRef.current.on('disconnect', () => {
        console.log('❌ WebSocket disconnected');
        setIsRealtimeActive(false);
      });

      socketRef.current.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  };

  // Debounced refresh to prevent too many API calls
  const debouncedRefresh = () => {
    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    refreshTimeoutRef.current = setTimeout(() => {
      fetchData();
    }, 1000); // Wait 1 second before refreshing
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching fresh data from database...');
      
      const [statsRes, topItemsRes, userGrowthRes, orderVolumeRes, categorySalesRes] = await Promise.all([
        api.get('/admin/dashboard/stats'),
        api.get('/admin/dashboard/analytics/top-items'),
        api.get('/admin/dashboard/analytics/user-growth'),
        api.get('/admin/dashboard/analytics/order-volume'),
        api.get('/admin/dashboard/analytics/category-sales')
      ]);
      
      // Handle stats - can be nested under data or direct
      const statsData = statsRes.data.data || statsRes.data;
      console.log('✅ Stats fetched:', statsData);
      setStats(statsData);

      // Handle top items
      const topItemsData = topItemsRes.data.data?.topItems || topItemsRes.data.data || topItemsRes.data?.topItems || [];
      console.log('✅ Top Items:', topItemsData);
      setTopItems(topItemsData);

      // Handle user growth
      const userGrowthData = userGrowthRes.data.data?.growth || userGrowthRes.data.data || userGrowthRes.data?.growth || [];
      console.log('✅ User Growth:', userGrowthData);
      setUserGrowth(userGrowthData);

      // Handle order volume
      const orderVolumeData = orderVolumeRes.data.data?.volume || orderVolumeRes.data.data || orderVolumeRes.data?.volume || [];
      console.log('✅ Order Volume:', orderVolumeData);
      setOrderVolume(orderVolumeData);

      // Handle category sales
      const categorySalesData = categorySalesRes.data.data?.sales || categorySalesRes.data.data || categorySalesRes.data?.sales || [];
      console.log('✅ Category Sales:', categorySalesData);
      setCategorySales(categorySalesData);

      setLastUpdated(new Date());
      console.log('📈 All dashboard data updated successfully!');
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'blue' },
    { label: 'Active Canteens', value: stats?.activeCanteens || 0, icon: Store, color: 'green' },
    { label: 'Orders Today', value: stats?.ordersToday || 0, icon: ShoppingCart, color: 'green' },
    { label: 'Revenue Today', value: `₹${(stats?.revenueToday || 0).toFixed(2)}`, icon: DollarSign, color: 'purple' }
  ];

  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f59e0b'];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold">Dashboard Overview</h2>
            {isRealtimeActive && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                <Zap size={16} className="animate-pulse" />
                Real-time Active
              </div>
            )}
          </div>
          <p className="text-gray-600 text-sm mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()}
            {isRealtimeActive && <span className="ml-2 text-green-600">🔄 Syncing...</span>}
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-4 gap-6 mb-8">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-sm">{card.label}</span>
                <Icon className={`text-${card.color}-500`} size={24} />
              </div>
              <div className="text-3xl font-bold">{card.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">User Growth (7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#f97316" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Order Volume (7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={orderVolume}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Top Selling Items</h3>
          <div className="space-y-3">
            {topItems.length > 0 ? (
              topItems.map((item, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-green-600 font-semibold">{item.totalSold} sold</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No sales data yet</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Category Sales</h3>
          {categorySales.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categorySales} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {categorySales.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>No category data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
