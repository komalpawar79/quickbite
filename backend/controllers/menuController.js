import MenuItem from '../models/MenuItem.js';
import Canteen from '../models/Canteen.js';
import ApiResponse from '../utils/apiResponse.js';
import websocketService from '../services/websocketService.js';

/**
 * Get menu items by canteen ID
 * Query params: cuisine, category, sortBy
 */
export const getMenuByCanteen = async (req, res) => {
  try {
    const { canteenId } = req.params;
    const { cuisine, category, sortBy } = req.query;

    // Validate canteen exists
    const canteen = await Canteen.findById(canteenId);
    if (!canteen) {
      return res.status(404).json(
        new ApiResponse(404, null, 'Canteen not found')
      );
    }

    // Build query
    let query = { canteen: canteenId, isAvailable: true };
    
    if (cuisine) query.cuisine = cuisine;
    if (category) query.category = category;

    // Build sort
    let sortOptions = {};
    if (sortBy === 'price') sortOptions = { price: 1 };
    if (sortBy === 'rating') sortOptions = { rating: -1 };
    if (sortBy === 'popular') sortOptions = { ordersCount: -1 };
    if (sortBy === 'newest') sortOptions = { createdAt: -1 };

    // Fetch menu items
    const menuItems = await MenuItem.find(query)
      .sort(sortOptions)
      .populate('canteen', 'name location');

    res.status(200).json(
      new ApiResponse(200, {
        count: menuItems.length,
        items: menuItems,
        canteen: canteen
      }, 'Menu items fetched successfully')
    );
  } catch (error) {
    console.error('Error in getMenuByCanteen:', error);
    res.status(500).json(
      new ApiResponse(500, null, `Error fetching menu: ${error.message}`)
    );
  }
};

/**
 * Get menu item by ID
 */
export const getMenuItemById = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id).populate('canteen', 'name location');
    
    if (!item) {
      return res.status(404).json(
        new ApiResponse(404, null, 'Menu item not found')
      );
    }

    res.status(200).json(
      new ApiResponse(200, { item }, 'Menu item fetched successfully')
    );
  } catch (error) {
    console.error('Error in getMenuItemById:', error);
    res.status(500).json(
      new ApiResponse(500, null, `Error fetching menu item: ${error.message}`)
    );
  }
};

/**
 * Search menu items across all canteens or specific canteen
 */
export const searchMenu = async (req, res) => {
  try {
    const { q, canteenId } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json(
        new ApiResponse(400, null, 'Search query is required')
      );
    }

    let query = {
      isAvailable: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    };

    // Filter by canteen if specified
    if (canteenId) {
      query.canteen = canteenId;
    }

    const items = await MenuItem.find(query)
      .limit(20)
      .populate('canteen', 'name location');

    res.status(200).json(
      new ApiResponse(200, {
        count: items.length,
        items
      }, 'Search completed successfully')
    );
  } catch (error) {
    console.error('Error in searchMenu:', error);
    res.status(500).json(
      new ApiResponse(500, null, `Error searching menu: ${error.message}`)
    );
  }
};

/**
 * Get top recommendations for a canteen
 */
export const getRecommendations = async (req, res) => {
  try {
    const { canteenId } = req.params;
    const limit = parseInt(req.query.limit) || 8;

    // Validate canteen exists
    const canteen = await Canteen.findById(canteenId);
    if (!canteen) {
      return res.status(404).json(
        new ApiResponse(404, null, 'Canteen not found')
      );
    }

    const topItems = await MenuItem.find({
      canteen: canteenId,
      isAvailable: true
    })
      .sort({ ordersCount: -1, rating: -1 })
      .limit(limit)
      .populate('canteen', 'name location');

    res.status(200).json(
      new ApiResponse(200, {
        count: topItems.length,
        recommendations: topItems
      }, 'Recommendations fetched successfully')
    );
  } catch (error) {
    console.error('Error in getRecommendations:', error);
    res.status(500).json(
      new ApiResponse(500, null, `Error fetching recommendations: ${error.message}`)
    );
  }
};

