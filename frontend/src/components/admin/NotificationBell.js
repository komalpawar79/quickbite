import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { io } from 'socket.io-client';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const dropdownRef = useRef(null);

  // Fetch recent notifications
  const fetchRecentNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications?limit=10');
      setNotifications(res.notifications || []);
      setUnreadCount(res.pagination?.unread || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize Socket.IO
  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    newSocket.on('connect', () => {
      newSocket.emit('join-admin');
    });

    // Real-time notification listener
    newSocket.on('new_notification', (notification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 9)]);
      setUnreadCount(prev => prev + 1);
      playNotificationSound();
    });

    setSocket(newSocket);
    fetchRecentNotifications();

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Play notification sound
  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj==');
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  const handleMarkAsRead = async (e, notificationId) => {
    e.stopPropagation();
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleDelete = async (e, notificationId) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

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
      case 'order': return 'bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500';
      case 'payment': return 'bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500';
      case 'cancel': return 'bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-500';
      case 'alert': return 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-l-4 border-yellow-500';
      default: return 'bg-gradient-to-br from-gray-50 to-gray-100 border-l-4 border-gray-500';
    }
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'order': return 'bg-blue-500';
      case 'payment': return 'bg-green-500';
      case 'cancel': return 'bg-red-500';
      case 'alert': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const LoadingSkeleton = () => (
    <div className="space-y-3 p-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="animate-pulse flex gap-3">
          <div className="h-10 w-10 bg-gray-300 rounded-lg flex-shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-300 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
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
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`relative p-2.5 rounded-xl transition-all duration-300 transform ${
          showDropdown
            ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg scale-110'
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md'
        }`}
        title="Notifications"
      >
        <span className="text-2xl">🔔</span>

        {unreadCount > 0 && (
          <>
            <span className={`absolute -top-1 -right-1 ${getTypeBadgeColor('order')} text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center text-white animate-bounce shadow-lg`}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
            <span className="absolute top-0 right-0 inline-flex h-3 w-3 animate-ping rounded-full bg-red-500 opacity-75"></span>
          </>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-gradient-to-r from-green-600 via-green-500 to-green-700 text-white p-5 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-bounce">🔔</span>
              <div>
                <h3 className="font-bold text-lg">Notifications</h3>
                <p className="text-xs opacity-90">Stay updated in real-time</p>
              </div>
            </div>
            {unreadCount > 0 && (
              <span className="bg-white bg-opacity-25 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {loading ? (
              <LoadingSkeleton />
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-6xl mb-3 opacity-40">📭</div>
                <p className="text-gray-500 font-medium">No notifications yet</p>
                <p className="text-xs text-gray-400 mt-1">Your notifications will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification, idx) => (
                  <div
                    key={notification._id}
                    className={`p-4 transition-all duration-300 hover:shadow-inner cursor-pointer group ${getTypeBgColor(notification.type)} ${
                      notification.isRead ? 'opacity-70' : ''
                    } hover:scale-[1.02] origin-left`}
                    onClick={() => handleMarkAsRead(null, notification._id)}
                    style={{
                      animation: `slideInLeft 0.3s ease-out ${idx * 50}ms both`
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="text-2xl flex-shrink-0 transform group-hover:scale-110 transition-transform">
                          {getTypeIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold break-words ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1.5 font-medium">
                            ⏱️ {timeAgo(notification.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.isRead && (
                          <button
                            onClick={(e) => handleMarkAsRead(e, notification._id)}
                            className="px-2.5 py-1.5 text-xs bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-600 font-semibold rounded-lg hover:scale-110 transition-all shadow-sm border border-green-200 hover:border-green-300"
                            title="Mark as read"
                          >
                            ✓ Read
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDelete(e, notification._id)}
                          className="px-2.5 py-1.5 text-xs bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-600 font-semibold rounded-lg hover:scale-110 transition-all shadow-sm border border-red-200 hover:border-red-300"
                          title="Delete"
                        >
                          ✕ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-t border-gray-200 text-center">
              <button
                onClick={() => {
                  window.location.href = '/admin/notifications';
                }}
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors group flex items-center justify-center gap-2 mx-auto"
              >
                View All
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
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
      `}</style>
    </div>
  );
};

export default NotificationBell;
