import MenuItem from '../models/MenuItem.js';
import Canteen from '../models/Canteen.js';

class CartService {
  async validateCartItems(items, canteenId) {
    const validatedItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      
      if (!menuItem) {
        throw new Error(`Menu item ${item.menuItem} not found`);
      }

      if (menuItem.canteen.toString() !== canteenId) {
        throw new Error(`Item ${menuItem.name} does not belong to selected canteen`);
      }

      if (!menuItem.isAvailable) {
        throw new Error(`${menuItem.name} is currently unavailable`);
      }

      if (item.quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
      }

      const itemTotal = menuItem.price * item.quantity;
      totalAmount += itemTotal;

      validatedItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        subtotal: itemTotal,
        image: menuItem.image
      });
    }

    return { validatedItems, totalAmount };
  }

  calculateOrderSummary(totalAmount, discountCode = null) {
    const taxRate = 0.05;
    const tax = totalAmount * taxRate;
    let discount = 0;

    // Apply discount logic
    if (discountCode) {
      // Implement coupon validation here
      discount = totalAmount * 0.1; // Example: 10% discount
    }

    const finalAmount = totalAmount + tax - discount;

    return {
      subtotal: totalAmount,
      tax,
      discount,
      finalAmount
    };
  }

  async checkCanteenAvailability(canteenId) {
    const canteen = await Canteen.findById(canteenId);
    
    if (!canteen) {
      throw new Error('Canteen not found');
    }

    if (!canteen.isActive) {
      throw new Error('Canteen is currently closed');
    }

    // Check operating hours
    const now = new Date();
    const currentHour = now.getHours();
    
    // Example: Canteen operates 8 AM to 10 PM
    if (currentHour < 8 || currentHour >= 22) {
      throw new Error('Canteen is closed. Operating hours: 8 AM - 10 PM');
    }

    return canteen;
  }
}

export default new CartService();
