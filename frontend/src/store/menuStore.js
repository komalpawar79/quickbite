import { create } from 'zustand';
import api from '../services/api';

const useMenuStore = create((set, get) => ({
  menuItems: [],
  selectedCanteen: null,
  loading: false,
  error: null,

  // Set selected canteen
  setSelectedCanteen: (canteen) => {
    set({ selectedCanteen: canteen });
    if (canteen) {
      get().fetchMenuByCanteen(canteen._id);
    }
  },

  // Fetch menu by canteen ID
  fetchMenuByCanteen: async (canteenId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/menu/canteen/${canteenId}`);
      console.log('Menu API Response:', response);
      // Handle different response structures
      const items = response.data?.items || response.data?.data?.items || response.items || [];
      set({ 
        menuItems: items,
        loading: false 
      });
    } catch (error) {
      console.error('Error fetching menu:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to fetch menu',
        loading: false,
        menuItems: []
      });
    }
  },

  // Add menu item (canteen owner)
  addMenuItem: async (itemData) => {
    try {
      const response = await api.post('/canteen/menu/add', itemData);
      const newItem = response.data.data.item;
      set((state) => ({
        menuItems: [newItem, ...state.menuItems]
      }));
      return { success: true, item: newItem };
    } catch (error) {
      console.error('Error adding menu item:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add item' 
      };
    }
  },

  // Update menu item
  updateMenuItem: async (itemId, updates) => {
    try {
      const response = await api.patch(`/canteen/menu/${itemId}`, updates);
      const updatedItem = response.data.data.item;
      set((state) => ({
        menuItems: state.menuItems.map(item => 
          item._id === itemId ? updatedItem : item
        )
      }));
      return { success: true, item: updatedItem };
    } catch (error) {
      console.error('Error updating menu item:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update item' 
      };
    }
  },

  // Delete menu item
  deleteMenuItem: async (itemId) => {
    try {
      await api.delete(`/canteen/menu/${itemId}`);
      set((state) => ({
        menuItems: state.menuItems.filter(item => item._id !== itemId)
      }));
      return { success: true };
    } catch (error) {
      console.error('Error deleting menu item:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete item' 
      };
    }
  },

  // Clear menu
  clearMenu: () => set({ menuItems: [], selectedCanteen: null })
}));

export default useMenuStore;
