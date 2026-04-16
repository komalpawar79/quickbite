/**
 * Notification Service - Email & SMS
 */

import nodemailer from 'nodemailer';

/**
 * Email Transporter
 */
const emailTransporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Send Order Confirmation Email
 */
export const sendOrderConfirmationEmail = async (user, order) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Order Confirmation #${order._id}`,
      html: `
        <h2>Order Confirmed!</h2>
        <p>Hi ${user.name},</p>
        <p>Your order has been confirmed.</p>
        <h3>Order Details:</h3>
        <ul>
          <li><strong>Order ID:</strong> ${order._id}</li>
          <li><strong>Total Amount:</strong> ₹${order.finalAmount}</li>
          <li><strong>Order Type:</strong> ${order.orderMode}</li>
          <li><strong>Estimated Time:</strong> ${order.estimatedTime} minutes</li>
        </ul>
        <p>Thank you for your order!</p>
      `
    };

    await emailTransporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('[Email Error]', error);
    return false;
  }
};

/**
 * Send Order Status Update Email
 */
export const sendOrderStatusEmail = async (user, order, newStatus) => {
  try {
    const statusMessages = {
      'preparing': 'Your order is being prepared!',
      'ready': 'Your order is ready for pickup!',
      'completed': 'Your order has been completed. Thank you!',
      'cancelled': 'Your order has been cancelled.'
    };

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Order ${newStatus.toUpperCase()} - #${order._id}`,
      html: `
        <h2>${statusMessages[newStatus] || `Order Status: ${newStatus}`}</h2>
        <p>Hi ${user.name},</p>
        <p>Order ID: <strong>${order._id}</strong></p>
        <p>Current Status: <strong>${newStatus.toUpperCase()}</strong></p>
        <p>Thank you for your business!</p>
      `
    };

    await emailTransporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('[Email Error]', error);
    return false;
  }
};

/**
 * Send Low Stock Alert
 */
export const sendLowStockAlert = async (adminEmails, itemName, currentStock, threshold) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: adminEmails.join(','),
      subject: `Low Stock Alert - ${itemName}`,
      html: `
        <h2>Low Stock Alert!</h2>
        <p>The following item has low stock:</p>
        <ul>
          <li><strong>Item:</strong> ${itemName}</li>
          <li><strong>Current Stock:</strong> ${currentStock}</li>
          <li><strong>Minimum Threshold:</strong> ${threshold}</li>
        </ul>
        <p>Please reorder immediately!</p>
      `
    };

    await emailTransporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('[Email Error]', error);
    return false;
  }
};

/**
 * Send Payment Confirmation Email
 */
export const sendPaymentConfirmationEmail = async (user, payment) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Payment Confirmation - ₹${payment.amount}`,
      html: `
        <h2>Payment Received!</h2>
        <p>Hi ${user.name},</p>
        <p>Your payment has been successfully processed.</p>
        <h3>Payment Details:</h3>
        <ul>
          <li><strong>Transaction ID:</strong> ${payment._id}</li>
          <li><strong>Amount:</strong> ₹${payment.amount}</li>
          <li><strong>Method:</strong> ${payment.method}</li>
          <li><strong>Date:</strong> ${new Date(payment.createdAt).toLocaleDateString()}</li>
        </ul>
        <p>Thank you!</p>
      `
    };

    await emailTransporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('[Email Error]', error);
    return false;
  }
};

/**
 * Send SMS Notification (Mock Implementation)
 * In production, use Twilio or similar service
 */
export const sendSMSNotification = async (phoneNumber, message) => {
  try {
    // Mock SMS sending
    console.log(`[SMS] To: ${phoneNumber}, Message: ${message}`);
    // In production, integrate with Twilio or AWS SNS
    return true;
  } catch (error) {
    console.error('[SMS Error]', error);
    return false;
  }
};

/**
 * Send Low Stock SMS Alert
 */
export const sendLowStockSMS = async (managerPhone, itemName, currentStock) => {
  const message = `Alert: ${itemName} stock is low (${currentStock} units). Please reorder.`;
  return await sendSMSNotification(managerPhone, message);
};

/**
 * Test Email Connection
 */
export const testEmailConnection = async () => {
  try {
    await emailTransporter.verify();
    console.log('[Email] Connection successful');
    return true;
  } catch (error) {
    console.error('[Email] Connection failed:', error);
    return false;
  }
};
