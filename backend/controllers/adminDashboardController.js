import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import User from '../models/User.js';
import Canteen from '../models/Canteen.js';
import Category from '../models/Category.js';
import Transaction from '../models/Transaction.js';
import Settlement from '../models/Settlement.js';
import Notification from '../models/Notification.js';
import SystemConfig from '../models/SystemConfig.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import AdminSettings from '../models/AdminSettings.js';
import ApiResponse from '../utils/apiResponse.js';
import { Parser } from 'json2csv';
import ExcelJS from 'exceljs';

// ==================== 1. DASHBOARD OVERVIEW ====================

export const getAdminStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    console.log('📊 Fetching admin stats...');

    const [totalUsers, activeCanteens, ordersToday, revenueData, monthRevenue] = await Promise.all([
      User.countDocuments().then(count => {
        console.log(`✅ Total Users: ${count}`);
        return count;
      }),
      Canteen.countDocuments({ isActive: true }).then(count => {
        console.log(`✅ Active Canteens: ${count}`);
        return count;
      }),
      Order.countDocuments({ createdAt: { $gte: today }, status: { $ne: 'cancelled' } }).then(count => {
        console.log(`✅ Orders Today: ${count}`);
        return count;
      }),
      Order.aggregate([
        { $match: { createdAt: { $gte: today }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$finalAmount' } } }
      ]).then(data => {
        console.log(`✅ Revenue Today: ₹${data[0]?.total || 0}`);
        return data;
      }),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$finalAmount' } } }
      ]).then(data => {
        console.log(`✅ Month Revenue: ₹${data[0]?.total || 0}`);
        return data;
      })
    ]);

    const avgOrderValue = ordersToday > 0 ? (revenueData[0]?.total || 0) / ordersToday : 0;

    const stats = {
      totalUsers,
      activeCanteens,
      ordersToday,
      revenueToday: revenueData[0]?.total || 0,
      revenueMonth: monthRevenue[0]?.total || 0,
      avgOrderValue: Math.round(avgOrderValue)
    };

    console.log('📤 Returning stats:', stats);

    res.json(new ApiResponse(200, stats, 'Stats fetched successfully'));
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

export const getTopSellingItems = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const topItems = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.menuItem', totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'menuitems', localField: '_id', foreignField: '_id', as: 'item' } },
      { $unwind: '$item' },
      { $project: { name: '$item.name', totalSold: 1, revenue: 1, category: '$item.category' } }
    ]);

    res.json(new ApiResponse(200, { topItems }));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

export const getActiveCanteens = async (req, res) => {
  try {
    const canteens = await Canteen.find({ isActive: true })
      .populate('manager', 'name email')
      .select('name location avgRating totalRatings')
      .limit(10);

    res.json(new ApiResponse(200, { canteens }));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

export const getUserGrowth = async (req, res) => {
  try {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);
      return date;
    });

    const growth = await Promise.all(
      last7Days.map(async (date) => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        const count = await User.countDocuments({ createdAt: { $gte: date, $lt: nextDay } });
        return { date: date.toISOString().split('T')[0], users: count };
      })
    );

    res.json(new ApiResponse(200, { growth }));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

export const getOrderVolumeChart = async (req, res) => {
  try {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);
      return date;
    });

    const volume = await Promise.all(
      last7Days.map(async (date) => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        const count = await Order.countDocuments({ createdAt: { $gte: date, $lt: nextDay }, status: { $ne: 'cancelled' } });
        return { date: date.toISOString().split('T')[0], orders: count };
      })
    );

    res.json(new ApiResponse(200, { volume }));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

export const getCategorySales = async (req, res) => {
  try {
    const sales = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      { $lookup: { from: 'menuitems', localField: 'items.menuItem', foreignField: '_id', as: 'item' } },
      { $unwind: '$item' },
      { $group: { _id: '$item.category', value: { $sum: '$items.quantity' } } },
      { $project: { name: '$_id', value: 1, _id: 0 } }
    ]);

    res.json(new ApiResponse(200, { sales }));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// ==================== 2. USER MANAGEMENT ====================

