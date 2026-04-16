import { create } from 'zustand';

const useWalletStore = create((set, get) => ({
  balance: 0,
  totalAdded: 0,
  totalSpent: 0,
  transactions: [],
  isLoading: false,
  error: null,

  // Fetch wallet details
  fetchWallet: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('http://localhost:5000/api/wallet/balance', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        set({
          balance: data.wallet.balance,
          totalAdded: data.wallet.totalAdded,
          totalSpent: data.wallet.totalSpent,
          transactions: data.wallet.recentTransactions || [],
        });
      }
    } catch (error) {
      set({ error: error.message });
      console.error('Fetch wallet error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Add money to wallet
  addMoney: async (amount, paymentMethod = 'Online') => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('http://localhost:5000/api/wallet/add-money', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ amount, paymentMethod }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        set({
          balance: data.wallet.balance,
          totalAdded: data.wallet.totalAdded,
          totalSpent: data.wallet.totalSpent,
        });
        return { success: true, message: data.message };
      } else {
        set({ error: data.error });
        return { success: false, error: data.error };
      }
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    } finally {
      set({ isLoading: false });
    }
  },

  // Use wallet for payment
  useWallet: async (amount, orderId, description = 'Order payment') => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('http://localhost:5000/api/wallet/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ amount, orderId, description }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        set({
          balance: data.wallet.balance,
          totalAdded: data.wallet.totalAdded,
          totalSpent: data.wallet.totalSpent,
        });
        return { success: true, message: data.message };
      } else {
        set({ error: data.error });
        return { success: false, error: data.error };
      }
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch transactions
  fetchTransactions: async (limit = 20, skip = 0) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(
        `http://localhost:5000/api/wallet/transactions?limit=${limit}&skip=${skip}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        set({ transactions: data.transactions });
      }
    } catch (error) {
      set({ error: error.message });
      console.error('Fetch transactions error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Check balance
  checkBalance: async () => {
    try {
      const response = await fetch('http://localhost:5000/api/wallet/check', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        set({ balance: data.balance });
        return data.balance;
      }
    } catch (error) {
      console.error('Check balance error:', error);
      return null;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset wallet store
  resetWallet: () => {
    set({
      balance: 0,
      totalAdded: 0,
      totalSpent: 0,
      transactions: [],
      isLoading: false,
      error: null,
    });
  },
}));

export default useWalletStore;
