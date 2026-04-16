import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import User from '../models/User.js';
import Canteen from '../models/Canteen.js';
import ApiResponse from '../utils/apiResponse.js';

// Get Dashboard Stats
export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total orders today
    const ordersToday = await Order.countDocuments({
      createdAt: { $gte: today },
      status: { $ne: 'cancelled' }
    });

    // Revenue today
    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today },
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$finalAmount' }
        }
      }
    ]);

    const revenueToday = revenueData[0]?.totalRevenue || 0;

    // Active orders (not completed or cancelled)
    const activeOrders = await Order.countDocuments({
      status: { $in: ['pending', 'confirmed', 'preparing', 'ready'] }
    });

    // Total active users (users with orders in last 7 days)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeUsers = await Order.distinct('user', {
      createdAt: { $gte: sevenDaysAgo }
    });

    return res.json(new ApiResponse(200, {
      stats: [
        { icon: 'ShoppingCart', label: 'Total Orders Today', value: ordersToday, change: '+12%', color: 'primary' },
        { icon: 'TrendingUp', label: 'Revenue Today', value: `₹${revenueToday.toLocaleString()}`, change: '+8%', color: 'primary' },
        { icon: 'Box', label: 'Active Orders', value: activeOrders, change: '+3', color: 'secondary' },
        { icon: 'Users', label: 'Active Users', value: activeUsers.length, change: '+45', color: 'secondary' },
      ]
    }, 'Dashboard stats fetched successfully'));
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// Get Sales Data for Peak Hour Traffic
export const getPeakHourData = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get hourly data for today
    const hourlyData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          orders: { $sum: 1 },
          revenue: { $sum: '$finalAmount' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const salesData = hourlyData.map(item => ({
      time: `${item._id.toString().padStart(2, '0')}:00`,
      orders: item.orders,
      revenue: item.revenue
    }));

    return res.json(new ApiResponse(200, { salesData }, 'Peak hour data fetched'));
  } catch (error) {
    console.error('Error fetching peak hour data:', error);
    return res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// Get Revenue Data for Week
export const getWeeklyRevenue = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const revenueByDay = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          revenue: { $sum: '$finalAmount' }
        }
      }
    ]);

    const revenueData = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setDate(date.getDate() + i);
      const dayOfWeek = date.getDay();
      const dayRevenue = revenueByDay.find(d => d._id === dayOfWeek + 1);
      
      revenueData.push({
        date: days[dayOfWeek],
        revenue: dayRevenue?.revenue || 0,
        target: 15000 + (i * 500)
      });
    }

    return res.json(new ApiResponse(200, { revenueData }, 'Weekly revenue fetched'));
  } catch (error) {
    console.error('Error fetching weekly revenue:', error);
    return res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// Get Top Items
export const getTopItems = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const topItems = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: '$items.menuItem',
          orders: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      {
        $sort: { orders: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: 'menuitems',
          localField: '_id',
          foreignField: '_id',
          as: 'menuItem'
        }
      },
      {
        $unwind: '$menuItem'
      }
    ]);

    const formattedTopItems = topItems.map(item => ({
      id: item._id,
      name: item.menuItem.name,
      orders: item.orders,
      revenue: item.revenue,
      stock: item.menuItem.quantity || 45,
      category: item.menuItem.category || 'general'
    }));

    return res.json(new ApiResponse(200, { topItems: formattedTopItems }, 'Top items fetched'));
  } catch (error) {
    console.error('Error fetching top items:', error);
    return res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// Get Live Orders
export const getLiveOrders = async (req, res) => {
  try {
    const liveOrders = await Order.find({
      status: { $in: ['pending', 'confirmed', 'preparing', 'ready'] }
    })
      .populate('user', 'name')
      .populate('items.menuItem', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const formattedOrders = liveOrders.map(order => ({
      id: order._id,
      student: order.user?.name || 'Unknown',
      items: order.items.map(i => i.menuItem?.name).join(', '),
      status: order.status,
      time: calculateTimeLeft(order.createdAt),
      table: order.tableNumber || 'Delivery'
    }));

    return res.json(new ApiResponse(200, { liveOrders: formattedOrders }, 'Live orders fetched'));
  } catch (error) {
    console.error('Error fetching live orders:', error);
    return res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// Get Menu Items
export const getMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ isAvailable: true })
      .limit(3);

    const formattedItems = menuItems.map(item => ({
      id: item._id,
      name: item.name,
      category: item.category || 'general',
      price: item.price,
      image: '🍗',
      stock: item.quantity || 45,
      daily: true
    }));

    return res.json(new ApiResponse(200, { menuItems: formattedItems }, 'Menu items fetched'));
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// Get Low Stock Alerts
export const getLowStockAlerts = async (req, res) => {
  try {
    const lowStockItems = await MenuItem.find({
      quantity: { $lt: 20 },
      isAvailable: true
    })
      .sort({ quantity: 1 })
      .limit(5);

    const alerts = lowStockItems.map(item => ({
      id: item._id,
      item: item.name,
      stock: item.quantity,
      minLevel: 20,
      unit: 'kg'
    }));

    return res.json(new ApiResponse(200, { alerts }, 'Low stock alerts fetched'));
  } catch (error) {
    console.error('Error fetching low stock alerts:', error);
    return res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// Get Staff
export const getStaff = async (req, res) => {
  try {
    const staff = await User.find({
      role: { $in: ['staff', 'canteen_manager'] }
    }).limit(3);

    const formattedStaff = staff.map(member => ({
      id: member._id,
      name: member.name,
      role: member.role === 'canteen_manager' ? 'Manager' : 'Staff',
      shift: '8AM-2PM',
      status: member.isActive ? 'Present' : 'Absent',
      performance: 4.5 + Math.random() * 0.4
    }));

    return res.json(new ApiResponse(200, { staff: formattedStaff }, 'Staff fetched'));
  } catch (error) {
    console.error('Error fetching staff:', error);
    return res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// Get Coupons
export const getCoupons = async (req, res) => {
  try {
    // Mock coupons - can be replaced with actual Coupon model
    const coupons = [
      { id: 1, code: 'SAVE20', discount: '20%', type: 'Percentage', usage: '45/100', status: 'Active' },
      { id: 2, code: 'WELCOME50', discount: '₹50', type: 'Flat', usage: '120/150', status: 'Active' },
      { id: 3, code: 'LUNCH15', discount: '15%', type: 'Percentage', usage: '30/100', status: 'Active' },
    ];

    return res.json(new ApiResponse(200, { coupons }, 'Coupons fetched'));
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// Get Category Distribution
export const getCategoryDistribution = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const distribution = await MenuItem.aggregate([
      {
        $match: { isAvailable: true }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalItems = distribution.reduce((sum, item) => sum + item.count, 0);
    const categoryData = distribution.map(item => ({
      name: item._id || 'Unknown',
      value: Math.round((item.count / totalItems) * 100),
      color: item._id === 'breakfast' ? '#10b981' : '#f97316'
    }));

    return res.json(new ApiResponse(200, { categoryData }, 'Category distribution fetched'));
  } catch (error) {
    console.error('Error fetching category distribution:', error);
    return res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// Update Order Status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json(new ApiResponse(400, null, 'Order ID and status required'));
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate('user items.menuItem');

    return res.json(new ApiResponse(200, { order }, 'Order status updated'));
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// Add Menu Item
export const addMenuItem = async (req, res) => {
  try {
    const { name, price, category, description } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json(new ApiResponse(400, null, 'Required fields missing'));
    }

    const newItem = new MenuItem({
      name,
      price,
      category,
      description,
      quantity: 50,
      isAvailable: true
    });

    await newItem.save();

    return res.status(201).json(new ApiResponse(201, { item: newItem }, 'Menu item added'));
  } catch (error) {
    console.error('Error adding menu item:', error);
    return res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// Helper function to calculate time left
function calculateTimeLeft(createdAt) {
  const now = new Date();
  const diff = Math.round((now - new Date(createdAt)) / 1000 / 60); // minutes
  
  if (diff < 1) return '< 1 min';
  if (diff === 1) return '1 min';
  if (diff < 60) return `${diff} min`;
  
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  return `${hours}h ${mins}m`;
}

export default {
  getDashboardStats,
  getPeakHourData,
  getWeeklyRevenue,
  getTopItems,
  getLiveOrders,
  getMenuItems,
  getLowStockAlerts,
  getStaff,
  getCoupons,
  getCategoryDistribution,
  updateOrderStatus,
  addMenuItem
};
