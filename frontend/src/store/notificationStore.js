import { create } from 'zustand';
import api from '../services/api';
import { io } from 'socket.io-client';

let socketInstance = null;

export const useNotificationStore = create((set, get) => ({
  // State
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  socket: null,
  isConnected: false,

  // Initialize Socket.IO connection
  initializeSocket: () => {
    if (socketInstance) return;

    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found for socket connection');
      return;
    }

    socketInstance = io('http://localhost:5000', {
      auth: {
        token: token
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socketInstance.on('connect', () => {
      console.log('✅ Socket connected');
      set({ isConnected: true });
      socketInstance.emit('join-admin');
    });

    socketInstance.on('new_notification', (notification) => {
      console.log('📬 New notification:', notification);
      const state = get();
      
      // Add to notifications array (max 100)
      set(prevState => ({
        notifications: [notification, ...prevState.notifications].slice(0, 100),
        unreadCount: prevState.unreadCount + 1
      }));

      // Play sound if enabled
      const soundEnabled = localStorage.getItem('notificationSound') !== 'false';
      if (soundEnabled) {
        get().playSound();
      }
    });

    socketInstance.on('notifications:read', (notificationId) => {
      set(prevState => ({
        notifications: prevState.notifications.map(n =>
          n._id === notificationId ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, prevState.unreadCount - 1)
      }));
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      set({ isConnected: false });
    });

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
      set({ error: error.message });
    });

    set({ socket: socketInstance });
  },

  // Disconnect socket
  disconnectSocket: () => {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
      set({ socket: null, isConnected: false });
    }
  },

  // Fetch notifications from API
  fetchNotifications: async (limit = 50, skip = 0) => {
    try {
      set({ loading: true, error: null });
      const res = await api.get(`/notifications?limit=${limit}&skip=${skip}`);
      
      set({
        notifications: res.notifications || [],
        unreadCount: res.pagination?.unread || 0,
        loading: false
      });

      return res.notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      set({ 
        error: error.message || 'Failed to fetch notifications',
        loading: false 
      });
      throw error;
    }
  },

  // Fetch notifications by type
  fetchByType: async (type, limit = 50) => {
    try {
      set({ loading: true, error: null });
      const res = await api.get(`/notifications/type/${type}?limit=${limit}`);
      
      set({
        notifications: res.notifications || [],
        loading: false
      });

      return res.notifications;
    } catch (error) {
      console.error('Error fetching notifications by type:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Mark single notification as read
  markAsRead: async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      
      set(prevState => ({
        notifications: prevState.notifications.map(n =>
          n._id === notificationId ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, prevState.unreadCount - 1)
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      set({ error: error.message });
      throw error;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      await api.put('/notifications/all/read');
      
      set(prevState => ({
        notifications: prevState.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      }));
    } catch (error) {
      console.error('Error marking all as read:', error);
      set({ error: error.message });
      throw error;
    }
  },

  // Delete single notification
  deleteNotification: async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      
      set(prevState => ({
        notifications: prevState.notifications.filter(n => n._id !== notificationId)
      }));
    } catch (error) {
      console.error('Error deleting notification:', error);
      set({ error: error.message });
      throw error;
    }
  },

  // Clear all notifications
  clearAll: async () => {
    try {
      await api.delete('/notifications/all/clear');
      set({ notifications: [], unreadCount: 0 });
    } catch (error) {
      console.error('Error clearing notifications:', error);
      set({ error: error.message });
      throw error;
    }
  },

  // Play notification sound
  playSound: () => {
    try {
      const audioUrl = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBg==';
      const audio = new Audio(audioUrl);
      audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  },

  // Get notifications filtered by type
  getByType: (type) => {
    return get().notifications.filter(n => n.type === type);
  },

  // Get unread notifications
  getUnread: () => {
    return get().notifications.filter(n => !n.isRead);
  },

  // Clear errors
  clearError: () => set({ error: null }),

  // Manual refresh
  refresh: async () => {
    await get().fetchNotifications();
  }
}));

export default useNotificationStore;
