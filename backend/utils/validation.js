/**
 * Input Validation Utilities
 */

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
};

export const validatePassword = (password) => {
  // Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validateOrderData = (orderData) => {
  const errors = {};

  if (!orderData.userId) errors.userId = 'User ID is required';
  if (!orderData.canteenId) errors.canteenId = 'Canteen ID is required';
  if (!orderData.items || orderData.items.length === 0) errors.items = 'Items are required';
  if (!orderData.totalAmount || orderData.totalAmount <= 0) errors.totalAmount = 'Valid total amount is required';
  if (!['dine-in', 'takeaway', 'delivery'].includes(orderData.orderMode)) errors.orderMode = 'Invalid order mode';
  if (!['card', 'upi', 'wallet', 'cash'].includes(orderData.paymentMethod)) errors.paymentMethod = 'Invalid payment method';

  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateMenuItemData = (itemData) => {
  const errors = {};

  if (!itemData.name || itemData.name.trim() === '') errors.name = 'Item name is required';
  if (!itemData.price || itemData.price <= 0) errors.price = 'Valid price is required';
  if (!['veg', 'non-veg'].includes(itemData.category)) errors.category = 'Valid category is required';
  if (itemData.description && itemData.description.length > 500) errors.description = 'Description must be less than 500 characters';

  return { isValid: Object.keys(errors).length === 0, errors };
};

export const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove angle brackets
      .substring(0, 1000); // Limit length
  }
  return input;
};
