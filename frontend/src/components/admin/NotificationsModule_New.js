import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { io } from 'socket.io-client';

const NotificationsModule = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [filter, setFilter] = useState('all');
  const [deleting, setDeleting] = useState(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications?limit=50');
      setNotifications(res.notifications || []);
      setUnreadCount(res.pagination?.unread || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    newSocket.on('connect', () => {
      newSocket.emit('join-admin');
    });

    newSocket.on('new_notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      showBrowserNotification(notification);
    });

    setSocket(newSocket);
    fetchNotifications();

    return () => {
      newSocket.disconnect();
    };
  }, [fetchNotifications]);

  const showBrowserNotification = (notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('QuickBite Admin', {
        body: notification.message,
        icon: '/icon.png'
      });
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/all/read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    setDeleting(notificationId);
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    } finally {
      setDeleting(null);
    }
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'order': return '📦';
      case 'payment': return '💳';
      case 'cancel': return '❌';
      case 'alert': return '⚠️';
      default: return '📬';
    }
  };

  const getTypeBgColor = (type) => {
    switch (type) {
      case 'order': return 'bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 hover:shadow-blue-200';
      case 'payment': return 'bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 hover:shadow-green-200';
      case 'cancel': return 'bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 hover:shadow-red-200';
      case 'alert': return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-500 hover:shadow-yellow-200';
      default: return 'bg-gradient-to-r from-gray-50 to-gray-100 border-l-4 border-gray-500 hover:shadow-gray-200';
    }
  };

  const getTypeTextColor = (type) => {
    switch (type) {
      case 'order': return 'text-blue-700';
      case 'payment': return 'text-green-700';
      case 'cancel': return 'text-red-700';
      case 'alert': return 'text-yellow-700';
      default: return 'text-gray-700';
    }
  };

  const getFilterBgColor = (type) => {
    switch (type) {
      case 'order': return 'bg-blue-100 text-blue-700';
      case 'payment': return 'bg-green-100 text-green-700';
      case 'cancel': return 'bg-red-100 text-red-700';
      case 'alert': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="animate-pulse p-4 bg-gray-100 rounded-xl h-24"></div>
      ))}
    </div>
  );

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="space-y-6 p-2">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-5xl animate-bounce">🔔</span>
            <div>
              <h2 className="text-3xl font-bold">Notifications Center</h2>
              <p className="text-blue-100 text-sm mt-1">Stay updated with all system events</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{filteredNotifications.length}</div>
            <p className="text-blue-100 text-xs mt-1">Items</p>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <div className="bg-red-50 px-4 py-2 rounded-lg border border-red-200">
              <span className="text-red-600 font-semibold text-sm">
                {unreadCount} unread
              </span>
            </div>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium hover:scale-105"
          >
            ✓ Mark All as Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['all', 'order', 'payment', 'cancel', 'alert'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 whitespace-nowrap text-sm ${ 
                filter === type
                  ? `bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105`
                  : `${getFilterBgColor(type)} hover:shadow-md`
              }`}
            >
              <span className="mr-2">{type === 'all' ? '📋' : getTypeIcon(type)}</span>
              {type.charAt(0).toUpperCase() + type.slice(1)}
              {type !== 'all' && (
                <span className="ml-2 text-xs opacity-75">
                  ({notifications.filter(n => n.type === type).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3 max-h-[750px] overflow-y-auto pr-2">
        {loading ? (
          <LoadingSkeleton />
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-7xl mb-4 opacity-30">📭</div>
            <p className="text-gray-500 font-semibold text-lg">
              {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
            </p>
            <p className="text-gray-400 text-sm mt-2">Notifications will appear here as they arrive</p>
          </div>
        ) : (
          filteredNotifications.map((notification, idx) => (
            <div
              key={notification._id}
              className={`group p-4 rounded-xl transition-all duration-300 cursor-pointer transform hover:scale-102 ${getTypeBgColor(notification.type)} ${
                notification.isRead ? 'opacity-70' : 'shadow-md'
              } hover:shadow-lg ${deleting === notification._id ? 'scale-95 opacity-50' : ''}`}
              onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
              style={{
                animation: `slideInRight 0.4s ease-out ${idx * 60}ms both`
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Icon */}
                  <div className="text-4xl flex-shrink-0 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                    {getTypeIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 py-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${getFilterBgColor(notification.type)}`}>
                        {notification.type.toUpperCase()}
                      </span>
                      {!notification.isRead && (
                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                      )}
                    </div>
                    <p className={`font-semibold text-sm break-words ${notification.isRead ? 'text-gray-600' : getTypeTextColor(notification.type)}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-2.5 font-medium">
                      ⏱️ {timeAgo(notification.createdAt)} • {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Actions - Show on hover */}
                <div className="flex gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {!notification.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification._id);
                      }}
                      className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium transition-all hover:scale-110"
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notification._id);
                    }}
                    className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-all hover:scale-110"
                    disabled={deleting === notification._id}
                    title="Delete"
                  >
                    {deleting === notification._id ? '...' : '✕'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats Footer */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{notifications.length}</div>
            <p className="text-xs text-blue-600 font-medium mt-1">Total</p>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
            <p className="text-xs text-red-600 font-medium mt-1">Unread</p>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">{notifications.length - unreadCount}</div>
            <p className="text-xs text-green-600 font-medium mt-1">Read</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Custom scrollbar */
        .space-y-3::-webkit-scrollbar {
          width: 6px;
        }

        .space-y-3::-webkit-scrollbar-track {
          background: transparent;
        }

        .space-y-3::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .space-y-3::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default NotificationsModule;