export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search, status } = req.query;
    const query = {};
    
    // ✅ FILTER: Only show admin-created users (exclude regular students)
    // Admin-created roles: canteen_manager, staff, faculty, admin
    // Regular signup users: student (these are self-registered and shouldn't appear here)
    query.role = { $in: ['canteen_manager', 'staff', 'faculty', 'admin'] };
    
    if (role) query.role = role; // Override if specific role is requested
    if (status) query.isActive = status === 'active';
    if (search) query.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { universityId: new RegExp(search, 'i') }
    ];

    const users = await User.find(query)
      .select('-password')
      .populate('canteenAssigned', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json(new ApiResponse(200, { users, total, page: parseInt(page), pages: Math.ceil(total / limit) }));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role, universityId, department, canteenAssigned } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json(new ApiResponse(400, null, 'Email already exists'));
    }

    // For canteen_manager and admin, auto-generate universityId if not provided
    let finalUniversityId = universityId;
    if ((role === 'canteen_manager' || role === 'admin') && !universityId) {
      finalUniversityId = `${role.toUpperCase()}-${Date.now()}`;
    }

    // Check if universityId already exists (only if provided)
    if (finalUniversityId) {
      const existingId = await User.findOne({ universityId: finalUniversityId });
      if (existingId) {
        return res.status(400).json(new ApiResponse(400, null, 'University ID already exists'));
      }
    }

    const userData = {
      name,
      email,
      password,
      phone,
      role: role || 'student',
      universityId: finalUniversityId,
      department,
      isVerified: true,
      isActive: true
    };

    // If canteen manager, assign canteen
    if (role === 'canteen_manager' && canteenAssigned) {
      userData.canteenAssigned = canteenAssigned;
    }

    const user = new User(userData);
    await user.save();

    const userResponse = await User.findById(user._id).select('-password').populate('canteenAssigned', 'name');
    res.status(201).json(new ApiResponse(201, { user: userResponse }, 'User created successfully'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(id, { isActive }, { new: true }).select('-password');
    res.json(new ApiResponse(200, { user }, 'User status updated'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
    res.json(new ApiResponse(200, { user }, 'User role updated'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

export const exportUsers = async (req, res) => {
  try {
    const users = await User.find().select('name email role universityId isActive createdAt');
    const fields = ['name', 'email', 'role', 'universityId', 'isActive', 'createdAt'];
    const parser = new Parser({ fields });
    const csv = parser.parse(users);

    res.header('Content-Type', 'text/csv');
    res.attachment('users.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// ==================== 3. CANTEEN MANAGEMENT ====================

export const createCanteen = async (req, res) => {
  try {
    console.log('Creating canteen with data:', req.body);
    const canteen = new Canteen(req.body);
    await canteen.save();
    console.log('Canteen created:', canteen._id);
    res.status(201).json(new ApiResponse(201, { canteen }, 'Canteen created'));
  } catch (error) {
    console.error('Error creating canteen:', error);
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

export const updateCanteen = async (req, res) => {
  try {
    const { id } = req.params;
    const canteen = await Canteen.findByIdAndUpdate(id, req.body, { new: true });
    res.json(new ApiResponse(200, { canteen }, 'Canteen updated'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

export const updateCanteenStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const canteen = await Canteen.findByIdAndUpdate(id, { isActive }, { new: true });
    res.json(new ApiResponse(200, { canteen }, 'Canteen status updated'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

export const getAllCanteens = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const user = req.user; // From protect middleware
    const query = {};
    
    // If user is canteen manager, only show their assigned canteen
    if (user.role === 'canteen_manager' && user.canteenAssigned) {
      query._id = user.canteenAssigned;
    }
    
    const canteens = await Canteen.find(query)
      .populate('manager', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Canteen.countDocuments(query);
    res.json(new ApiResponse(200, { canteens, total, page: parseInt(page), pages: Math.ceil(total / limit) }));
  } catch (error) {
    console.error('Error fetching canteens:', error);
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

export const deleteCanteen = async (req, res) => {
  try {
    const { id } = req.params;
    const canteen = await Canteen.findByIdAndDelete(id);
    
    if (!canteen) {
      return res.status(404).json(new ApiResponse(404, null, 'Canteen not found'));
    }

    res.json(new ApiResponse(200, null, 'Canteen deleted successfully'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// ==================== 4. CATEGORY & MENU MANAGEMENT ====================

export const createCategory = async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(new ApiResponse(201, { category }, 'Category created'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndUpdate(id, req.body, { new: true });
    res.json(new ApiResponse(200, { category }, 'Category updated'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await Category.findByIdAndDelete(id);
    res.json(new ApiResponse(200, null, 'Category deleted'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ sortOrder: 1 });
    res.json(new ApiResponse(200, { categories }));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

export const createMenuItem = async (req, res) => {
  try {
    const item = new MenuItem(req.body);
    await item.save();
    const populatedItem = await MenuItem.findById(item._id).populate('canteen', 'name');
    res.status(201).json(new ApiResponse(201, { item: populatedItem }, 'Menu item created'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

export const getAllMenuItems = async (req, res) => {
  try {
    const { page = 1, limit = 20, canteen, category } = req.query;
    const user = req.user; // From protect middleware
    const query = {};
    
    // If user is canteen manager, only show items from their assigned canteen
    if (user.role === 'canteen_manager' && user.canteenAssigned) {
      query.canteen = user.canteenAssigned;
    } else if (canteen) {
      // Allow filtering by specific canteen if provided
      query.canteen = canteen;
    }
    
    if (category) query.category = category;

    const items = await MenuItem.find(query)
      .populate('canteen', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await MenuItem.countDocuments(query);
    res.json(new ApiResponse(200, { items, total, page: parseInt(page), pages: Math.ceil(total / limit) }));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await MenuItem.findByIdAndUpdate(id, req.body, { new: true }).populate('canteen', 'name');
    res.json(new ApiResponse(200, { item }, 'Menu item updated'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    await MenuItem.findByIdAndDelete(id);
    res.json(new ApiResponse(200, null, 'Menu item deleted'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// ==================== 5. ORDERS MANAGEMENT ====================

export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, canteen, status, paymentMethod, startDate, endDate } = req.query;
    const query = {};
    
    if (canteen) query.canteen = canteen;
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('canteen', 'name')
      .populate('items.menuItem', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);
    res.json(new ApiResponse(200, { orders, total, page: parseInt(page), pages: Math.ceil(total / limit) }));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true })
      .populate('user canteen items.menuItem');
    
    res.json(new ApiResponse(200, { order }, 'Order status updated'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

export const refundOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) return res.status(404).json(new ApiResponse(404, null, 'Order not found'));
    if (order.paymentStatus === 'refunded') return res.status(400).json(new ApiResponse(400, null, 'Already refunded'));

    order.paymentStatus = 'refunded';
    order.status = 'cancelled';
    await order.save();

    const transaction = new Transaction({
      user: order.user,
      order: order._id,
      type: 'refund',
      amount: order.finalAmount,
      status: 'completed',
      description: 'Order refund'
    });
    await transaction.save();

    res.json(new ApiResponse(200, { order }, 'Order refunded'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// ==================== 6. PAYMENT & TRANSACTIONS ====================

export const getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 100, type, status } = req.query;
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;

    const transactions = await Transaction.find(query)
      .populate('user', 'name email')
      .populate('order', 'finalAmount')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Transaction.countDocuments(query);
    res.json(new ApiResponse(200, { transactions, total, page: parseInt(page), pages: Math.ceil(total / limit), limit: parseInt(limit) }));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

export const getAllSettlements = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    if (status) query.status = status;

    const settlements = await Settlement.find(query)
      .populate('canteen', 'name')
      .populate('approvedBy', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Settlement.countDocuments(query);
    res.json(new ApiResponse(200, { settlements, total, page: parseInt(page), pages: Math.ceil(total / limit) }));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

export const approveSettlement = async (req, res) => {
  try {
    const { id } = req.params;
    const settlement = await Settlement.findByIdAndUpdate(
      id,
      { status: 'approved', approvedBy: req.user._id },
      { new: true }
    );
    res.json(new ApiResponse(200, { settlement }, 'Settlement approved'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// ==================== 7. REPORTS & DOWNLOADS ====================

export const generateReport = async (req, res) => {
  try {
    const { type } = req.params;  // type comes from URL path, not query
    const { format = 'json', startDate, endDate } = req.query;
    console.log(`📊 Generating ${type} report - Format: ${format}, Start: ${startDate}, End: ${endDate}`);
    
    // Validate type
    const validTypes = ['orders', 'revenue', 'payment', 'top-items', 'user-activity', 'cancelled', 'canteen-performance', 'item-sales'];
    if (!type || !validTypes.includes(type)) {
      return res.status(400).json(new ApiResponse(400, null, `Invalid report type. Valid types: ${validTypes.join(', ')}`));
    }
    
    let data = [];

    // Build proper date query
    const dateQuery = {};
    
    if (startDate && startDate !== 'undefined') {
      try {
        const start = new Date(startDate);
        // Set to start of day (00:00:00)
        start.setHours(0, 0, 0, 0);
        
        if (isNaN(start.getTime())) {
          throw new Error(`Invalid startDate: ${startDate}`);
        }
        dateQuery.$gte = start;
        console.log('✅ Start date:', start);
      } catch (err) {
        console.error('❌ Start date error:', err.message);
        return res.status(400).json(new ApiResponse(400, null, `Invalid startDate format: ${startDate}. Use YYYY-MM-DD`));
      }
    }
    
    if (endDate && endDate !== 'undefined') {
      try {
        const end = new Date(endDate);
        // Set to end of day (23:59:59)
        end.setHours(23, 59, 59, 999);
        
        if (isNaN(end.getTime())) {
          throw new Error(`Invalid endDate: ${endDate}`);
        }
        dateQuery.$lte = end;
        console.log('✅ End date:', end);
      } catch (err) {
        console.error('❌ End date error:', err.message);
        return res.status(400).json(new ApiResponse(400, null, `Invalid endDate format: ${endDate}. Use YYYY-MM-DD`));
      }
    }

    console.log('🔍 Date query object:', JSON.stringify(dateQuery, null, 2));
    
    // DEBUG: Check total orders in database
    if (type === 'orders') {
      const totalOrders = await Order.countDocuments();
      console.log(`📊 TOTAL orders in database: ${totalOrders}`);
      const ordersByDateRange = await Order.countDocuments(Object.keys(dateQuery).length ? { createdAt: dateQuery } : {});
      console.log(`📊 Orders in date range [${startDate} to ${endDate}]: ${ordersByDateRange}`);
    }

    switch (type) {
      case 'orders':
        console.log('🔎 Querying orders with filter:', Object.keys(dateQuery).length ? { createdAt: dateQuery } : 'NO FILTER');
        data = await Order.find(Object.keys(dateQuery).length ? { createdAt: dateQuery } : {})
          .populate('user', 'name email')
          .populate('canteen', 'name')
          .populate('items.menuItem', 'name price')
          .sort({ createdAt: -1 })
          .lean();
        
        console.log(`📦 Found ${data.length} orders`);
        
        data = data.map(order => ({
          orderId: order._id.toString().slice(-6).toUpperCase(),
          customer: order.user?.name || 'N/A',
          email: order.user?.email || 'N/A',
          canteen: order.canteen?.name || 'N/A',
          itemCount: order.items?.length || 0,
          totalAmount: order.finalAmount,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          orderStatus: order.status,
          orderMode: order.orderMode,
          date: new Date(order.createdAt).toLocaleDateString('en-IN')
        }));
        break;

      case 'revenue':
        console.log('🔎 Querying revenue aggregation with filter:', Object.keys(dateQuery).length ? { createdAt: dateQuery } : 'NO FILTER');
        data = await Order.aggregate([
          { $match: { status: { $ne: 'cancelled' }, ...(Object.keys(dateQuery).length && { createdAt: dateQuery }) } },
          { $group: { 
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              totalRevenue: { $sum: '$finalAmount' },
              totalOrders: { $sum: 1 },
              codAmount: { $sum: { $cond: [{ $eq: ['$paymentMethod', 'cash'] }, '$finalAmount', 0] } },
              onlineAmount: { $sum: { $cond: [{ $in: ['$paymentMethod', ['upi', 'card']] }, '$finalAmount', 0] } }
            }
          },
          { $project: {
              date: '$_id',
              totalRevenue: 1,
              totalOrders: 1,
              codAmount: 1,
              onlineAmount: 1,
              _id: 0
            }
          },
          { $sort: { date: 1 } }
        ]);
        console.log(`📦 Found ${data.length} revenue records`);
        break;

      case 'payment':
        console.log('🔎 Querying payments with filter:', Object.keys(dateQuery).length ? { createdAt: dateQuery } : 'NO FILTER');
        const transactions = await Transaction.find(Object.keys(dateQuery).length ? { createdAt: dateQuery } : {})
          .populate('user', 'name')
          .populate('order', '_id finalAmount')
          .sort({ createdAt: -1 })
          .lean();
        
        console.log(`📦 Found ${transactions.length} payment records`);
        
        data = transactions.map(txn => ({
          transactionId: txn._id.toString().slice(-6).toUpperCase(),
          user: txn.user?.name || 'N/A',
          orderId: txn.order?._id?.toString().slice(-6).toUpperCase() || 'N/A',
          type: txn.type,
          amount: txn.amount,
          paymentMethod: txn.paymentMethod || 'N/A',
          status: txn.status,
          date: new Date(txn.createdAt).toLocaleDateString('en-IN')
        }));
        break;

      case 'top-items':
        data = await Order.aggregate([
          { $match: { status: { $ne: 'cancelled' }, ...(Object.keys(dateQuery).length && { createdAt: dateQuery }) } },
          { $unwind: '$items' },
          { $group: { 
              _id: '$items.menuItem',
              totalSold: { $sum: '$items.quantity' },
              totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
            }
          },
          { $lookup: { from: 'menuitems', localField: '_id', foreignField: '_id', as: 'item' } },
          { $unwind: { path: '$item', preserveNullAndEmptyArrays: true } },
          { $project: {
              itemName: '$item.name',
              category: '$item.category',
              totalSold: 1,
              totalRevenue: 1,
              avgPrice: '$item.price',
              _id: 0
            }
          },
          { $sort: { totalSold: -1 } },
          { $limit: 100 }
        ]);
        break;

      case 'user-activity':
        data = await Order.aggregate([
          { $match: { ...(Object.keys(dateQuery).length && { createdAt: dateQuery }) } },
          { $group: { 
              _id: '$user',
              totalOrders: { $sum: 1 },
              totalSpent: { $sum: '$finalAmount' },
              lastOrder: { $max: '$createdAt' }
            }
          },
          { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
          { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
          { $project: {
              customerName: '$user.name',
              email: '$user.email',
              totalOrders: 1,
              totalSpent: 1,
              avgOrderValue: { $cond: [{ $eq: ['$totalOrders', 0] }, 0, { $round: [{ $divide: ['$totalSpent', '$totalOrders'] }, 2] }] },
              _id: 0
            }
          },
          { $sort: { totalSpent: -1 } }
        ]);
        break;

      case 'cancelled':
        data = await Order.find({
          $or: [
            { status: 'cancelled' },
            { paymentStatus: 'failed' }
          ],
          ...(Object.keys(dateQuery).length && { createdAt: dateQuery })
        })
          .populate('user', 'name')
          .populate('canteen', 'name')
          .sort({ createdAt: -1 })
          .lean();
        
        data = data.map(order => ({
          orderId: order._id.toString().slice(-6).toUpperCase(),
          customer: order.user?.name || 'N/A',
          canteen: order.canteen?.name || 'N/A',
          amount: order.finalAmount,
          orderStatus: order.status,
          paymentStatus: order.paymentStatus,
          reason: order.status === 'cancelled' ? 'Order Cancelled' : 'Payment Failed',
          date: new Date(order.createdAt).toLocaleDateString('en-IN')
        }));
        break;

      case 'canteen-performance':
        data = await Order.aggregate([
          { $match: { status: { $ne: 'cancelled' }, ...(Object.keys(dateQuery).length && { createdAt: dateQuery }) } },
          { $group: { 
              _id: '$canteen',
              totalOrders: { $sum: 1 },
              totalRevenue: { $sum: '$finalAmount' },
              avgOrderValue: { $avg: '$finalAmount' }
            }
          },
          { $lookup: { from: 'canteens', localField: '_id', foreignField: '_id', as: 'canteen' } },
          { $unwind: { path: '$canteen', preserveNullAndEmptyArrays: true } },
          { $project: {
              canteenName: '$canteen.name',
              totalOrders: 1,
              totalRevenue: 1,
              avgOrderValue: { $round: ['$avgOrderValue', 2] },
              _id: 0
            }
          },
          { $sort: { totalRevenue: -1 } }
        ]);
        break;

      case 'item-sales':
        data = await Order.aggregate([
          { $match: { status: { $ne: 'cancelled' }, ...(Object.keys(dateQuery).length && { createdAt: dateQuery }) } },
          { $unwind: '$items' },
          { $group: { 
              _id: '$items.menuItem',
              totalSold: { $sum: '$items.quantity' },
              revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
            }
          },
          { $lookup: { from: 'menuitems', localField: '_id', foreignField: '_id', as: 'item' } },
          { $unwind: { path: '$item', preserveNullAndEmptyArrays: true } },
          { $project: { 
              name: '$item.name',
              category: '$item.category',
              totalSold: 1,
              revenue: 1,
              price: '$item.price',
              _id: 0
            }
          },
          { $sort: { totalSold: -1 } }
        ]);
        break;

      default:
        return res.status(400).json(new ApiResponse(400, null, 'Invalid report type'));
    }

    // Excel disabled - CSV + JSON only
    if (format === 'excel') {
      // Fallback to JSON format for Excel requests
      format = 'json';
    }
    
    console.log(`✅ ${type} Report - Data Count:`, data?.length || 0, 'Sample:', data?.[0] || 'NO DATA');
    
    // Sanitize data - replace undefined/null with empty strings
    const sanitizedData = (data || []).map(row => {
      const sanitized = {};
      Object.keys(row).forEach(key => {
        const value = row[key];
        if (value === undefined || value === null) {
          sanitized[key] = '';
        } else if (typeof value === 'object') {
          sanitized[key] = JSON.stringify(value);
        } else {
          sanitized[key] = value;
        }
      });
      return sanitized;
    });
    
    console.log(`📤 Sanitized data count: ${sanitizedData.length}`);
    console.log(`📤 First sanitized record:`, sanitizedData[0] || 'EMPTY');
    
    if (format === 'csv') {
      try {
        if (!sanitizedData || sanitizedData.length === 0) {
          console.warn('⚠️ CSV Export: No data to export');
          res.setHeader('Content-Type', 'text/csv; charset=utf-8');
          res.setHeader('Content-Disposition', `attachment; filename="${type}-report.csv"`);
          return res.send('');
        }

        const parser = new Parser();
        let csv = parser.parse(sanitizedData);
        
        // Clean up any whitespace
        csv = csv.trim();
        
        console.log(`✅ CSV Generated - Size: ${csv.length} bytes, Records: ${sanitizedData.length}`);
        console.log('📋 CSV Preview (first 150 chars):\n', csv.substring(0, 150));
        
        // Set proper headers for CSV download - CRITICAL!
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${type}-report-${new Date().toISOString().split('T')[0]}.csv"`);
        res.setHeader('Content-Length', Buffer.byteLength(csv, 'utf-8'));
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        
        // Send CSV directly
        return res.end(csv, 'utf-8');
      } catch (error) {
        console.error(`❌ CSV export error:`, error);
        return res.status(500).json(new ApiResponse(500, null, `CSV export failed: ${error.message}`));
      }
    }

    // JSON format - return as downloadable file
    if (format === 'json') {
      try {
        const jsonContent = JSON.stringify(sanitizedData, null, 2);
        const buffer = Buffer.from(jsonContent, 'utf-8');
        
        console.log(`✅ JSON Generated - Size: ${buffer.length} bytes, Records: ${sanitizedData.length}`);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${type}-report.json"`);
        res.setHeader('Content-Length', buffer.length);
        return res.end(buffer);
      } catch (error) {
        console.error('❌ JSON export error:', error);
        return res.status(500).json(new ApiResponse(500, null, error.message));
      }
    }

    res.json(new ApiResponse(200, { data, type }));
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// ==================== 8. SUBSCRIPTION PLANS ====================

export const createPlan = async (req, res) => {
  try {
    const plan = new SubscriptionPlan(req.body);
    await plan.save();
    res.status(201).json(new ApiResponse(201, { plan }, 'Plan created'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await SubscriptionPlan.findByIdAndUpdate(id, req.body, { new: true });
    res.json(new ApiResponse(200, { plan }, 'Plan updated'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    await SubscriptionPlan.findByIdAndDelete(id);
    res.json(new ApiResponse(200, null, 'Plan deleted'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

export const getAllPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find();
    res.json(new ApiResponse(200, { plans }));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// ==================== 9. NOTIFICATIONS ====================

export const sendNotification = async (req, res) => {
  try {
    const { type, recipients, subject, message, template } = req.body;

    const notification = new Notification({
      type,
      recipients,
      subject,
      message,
      template,
      sentBy: req.user._id,
      status: 'sent',
      sentAt: new Date()
    });

    await notification.save();
    res.status(201).json(new ApiResponse(201, { notification }, 'Notification sent'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const notifications = await Notification.find()
      .populate('sentBy', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Notification.countDocuments();
    res.json(new ApiResponse(200, { notifications, total, page: parseInt(page), pages: Math.ceil(total / limit) }));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// ==================== 9.5. ADMIN SETTINGS ====================

export const getAdminSettings = async (req, res) => {
  try {
    let settings = await AdminSettings.findOne();
    
    // Create default settings if not found
    if (!settings) {
      settings = new AdminSettings();
      await settings.save();
    }

    res.json(new ApiResponse(200, { settings }));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

export const updateAdminSettings = async (req, res) => {
  try {
    const { adminProfile, restaurantSettings, operatingHours, menuSettings, healthStatus, preferences } = req.body;
    
    let settings = await AdminSettings.findOne();
    
    if (!settings) {
      settings = new AdminSettings();
    }

    // Update fields
    if (adminProfile) settings.adminProfile = { ...settings.adminProfile, ...adminProfile };
    if (restaurantSettings) settings.restaurantSettings = { ...settings.restaurantSettings, ...restaurantSettings };
    if (operatingHours) settings.operatingHours = { ...settings.operatingHours, ...operatingHours };
    if (menuSettings) settings.menuSettings = { ...settings.menuSettings, ...menuSettings };
    if (healthStatus) settings.healthStatus = { ...settings.healthStatus, ...healthStatus, lastChecked: new Date() };
    if (preferences) settings.preferences = { ...settings.preferences, ...preferences };

    settings.updatedBy = req.user._id;
    await settings.save();

    res.json(new ApiResponse(200, { settings }, 'Settings updated successfully'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

export const getRestaurantInfo = async (req, res) => {
  try {
    let settings = await AdminSettings.findOne();
    
    if (!settings) {
      settings = new AdminSettings();
      await settings.save();
    }

    res.json(new ApiResponse(200, { 
      name: settings.restaurantSettings.name,
      address: settings.restaurantSettings.address,
      contactNumber: settings.restaurantSettings.contactNumber,
      isOpen: settings.restaurantSettings.isOpen
    }));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

export const updateRestaurantInfo = async (req, res) => {
  try {
    const { name, address, contactNumber, isOpen } = req.body;
    
    let settings = await AdminSettings.findOne();
    if (!settings) {
      settings = new AdminSettings();
    }

    settings.restaurantSettings = {
      ...settings.restaurantSettings,
      name: name || settings.restaurantSettings.name,
      address: address || settings.restaurantSettings.address,
      contactNumber: contactNumber || settings.restaurantSettings.contactNumber,
      isOpen: isOpen !== undefined ? isOpen : settings.restaurantSettings.isOpen
    };

    await settings.save();

    res.json(new ApiResponse(200, { restaurantSettings: settings.restaurantSettings }, 'Restaurant info updated'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

export const getHealthStatus = async (req, res) => {
  try {
    let settings = await AdminSettings.findOne();
    
    if (!settings) {
      settings = new AdminSettings();
      await settings.save();
    }

    res.json(new ApiResponse(200, { healthStatus: settings.healthStatus }));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

export const updateHealthStatus = async (req, res) => {
  try {
    const { status, maintenanceMode, maintenanceMessage, healthNotes } = req.body;
    
    let settings = await AdminSettings.findOne();
    if (!settings) {
      settings = new AdminSettings();
    }

    settings.healthStatus = {
      ...settings.healthStatus,
      status: status || settings.healthStatus.status,
      maintenanceMode: maintenanceMode !== undefined ? maintenanceMode : settings.healthStatus.maintenanceMode,
      maintenanceMessage: maintenanceMessage || settings.healthStatus.maintenanceMessage,
      healthNotes: healthNotes || settings.healthStatus.healthNotes,
      lastChecked: new Date()
    };

    await settings.save();

    res.json(new ApiResponse(200, { healthStatus: settings.healthStatus }, 'Health status updated'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// ==================== 10. SYSTEM CONFIGURATION ====================

export const getSystemConfig = async (req, res) => {
  try {
    const configs = await SystemConfig.find();
    res.json(new ApiResponse(200, { configs }));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

export const updateSystemConfig = async (req, res) => {
  try {
    const { key, value, category, description } = req.body;
    
    const config = await SystemConfig.findOneAndUpdate(
      { key },
      { value, category, description },
      { new: true, upsert: true }
    );

    res.json(new ApiResponse(200, { config }, 'Config updated'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// ==================== 11. PLATFORM HEALTH ====================

export const getSystemHealth = async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date(),
      database: 'connected',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    };

    res.json(new ApiResponse(200, { health }));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

export const getPerformanceMetrics = async (req, res) => {
  try {
    const [totalOrders, avgResponseTime] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $match: { actualTime: { $exists: true } } },
        { $group: { _id: null, avg: { $avg: '$actualTime' } } }
      ])
    ]);

    const metrics = {
      totalOrders,
      avgResponseTime: avgResponseTime[0]?.avg || 0,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024
    };

    res.json(new ApiResponse(200, { metrics }));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

export default {
  getAdminStats,
  getTopSellingItems,
  getActiveCanteens,
  getUserGrowth,
  getOrderVolumeChart,
  getCategorySales,
  getAllUsers,
  createUser,
  updateUserStatus,
  updateUserRole,
  exportUsers,
  createCanteen,
  updateCanteen,
  updateCanteenStatus,
  deleteCanteen,
  getAllCanteens,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getAllMenuItems,
  getAllOrders,
  updateOrderStatus,
  refundOrder,
  getAllTransactions,
  getAllSettlements,
  approveSettlement,
  generateReport,
  createPlan,
  updatePlan,
  deletePlan,
  getAllPlans,
  sendNotification,
  getNotifications,
  getAdminSettings,
  updateAdminSettings,
  getRestaurantInfo,
  updateRestaurantInfo,
  getHealthStatus,
  updateHealthStatus,
  getSystemConfig,
  updateSystemConfig,
  getSystemHealth,
  getPerformanceMetrics
};
