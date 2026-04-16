import { create } from 'zustand';
import api from '../services/api';

const useCanteenMenuStore = create((set, get) => ({
  menuItems: [],
  loading: false,
  error: null,

  fetchMenu: async (canteenId) => {
    try {
      set({ loading: true, error: null });
      console.log(`📥 Fetching menu for canteen: ${canteenId}`);
      const res = await api.get(`/canteen-dashboard/${canteenId}/menu`);
      const items = res.data?.data?.items || res.data?.items || [];
      console.log(`✅ Fetched ${items.length} menu items`);
      set({ menuItems: items, loading: false });
      return items;
    } catch (error) {
      console.error('❌ Error fetching menu:', error.message);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  addItem: async (canteenId, itemData) => {
    try {
      console.log(`➕ Adding item to canteen: ${canteenId}`, itemData);
      const res = await api.post(`/canteen-dashboard/${canteenId}/menu`, itemData);
      const newItem = res.data?.data?.item || res.data?.item;
      console.log('✅ Item added:', newItem);
      
      // Immediately add to local state for instant UI update
      if (newItem) {
        set((state) => ({ menuItems: [newItem, ...state.menuItems] }));
      }
    } catch (error) {
      console.error('❌ Error adding item:', error.message);
      throw error;
    }
  },

  updateItem: async (itemId, itemData) => {
    try {
      console.log(`✏️ Updating item: ${itemId}`, itemData);
      const res = await api.patch(`/canteen-dashboard/menu/${itemId}`, itemData);
      const updatedItem = res.data?.data?.item || res.data?.item;
      console.log('✅ Item updated:', updatedItem);
      
      if (updatedItem) {
        set((state) => ({
          menuItems: state.menuItems.map((item) =>
            item._id === itemId ? updatedItem : item
          ),
        }));
      }
    } catch (error) {
      console.error('❌ Error updating item:', error.message);
      throw error;
    }
  },

  toggleAvailability: async (itemId) => {
    try {
      console.log(`🔄 Toggling availability for item: ${itemId}`);
      const res = await api.patch(`/canteen-dashboard/menu/${itemId}/toggle`);
      const updatedItem = res.data?.data?.item || res.data?.item;
      console.log('✅ Availability updated:', updatedItem);
      
      if (updatedItem) {
        set((state) => ({
          menuItems: state.menuItems.map((item) =>
            item._id === itemId ? updatedItem : item
          ),
        }));
      }
    } catch (error) {
      console.error('❌ Error toggling availability:', error.message);
      throw error;
    }
  },

  deleteItem: async (itemId) => {
    try {
      console.log(`🗑️ Deleting item: ${itemId}`);
      await api.delete(`/canteen-dashboard/menu/${itemId}`);
      console.log('✅ Item deleted');
      
      set((state) => ({
        menuItems: state.menuItems.filter((item) => item._id !== itemId),
      }));
    } catch (error) {
      console.error('❌ Error deleting item:', error.message);
      throw error;
    }
  },
}));

export default useCanteenMenuStore;