/**
 * Get all available menu items (no filter)
 */
export const getAllMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find({ isAvailable: true })
      .populate('canteen', 'name location');

    res.status(200).json(
      new ApiResponse(200, {
        count: items.length,
        items
      }, 'All menu items fetched successfully')
    );
  } catch (error) {
    console.error('Error in getAllMenuItems:', error);
    res.status(500).json(
      new ApiResponse(500, null, `Error fetching menu items: ${error.message}`)
    );
  }
};

/**
 * Get menu items by category
 */
export const getMenuByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const items = await MenuItem.find({ 
      category, 
      isAvailable: true 
    })
      .populate('canteen', 'name location');

    res.status(200).json(
      new ApiResponse(200, {
        count: items.length,
        items
      }, `Menu items in ${category} fetched successfully`)
    );
  } catch (error) {
    console.error('Error in getMenuByCategory:', error);
    res.status(500).json(
      new ApiResponse(500, null, `Error fetching menu by category: ${error.message}`)
    );
  }
};

/**
 * Add new menu item
 */
export const addMenuItem = async (req, res) => {
  try {
    const { name, price, category, description, canteen } = req.body;

    // Validation
    if (!name || !price || !category || !canteen) {
      return res.status(400).json(
        new ApiResponse(400, null, 'Required fields: name, price, category, canteen')
      );
    }

    // Verify canteen exists
    const canteenExists = await Canteen.findById(canteen);
    if (!canteenExists) {
      return res.status(404).json(
        new ApiResponse(404, null, 'Canteen not found')
      );
    }

    // Create menu item
    const newItem = new MenuItem({
      name,
      price: parseFloat(price),
      category,
      description,
      canteen,
      isAvailable: true,
      preparationTime: 15,
      rating: 0,
      ordersCount: 0,
      spiceLevel: 'medium'
    });

    const savedItem = await newItem.save();
    const populatedItem = await MenuItem.findById(savedItem._id).populate('canteen', 'name');

    // Notify admin dashboard of menu update
    websocketService.emitMenuUpdated(canteen, { action: 'item-added', item: populatedItem });

    res.status(201).json(
      new ApiResponse(201, { item: populatedItem }, 'Menu item added successfully')
    );
  } catch (error) {
    console.error('Error adding menu item:', error);
    res.status(500).json(
      new ApiResponse(500, null, `Error adding menu item: ${error.message}`)
    );
  }
};

/**
 * Update menu item
 */
export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, description, isAvailable } = req.body;

    // Find and update item
    const updatedItem = await MenuItem.findByIdAndUpdate(
      id,
      {
        ...(name && { name }),
        ...(price && { price: parseFloat(price) }),
        ...(category && { category }),
        ...(description && { description }),
        ...(isAvailable !== undefined && { isAvailable })
      },
      { new: true, runValidators: true }
    ).populate('canteen', 'name');

    if (!updatedItem) {
      return res.status(404).json(
        new ApiResponse(404, null, 'Menu item not found')
      );
    }

    // Notify admin dashboard of menu update
    websocketService.emitMenuUpdated(updatedItem.canteen, { action: 'item-updated', item: updatedItem });

    res.status(200).json(
      new ApiResponse(200, { item: updatedItem }, 'Menu item updated successfully')
    );
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json(
      new ApiResponse(500, null, `Error updating menu item: ${error.message}`)
    );
  }
};

/**
 * Delete menu item
 */
export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedItem = await MenuItem.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json(
        new ApiResponse(404, null, 'Menu item not found')
      );
    }

    // Notify admin dashboard of menu update
    websocketService.emitMenuUpdated(deletedItem.canteen, { action: 'item-deleted', itemId: id });

    res.status(200).json(
      new ApiResponse(200, { id }, 'Menu item deleted successfully')
    );
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json(
      new ApiResponse(500, null, `Error deleting menu item: ${error.message}`)
    );
  }
};
