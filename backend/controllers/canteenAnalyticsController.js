import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import Canteen from '../models/Canteen.js';
import ApiResponse from '../utils/apiResponse.js';

// Get canteen KPIs
export const getCanteenKPIs = async (req, res) => {
  try {
    const { canteenId } = req.params;
    
    const canteen = await Canteen.findById(canteenId);
    if (!canteen) {
      return res.status(404).json(new ApiResponse(404, null, 'Canteen not found'));
    }
    
    if (req.user.role === 'canteen_manager' && canteen.manager?.toString() !== req.user._id.toString()) {
      return res.status(403).json(new ApiResponse(403, null, 'Access denied'));
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const canteenObjectId = canteen._id;

    const [todayOrders, todayRevenue, totalRevenue, activeOrders, completedOrders, totalMenuItems] = await Promise.all([
      Order.countDocuments({ canteen: canteenObjectId, createdAt: { $gte: today }, status: { $ne: 'cancelled' } }),
      Order.aggregate([
        { $match: { canteen: canteenObjectId, createdAt: { $gte: today }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$finalAmount' } } }
      ]),
      Order.aggregate([
        { $match: { canteen: canteenObjectId, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$finalAmount' } } }
      ]),
      Order.countDocuments({ canteen: canteenObjectId, status: { $in: ['pending', 'confirmed', 'preparing', 'ready'] } }),
      Order.countDocuments({ canteen: canteenObjectId, status: 'completed' }),
      MenuItem.countDocuments({ canteen: canteenObjectId })
    ]);

    res.json(new ApiResponse(200, {
      todayOrders,
      todayRevenue: todayRevenue[0]?.total || 0,
      totalRevenue: totalRevenue[0]?.total || 0,
      activeOrders,
      completedOrders,
      totalMenuItems
    }));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// Get popular items
export const getPopularItems = async (req, res) => {
  try {
    const { canteenId } = req.params;
    const { days = 7 } = req.query;
    
    const canteen = await Canteen.findById(canteenId);
    if (!canteen) {
      return res.status(404).json(new ApiResponse(404, null, 'Canteen not found'));
    }
    
    if (req.user.role === 'canteen_manager' && canteen.manager?.toString() !== req.user._id.toString()) {
      return res.status(403).json(new ApiResponse(403, null, 'Access denied'));
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const popularItems = await Order.aggregate([
      { $match: { canteen: canteen._id, createdAt: { $gte: startDate }, status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.menuItem', totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'menuitems', localField: '_id', foreignField: '_id', as: 'item' } },
      { $unwind: '$item' },
      { $project: { name: '$item.name', totalSold: 1, revenue: 1, price: '$item.price' } }
    ]);

    res.json(new ApiResponse(200, { popularItems }));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// Get revenue chart data
export const getRevenueChart = async (req, res) => {
  try {
    const { canteenId } = req.params;
    const { days = 7 } = req.query;
    
    const canteen = await Canteen.findById(canteenId);
    if (!canteen) {
      return res.status(404).json(new ApiResponse(404, null, 'Canteen not found'));
    }
    
    if (req.user.role === 'canteen_manager' && canteen.manager?.toString() !== req.user._id.toString()) {
      return res.status(403).json(new ApiResponse(403, null, 'Access denied'));
    }

    const chartDays = Array.from({ length: parseInt(days) }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (parseInt(days) - 1 - i));
      date.setHours(0, 0, 0, 0);
      return date;
    });

    const chartData = await Promise.all(
      chartDays.map(async (date) => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const [orders, revenue] = await Promise.all([
          Order.countDocuments({ canteen: canteen._id, createdAt: { $gte: date, $lt: nextDay }, status: { $ne: 'cancelled' } }),
          Order.aggregate([
            { $match: { canteen: canteen._id, createdAt: { $gte: date, $lt: nextDay }, paymentStatus: 'completed' } },
            { $group: { _id: null, total: { $sum: '$finalAmount' } } }
          ])
        ]);
        
        return { 
          date: date.toISOString().split('T')[0], 
          orders, 
          revenue: revenue[0]?.total || 0 
        };
      })
    );

    res.json(new ApiResponse(200, { chartData }));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};
