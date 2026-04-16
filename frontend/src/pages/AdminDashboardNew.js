import React, { useState, useEffect } from 'react';
import { Users, Store, ShoppingCart, DollarSign, TrendingUp, Package, Settings, Bell, FileText, CreditCard, BarChart3, Activity, LogOut } from 'lucide-react';
import api from '../services/api';

import DashboardOverview from '../components/admin/DashboardOverview';
import UserManagement from '../components/admin/UserManagement';
import CanteenManagementTable from '../components/admin/CanteenManagementTable';
import CategoryManagementFull from '../components/admin/CategoryManagementFull';
import OrdersManagement from '../components/admin/OrdersManagement';
import SettingsComponent from '../components/admin/Settings';
import { OrderManagement, TransactionManagement, ReportsModule, SubscriptionPlans, NotificationCenter, MessagesManagement, SystemSettings, HealthMonitoring } from '../components/admin/AdminModules';
import NotificationBell from '../components/admin/NotificationBell';
import NotificationsModule from '../components/admin/NotificationsModule';
import useNotificationStore from '../store/notificationStore';

const AdminDashboardNew = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { initializeSocket, disconnectSocket } = useNotificationStore();

  useEffect(() => {
    fetchStats();
    // Initialize notification socket
    initializeSocket();

    return () => {
      disconnectSocket();
    };
  }, [initializeSocket, disconnectSocket]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'canteens', label: 'Canteens', icon: Store },
    { id: 'categories', label: 'Categories', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'transactions', label: 'Payments', icon: CreditCard },
    { id: 'messages', label: 'Messages', icon: FileText },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <DashboardOverview />;
      case 'users': return <UserManagement />;
      case 'canteens': return <CanteenManagementTable />;
      case 'categories': return <CategoryManagementFull />;
      case 'orders': return <OrdersManagement />;
      case 'transactions': return <TransactionManagement />;
      case 'messages': return <MessagesManagement />;
      case 'reports': return <ReportsModule />;
      case 'notifications': return <NotificationsModule />;
      case 'settings': return <SettingsComponent />;
      default: return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-green-600">QuickBite Admin</h1>
          <p className="text-sm text-gray-500">Platform Management</p>
        </div>
        
        <nav className="p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  activeTab === item.id
                    ? 'bg-green-50 text-green-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
        {/* Header with Notification Bell */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <NotificationBell />
            <button
              onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/login';
              }}
              className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8 scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-gray-100 overflow-y-auto flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardNew;
