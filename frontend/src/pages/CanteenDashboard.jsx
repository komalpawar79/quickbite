import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, BarChart3, Settings, LogOut } from 'lucide-react';
import useAuthStore from '../store/authStore';
import CanteenOrders from '../components/canteen/CanteenOrders';
import CanteenMenu from '../components/canteen/CanteenMenu';
import CanteenAnalytics from '../components/canteen/CanteenAnalytics';
import CanteenSettings from '../components/canteen/CanteenSettings';

const CanteenDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [canteenData, setCanteenData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout, updateUser } = useAuthStore();
  const navigate = useNavigate();

  // Fetch canteen data in real-time
  useEffect(() => {
    const fetchCanteenData = async () => {
      try {
        console.log('🔍 Fetching canteen data...');
        console.log('User canteenId:', user?.canteenId);
        
        if (user?.canteenId) {
          const response = await fetch(`http://localhost:5000/api/canteens/${user.canteenId}`);
          const data = await response.json();
          
          console.log('📦 API Response:', data);
          
          if (data.success && data.canteen) {
            console.log('✅ Canteen fetched:', data.canteen.name);
            setCanteenData(data.canteen);
            
            // Update user data with fresh canteen name
            if (data.canteen.name !== user.canteenName) {
              console.log('🔄 Updating user with new canteen name:', data.canteen.name);
              updateUser({
                ...user,
                canteenName: data.canteen.name
              });
            }
          }
        } else {
          console.warn('⚠️ No canteenId found in user:', user);
        }
        setLoading(false);
      } catch (error) {
        console.error('❌ Error fetching canteen data:', error);
        setLoading(false);
      }
    };

    fetchCanteenData();
  }, [user?.canteenId, user, updateUser]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return <CanteenOrders />;
      case 'menu':
        return <CanteenMenu />;
      case 'analytics':
        return <CanteenAnalytics />;
      case 'settings':
        return <CanteenSettings />;
      default:
        return <CanteenOrders />;
    }
  };

  // Display name - prefer fresh canteen data over user data
  const displayCanteenName = canteenData?.name || user?.canteenName || 'My Canteen';

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <motion.div 
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
        className="w-64 bg-white shadow-lg h-screen overflow-y-auto flex flex-col"
      >
        <div className="p-6 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center"
            >
              <LayoutDashboard className="text-white" size={24} />
            </motion.div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{displayCanteenName}</h1>
              <p className="text-xs text-gray-500">Manager</p>
            </div>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4 p-3 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-green-200 shadow-sm flex-shrink-0"
          >
            <p className="text-sm font-bold text-green-700">{displayCanteenName}</p>
            <p className="text-xs text-gray-600 font-medium mt-1">{user?.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
          </motion.div>

          <nav className="space-y-2 flex-1 overflow-y-auto">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === item.id
                      ? 'bg-green-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              );
            })}
          </nav>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition mt-4 flex-shrink-0"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8">
          {/* Loading State */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"
                />
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-gray-600"
                >
                  Loading dashboard...
                </motion.p>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Canteen Name Header */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-6 p-4 bg-white border-l-4 border-green-600 rounded-lg shadow-sm"
                >
                  <h2 className="text-3xl font-bold text-gray-900">{displayCanteenName}</h2>
                  <p className="text-sm text-gray-600 mt-1">Dashboard</p>
                </motion.div>

                {/* Content with smooth transitions */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderContent()}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CanteenDashboard;
