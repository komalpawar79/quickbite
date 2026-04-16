import { create } from 'zustand';
import api from '../services/api';

const useCanteenSettingsStore = create((set) => ({
  canteen: null,
  loading: false,
  error: null,

  fetchSettings: async (canteenId) => {
    try {
      set({ loading: true, error: null });
      const res = await api.get(`/canteen-dashboard/${canteenId}/settings`);
      set({ canteen: res.data.data?.canteen || res.data.canteen, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  updateSchedule: async (canteenId, operatingHours) => {
    try {
      const res = await api.patch(`/canteen-dashboard/${canteenId}/schedule`, { operatingHours });
      set({ canteen: res.data.data?.canteen || res.data.canteen });
    } catch (error) {
      throw error;
    }
  },

  toggleStatus: async (canteenId) => {
    try {
      const res = await api.patch(`/canteen-dashboard/${canteenId}/status`);
      set({ canteen: res.data.data?.canteen || res.data.canteen });
    } catch (error) {
      throw error;
    }
  },
}));

export default useCanteenSettingsStore;
