import { create } from 'zustand';
import api from '../services/api';

const useCanteenAnalyticsStore = create((set) => ({
  kpis: null,
  popularItems: [],
  loading: false,
  error: null,

  fetchKPIs: async (canteenId) => {
    try {
      set({ loading: true, error: null });
      const res = await api.get(`/canteen-dashboard/analytics/${canteenId}/kpis`);
      console.log('📊 KPIs fetched:', res.data);
      set({ kpis: res.data, loading: false });
    } catch (error) {
      console.error('❌ KPIs fetch error:', error);
      set({ error: error.message, loading: false });
    }
  },

  fetchPopularItems: async (canteenId, days = 7) => {
    try {
      const res = await api.get(`/canteen-dashboard/analytics/${canteenId}/popular-items?days=${days}`);
      console.log('📊 Popular items fetched:', res.data);
      const items = res.data?.popularItems || [];
      set({ popularItems: items });
    } catch (error) {
      console.error('❌ Popular items fetch error:', error);
      set({ error: error.message });
    }
  },
}));

export default useCanteenAnalyticsStore;
