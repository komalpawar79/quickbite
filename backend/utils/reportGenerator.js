/**
 * Report Generation Service - PDF & Excel
 */

import PDFDocument from 'pdfkit';
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { Order } from '../models/Order.js';
import { MenuItem } from '../models/MenuItem.js';
import { User } from '../models/User.js';

/**
 * Generate Daily Revenue Report (PDF)
 */
export const generateDailyRevenueReport = async (date = new Date()) => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch orders for the day
    const orders = await Order.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      status: 'completed'
    }).populate('userId', 'name email').populate('canteenId', 'name location');

    // Calculate metrics
    const totalRevenue = orders.reduce((sum, order) => sum + order.finalAmount, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Group by canteen
    const canteenWise = {};
    orders.forEach(order => {
      const canteenName = order.canteenId?.name || 'Unknown';
      if (!canteenWise[canteenName]) {
        canteenWise[canteenName] = { orders: [], total: 0 };
      }
      canteenWise[canteenName].orders.push(order);
      canteenWise[canteenName].total += order.finalAmount;
    });

    // Create PDF
    const pdfPath = path.join(process.cwd(), `reports/daily_revenue_${date.toISOString().split('T')[0]}.pdf`);
    const doc = new PDFDocument();
    
    // Create reports directory if not exists
    if (!fs.existsSync(path.join(process.cwd(), 'reports'))) {
      fs.mkdirSync(path.join(process.cwd(), 'reports'), { recursive: true });
    }

    doc.pipe(fs.createWriteStream(pdfPath));

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('Daily Revenue Report', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text(`Date: ${date.toLocaleDateString()}`, { align: 'center' });
    doc.moveDown();

    // Summary
    doc.fontSize(14).font('Helvetica-Bold').text('Summary');
    doc.fontSize(11).font('Helvetica')
      .text(`Total Revenue: ₹${totalRevenue.toFixed(2)}`)
      .text(`Total Orders: ${totalOrders}`)
      .text(`Average Order Value: ₹${avgOrderValue.toFixed(2)}`);
    doc.moveDown();

    // Canteen-wise breakdown
    doc.fontSize(14).font('Helvetica-Bold').text('Canteen-wise Breakdown');
    Object.entries(canteenWise).forEach(([canteen, data]) => {
      doc.fontSize(11).font('Helvetica-Bold').text(`${canteen}:`);
      doc.fontSize(10).font('Helvetica')
        .text(`  Orders: ${data.orders.length}, Revenue: ₹${data.total.toFixed(2)}`);
    });

    doc.end();
    return pdfPath;
  } catch (error) {
    console.error('[Report Error]', error);
    throw error;
  }
};

/**
 * Generate Order Analytics Report (Excel)
 */
export const generateOrderAnalyticsReport = async (startDate, endDate) => {
  try {
    const orders = await Order.find({
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
    }).populate('userId', 'name email universityId')
      .populate('canteenId', 'name location');

    const data = orders.map(order => ({
      'Order ID': order._id.toString(),
      'User Name': order.userId?.name || 'N/A',
      'Email': order.userId?.email || 'N/A',
      'University ID': order.userId?.universityId || 'N/A',
      'Canteen': order.canteenId?.name || 'N/A',
      'Items Count': order.items.length,
      'Total Amount': order.finalAmount,
      'Status': order.status,
      'Payment Method': order.paymentMethod,
      'Order Mode': order.orderMode,
      'Created Date': new Date(order.createdAt).toLocaleDateString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

    const reportPath = path.join(process.cwd(), `reports/order_analytics_${Date.now()}.xlsx`);
    XLSX.writeFile(workbook, reportPath);

    return reportPath;
  } catch (error) {
    console.error('[Report Error]', error);
    throw error;
  }
};

/**
 * Generate Inventory Report (Excel)
 */
export const generateInventoryReport = async () => {
  try {
    const items = await MenuItem.find().populate('canteenId', 'name');

    const data = items.map(item => ({
      'Item Name': item.name,
      'Category': item.category,
      'Canteen': item.canteenId?.name || 'N/A',
      'Current Stock': item.stock,
      'Minimum Stock': item.minStock || 10,
      'Status': item.stock < (item.minStock || 10) ? 'Low Stock' : 'OK',
      'Price': item.price,
      'Available': item.available ? 'Yes' : 'No'
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');

    const reportPath = path.join(process.cwd(), `reports/inventory_${Date.now()}.xlsx`);
    XLSX.writeFile(workbook, reportPath);

    return reportPath;
  } catch (error) {
    console.error('[Report Error]', error);
    throw error;
  }
};

/**
 * Generate User Activity Report (Excel)
 */
export const generateUserActivityReport = async (startDate, endDate) => {
  try {
    const users = await User.find({
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
    }).select('name email universityId role createdAt lastLogin');

    const data = users.map(user => ({
      'User Name': user.name,
      'Email': user.email,
      'University ID': user.universityId,
      'Role': user.role,
      'Joined Date': new Date(user.createdAt).toLocaleDateString(),
      'Last Login': user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

    const reportPath = path.join(process.cwd(), `reports/user_activity_${Date.now()}.xlsx`);
    XLSX.writeFile(workbook, reportPath);

    return reportPath;
  } catch (error) {
    console.error('[Report Error]', error);
    throw error;
  }
};

/**
 * Generate Payment Report (Excel)
 */
export const generatePaymentReport = async (startDate, endDate) => {
  try {
    const orders = await Order.find({
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
    }).populate('userId', 'name email').select('finalAmount paymentMethod paymentStatus createdAt');

    const data = orders.map(order => ({
      'Order ID': order._id.toString(),
      'User': order.userId?.name || 'N/A',
      'Amount': order.finalAmount,
      'Method': order.paymentMethod,
      'Status': order.paymentStatus,
      'Date': new Date(order.createdAt).toLocaleDateString()
    }));

    // Summary sheet
    const totalAmount = data.reduce((sum, row) => sum + row['Amount'], 0);
    const paymentMethods = {};
    data.forEach(row => {
      paymentMethods[row['Method']] = (paymentMethods[row['Method']] || 0) + row['Amount'];
    });

    const summaryData = [
      { 'Metric': 'Total Payments', 'Value': `₹${totalAmount.toFixed(2)}` },
      { 'Metric': 'Total Orders', 'Value': data.length },
      { 'Metric': 'Average Order Value', 'Value': `₹${(totalAmount / data.length).toFixed(2)}` }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data), 'Transactions');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(summaryData), 'Summary');

    const reportPath = path.join(process.cwd(), `reports/payment_report_${Date.now()}.xlsx`);
    XLSX.writeFile(workbook, reportPath);

    return reportPath;
  } catch (error) {
    console.error('[Report Error]', error);
    throw error;
  }
};
