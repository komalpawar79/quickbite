import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  cart: [],
  selectedCanteen: null,
  totalPrice: 0,

  addToCart: (item, quantity, canteenId) => {
    const { cart, selectedCanteen } = get();
    
    // If switching canteen, clear cart
    if (selectedCanteen && selectedCanteen !== canteenId) {
      set({ 
        cart: [{ ...item, quantity, _id: item._id || Date.now() }],
        selectedCanteen: canteenId 
      });
      return;
    }

    const existingItem = cart.find((i) => i._id === item._id);
    
    if (existingItem) {
      set({
        cart: cart.map((i) =>
          i._id === item._id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        ),
      });
    } else {
      set({ 
        cart: [...cart, { ...item, quantity, _id: item._id || Date.now() }],
        selectedCanteen: canteenId 
      });
    }
  },

  removeFromCart: (itemId) => {
    set((state) => ({
      cart: state.cart.filter((item) => item._id !== itemId),
    }));
  },

  updateQuantity: (itemId, quantity) => {
    set((state) => ({
      cart: state.cart.map((item) =>
        item._id === itemId ? { ...item, quantity } : item
      ),
    }));
  },

  clearCart: () => {
    set({ cart: [], selectedCanteen: null, totalPrice: 0 });
  },

  calculateTotal: () => {
    const { cart } = get();
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    set({ totalPrice: total });
    return total;
  },

  getCartCount: () => {
    const { cart } = get();
    return cart.reduce((count, item) => count + item.quantity, 0);
  },
}));

export default useCartStore;
