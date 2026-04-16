import { create } from 'zustand';
import { orderAPI } from '../services/api';
import toast from 'react-hot-toast';
import websocket from '../services/websocket';

const useOrderStore = create((set, get) => ({
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,

  createOrder: async (orderData) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Creating order with data:', orderData);
      const response = await orderAPI.createOrder(orderData);
      console.log('Order response:', response);
      if (response.success) {
        toast.success('Order placed successfully!');
        set({ currentOrder: response.data.order });
        return { success: true, order: response.data.order };
      }
      return { success: false, error: response.message };
    } catch (error) {
      console.error('Order creation error:', error);
      console.error('Error response:', error.response);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to create order';
      set({ error: errorMsg });
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUserOrders: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderAPI.getUserOrders(params);
      if (response.success) {
        set({ orders: response.data.orders });
        return response.data;
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch orders';
      set({ error: errorMsg });
      toast.error(errorMsg);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchOrderById: async (orderId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderAPI.getOrderById(orderId);
      if (response.success) {
        set({ currentOrder: response.data.order });
        return response.data.order;
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch order';
      set({ error: errorMsg });
      toast.error(errorMsg);
    } finally {
      set({ isLoading: false });
    }
  },

  cancelOrder: async (orderId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderAPI.cancelOrder(orderId);
      if (response.success) {
        toast.success('Order cancelled successfully');
        
        // Update orders list
        const { orders } = get();
        set({
          orders: orders.map(order => 
            order._id === orderId ? { ...order, status: 'cancelled' } : order
          )
        });
        
        return { success: true };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to cancel order';
      set({ error: errorMsg });
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      set({ isLoading: false });
    }
  },

  submitFeedback: async (orderId, feedback) => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderAPI.submitFeedback(orderId, feedback);
      if (response.success) {
        toast.success('Feedback submitted successfully');
        
        // Update orders list
        const { orders } = get();
        set({
          orders: orders.map(order => 
            order._id === orderId ? { ...order, feedback } : order
          )
        });
        
        return { success: true };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to submit feedback';
      set({ error: errorMsg });
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      set({ isLoading: false });
    }
  },

  updateOrderStatus: (orderId, status) => {
    const { orders, currentOrder } = get();
    
    set({
      orders: orders.map(order => 
        order._id === orderId ? { ...order, status } : order
      ),
      currentOrder: currentOrder?._id === orderId 
        ? { ...currentOrder, status } 
        : currentOrder
    });
  },

  initWebSocket: () => {
    websocket.on('order-update', (data) => {
      const { updateOrderStatus, fetchUserOrders } = get();
      if (data.order) {
        updateOrderStatus(data.order._id, data.order.status);
      }
      fetchUserOrders();
    });

    websocket.on('status-changed', (data) => {
      const { updateOrderStatus } = get();
      if (data.orderId && data.status) {
        updateOrderStatus(data.orderId, data.status);
      }
    });
  },

  clearCurrentOrder: () => set({ currentOrder: null }),
  clearOrders: () => set({ orders: [], currentOrder: null, error: null })
}));

export default useOrderStore;
