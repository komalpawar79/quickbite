import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    // For Blob responses (file downloads), return full response
    // Otherwise return just the data
    if (response.data instanceof Blob) {
      return response;
    }
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'Something went wrong';

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  signup: (userData) => apiClient.post('/auth/signup', userData),
  logout: () => apiClient.post('/auth/logout'),
  getProfile: () => apiClient.get('/auth/profile'),
  updateProfile: (data) => apiClient.put('/auth/profile', data)
};

export const orderAPI = {
  createOrder: (orderData) => apiClient.post('/orders', orderData),
  getUserOrders: (params) => apiClient.get('/orders/user', { params }),
  getOrderById: (orderId) => apiClient.get(`/orders/${orderId}`),
  cancelOrder: (orderId) => apiClient.put(`/orders/${orderId}/cancel`),
  submitFeedback: (orderId, feedback) => apiClient.post(`/orders/${orderId}/feedback`, feedback),
  getCanteenOrders: (canteenId) => apiClient.get(`/orders/canteen/${canteenId}`)
};

export const menuAPI = {
  getMenuByCanteen: (canteenId, params) => apiClient.get(`/menu/canteen/${canteenId}`, { params }),
  getMenuItem: (itemId) => apiClient.get(`/menu/${itemId}`),
  searchMenu: (query) => apiClient.get('/menu/search', { params: { q: query } }),
  getRecommendations: (canteenId) => apiClient.get(`/menu/canteen/${canteenId}/recommendations`),
  getAllMenuItems: () => apiClient.get('/menu')
};

export const canteenAPI = {
  getAllCanteens: () => apiClient.get('/canteens'),
  getCanteenById: (canteenId) => apiClient.get(`/canteens/${canteenId}`),
  getCanteenMenu: (canteenId) => apiClient.get(`/canteens/${canteenId}/menu`)
};

export const walletAPI = {
  getWallet: () => apiClient.get('/wallet'),
  addMoney: (amount, paymentMethod) => apiClient.post('/wallet/add', { amount, paymentMethod }),
  getTransactions: (params) => apiClient.get('/wallet/transactions', { params }),
  checkBalance: () => apiClient.get('/wallet/balance')
};

export const adminAPI = {
  getDashboardStats: () => apiClient.get('/admin/dashboard/stats'),
  getPeakHourData: () => apiClient.get('/admin/dashboard/peak-hours'),
  getWeeklyRevenue: () => apiClient.get('/admin/dashboard/weekly-revenue'),
  getTopItems: () => apiClient.get('/admin/dashboard/top-items'),
  getLiveOrders: () => apiClient.get('/admin/dashboard/live-orders'),
  updateOrderStatus: (orderId, status) => apiClient.put('/admin/orders/status', { orderId, status }),
  addMenuItem: (itemData) => apiClient.post('/admin/menu', itemData),
  updateMenuItem: (itemId, data) => apiClient.put(`/admin/menu/${itemId}`, data),
  deleteMenuItem: (itemId) => apiClient.delete(`/admin/menu/${itemId}`)
};

export default apiClient;
