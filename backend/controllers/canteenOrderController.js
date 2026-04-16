import Order from '../models/Order.js';
import Canteen from '../models/Canteen.js';
import ApiResponse from '../utils/apiResponse.js';

// Get new orders for canteen
export const getNewOrders = async (req, res) => {
  try {
    const { canteenId } = req.params;
    
    const canteen = await Canteen.findById(canteenId);
    if (!canteen) {
      return res.status(404).json(new ApiResponse(404, null, 'Canteen not found'));
    }
    
    console.log('Canteen manager:', canteen.manager);
    console.log('User ID:', req.user._id);
    console.log('User role:', req.user.role);
    
    if (req.user.role === 'canteen_manager') {
      if (!canteen.manager || canteen.manager.toString() !== req.user._id.toString()) {
        return res.status(403).json(new ApiResponse(403, null, 'Access denied - You are not the manager of this canteen'));
      }
    }

    const orders = await Order.find({ 
      canteen: canteenId, 
      status: 'pending' 
    })
      .populate('user', 'name email')
      .populate('items.menuItem', 'name price')
      .sort({ createdAt: -1 });

    res.json(new ApiResponse(200, { orders }));
  } catch (error) {
    console.error('Get new orders error:', error);
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// Get active orders (confirmed, preparing, ready)
export const getActiveOrders = async (req, res) => {
  try {
    const { canteenId } = req.params;
    
    const canteen = await Canteen.findById(canteenId);
    if (!canteen) {
      return res.status(404).json(new ApiResponse(404, null, 'Canteen not found'));
    }
    
    if (req.user.role === 'canteen_manager' && canteen.manager?.toString() !== req.user._id.toString()) {
      return res.status(403).json(new ApiResponse(403, null, 'Access denied'));
    }

    const orders = await Order.find({ 
      canteen: canteenId, 
      status: { $in: ['confirmed', 'preparing', 'ready'] }
    })
      .populate('user', 'name email')
      .populate('items.menuItem', 'name price')
      .sort({ createdAt: -1 });

    res.json(new ApiResponse(200, { orders }));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId).populate('canteen');
    if (!order) {
      return res.status(404).json(new ApiResponse(404, null, 'Order not found'));
    }
    
    if (req.user.role === 'canteen_manager' && order.canteen.manager?.toString() !== req.user._id.toString()) {
      return res.status(403).json(new ApiResponse(403, null, 'Access denied'));
    }

    order.status = status;
    await order.save();

    const updatedOrder = await Order.findById(orderId)
      .populate('user', 'name email')
      .populate('canteen', 'name')
      .populate('items.menuItem', 'name price');

    res.json(new ApiResponse(200, { order: updatedOrder }, 'Order status updated'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// Get all orders for canteen (with filters)
export const getAllCanteenOrders = async (req, res) => {
  try {
    const { canteenId } = req.params;
    const { status, date, page = 1, limit = 20 } = req.query;
    
    const canteen = await Canteen.findById(canteenId);
    if (!canteen) {
      return res.status(404).json(new ApiResponse(404, null, 'Canteen not found'));
    }
    
    if (req.user.role === 'canteen_manager' && canteen.manager?.toString() !== req.user._id.toString()) {
      return res.status(403).json(new ApiResponse(403, null, 'Access denied'));
    }

    const query = { canteen: canteenId };
    if (status) query.status = status;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: startDate, $lte: endDate };
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.menuItem', 'name price')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);

    res.json(new ApiResponse(200, { orders, total, page: parseInt(page), pages: Math.ceil(total / limit) }));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};
