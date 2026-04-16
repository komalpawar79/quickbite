import { create } from 'zustand';
import { authAPI } from '../services/api';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const data = await authAPI.login({ email, password });
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        set({ 
          user: data.user, 
          token: data.token, 
          isAuthenticated: true 
        });
      }
      return data;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Login failed'
      };
    } finally {
      set({ isLoading: false });
    }
  },

  signup: async (userData) => {
    set({ isLoading: true });
    try {
      const data = await authAPI.signup(userData);
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        set({ 
          user: data.user, 
          token: data.token, 
          isAuthenticated: true 
        });
      }
      return data;
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Signup failed'
      };
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  setUser: (user) => set({ user }),
}));

export default useAuthStore;
