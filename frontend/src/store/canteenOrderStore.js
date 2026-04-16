import { create } from 'zustand';
import api from '../services/api';
import io from 'socket.io-client';

let socket;

const useCanteenOrderStore = create((set) => ({
  newOrders: [],
  activeOrders: [],
  completedOrders: [],
  loading: false,
  error: null,

  fetchNewOrders: async (canteenId) => {
    try {
      set({ loading: true, error: null });
      const res = await api.get(`/canteen-dashboard/${canteenId}/orders/new`);
      const orders = res.data.data?.orders || res.data.orders || [];
      set({ newOrders: orders, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchActiveOrders: async (canteenId) => {
    try {
      const res = await api.get(`/canteen-dashboard/${canteenId}/orders/active`);
      const orders = res.data.data?.orders || res.data.orders || [];
      set({ activeOrders: orders });
    } catch (error) {
      set({ error: error.message });
    }
  },

  fetchCompletedOrders: async (canteenId) => {
    try {
      const res = await api.get(`/orders/canteen/${canteenId}/completed`);
      const orders = res.data.orders || res.data.data || [];
      set({ completedOrders: orders });
    } catch (error) {
      console.error('Failed to fetch completed orders:', error);
    }
  },

  setupWebSocket: (canteenId) => {
    if (!socket) {
      socket = io('http://localhost:5000');
      
      socket.on('connect', () => {
        console.log('✅ OrderStore: WebSocket connected');
        socket.emit('join-canteen', canteenId);
      });

      socket.on('connect_error', (error) => {
        console.error('❌ OrderStore: WebSocket connection error', error);
      });

      socket.on('order-status-updated', (data) => {
        set((state) => {
          // Move from active/new to completed
          if (data.status === 'completed') {
            return {
              activeOrders: state.activeOrders.filter(o => o._id !== data.orderId),
              newOrders: state.newOrders.filter(o => o._id !== data.orderId),
              completedOrders: [data.order || { _id: data.orderId, status: 'completed' }, ...state.completedOrders]
            };
          } else {
            // Update status in active/new orders
            return {
              newOrders: state.newOrders.map(o => o._id === data.orderId ? { ...o, status: data.status } : o),
              activeOrders: state.activeOrders.map(o => o._id === data.orderId ? { ...o, status: data.status } : o)
            };
          }
        });
      });

      // Fallback for alternative event name
      socket.on('order-status-update', (data) => {
        set((state) => {
          if (data.status === 'completed') {
            return {
              activeOrders: state.activeOrders.filter(o => o._id !== data.orderId),
              newOrders: state.newOrders.filter(o => o._id !== data.orderId),
              completedOrders: [data.order || { _id: data.orderId, status: 'completed' }, ...state.completedOrders]
            };
          } else {
            return {
              newOrders: state.newOrders.map(o => o._id === data.orderId ? { ...o, status: data.status } : o),
              activeOrders: state.activeOrders.map(o => o._id === data.orderId ? { ...o, status: data.status } : o)
            };
          }
        });
      });
    }
  },

  updateStatus: async (orderId, status) => {
    try {
      await api.patch(`/canteen-dashboard/orders/${orderId}/status`, { status });
      
      // Refresh orders after update
      set((state) => ({
        newOrders: state.newOrders.filter((o) => o._id !== orderId),
        activeOrders: state.activeOrders.map((o) =>
          o._id === orderId ? { ...o, status } : o
        ),
      }));
    } catch (error) {
      throw error;
    }
  },
}));

export default useCanteenOrderStore;
