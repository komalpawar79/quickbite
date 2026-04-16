import MenuItem from '../models/MenuItem.js';
import Canteen from '../models/Canteen.js';
import ApiResponse from '../utils/apiResponse.js';
import websocketService from '../services/websocketService.js';

// Get canteen's menu items
export const getCanteenMenu = async (req, res) => {
  try {
    const { canteenId } = req.params;
    
    // Verify canteen belongs to manager
    const canteen = await Canteen.findById(canteenId);
    if (!canteen) {
      return res.status(404).json(new ApiResponse(404, null, 'Canteen not found'));
    }
    
    if (req.user.role === 'canteen_manager' && canteen.manager?.toString() !== req.user._id.toString()) {
      return res.status(403).json(new ApiResponse(403, null, 'Access denied'));
    }

    const items = await MenuItem.find({ canteen: canteenId })
      .sort({ createdAt: -1 });

    res.json(new ApiResponse(200, { items }));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// Add menu item
export const addMenuItem = async (req, res) => {
  try {
    const { canteenId } = req.params;
    
    const canteen = await Canteen.findById(canteenId);
    if (!canteen) {
      return res.status(404).json(new ApiResponse(404, null, 'Canteen not found'));
    }
    
    if (req.user.role === 'canteen_manager' && canteen.manager?.toString() !== req.user._id.toString()) {
      return res.status(403).json(new ApiResponse(403, null, 'Access denied'));
    }

    const item = new MenuItem({ ...req.body, canteen: canteenId });
    await item.save();
    
    const populatedItem = await MenuItem.findById(item._id).populate('canteen', 'name');
    
    // Emit WebSocket event for real-time updates
    websocketService.emitMenuItemAdded(canteenId, populatedItem);
    
    res.status(201).json(new ApiResponse(201, { item: populatedItem }, 'Menu item added'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// Update menu item
export const updateMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const item = await MenuItem.findById(itemId).populate('canteen');
    if (!item) {
      return res.status(404).json(new ApiResponse(404, null, 'Item not found'));
    }
    
    if (req.user.role === 'canteen_manager' && item.canteen.manager?.toString() !== req.user._id.toString()) {
      return res.status(403).json(new ApiResponse(403, null, 'Access denied'));
    }

    Object.assign(item, req.body);
    await item.save();
    
    const updatedItem = await MenuItem.findById(item._id).populate('canteen', 'name');
    
    // Emit WebSocket event for real-time updates
    websocketService.emitMenuItemUpdated(item.canteen._id, updatedItem);
    
    res.json(new ApiResponse(200, { item: updatedItem }, 'Menu item updated'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// Toggle item availability
export const toggleItemAvailability = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const item = await MenuItem.findById(itemId).populate('canteen');
    if (!item) {
      return res.status(404).json(new ApiResponse(404, null, 'Item not found'));
    }
    
    if (req.user.role === 'canteen_manager' && item.canteen.manager?.toString() !== req.user._id.toString()) {
      return res.status(403).json(new ApiResponse(403, null, 'Access denied'));
    }

    item.isAvailable = !item.isAvailable;
    await item.save();
    
    // Emit WebSocket event for real-time updates
    websocketService.emitMenuItemUpdated(item.canteen._id, item);
    
    res.json(new ApiResponse(200, { item }, 'Availability updated'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// Delete menu item
export const deleteMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const item = await MenuItem.findById(itemId).populate('canteen');
    if (!item) {
      return res.status(404).json(new ApiResponse(404, null, 'Item not found'));
    }
    
    if (req.user.role === 'canteen_manager' && item.canteen.manager?.toString() !== req.user._id.toString()) {
      return res.status(403).json(new ApiResponse(403, null, 'Access denied'));
    }

    const canteenId = item.canteen._id;
    
    await MenuItem.findByIdAndDelete(itemId);
    
    // Emit WebSocket event for real-time updates
    websocketService.emitMenuItemDeleted(canteenId, itemId);
    
    res.json(new ApiResponse(200, null, 'Menu item deleted'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};
