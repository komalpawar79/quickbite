import Canteen from '../models/Canteen.js';
import ApiResponse from '../utils/apiResponse.js';

// Get canteen settings
export const getCanteenSettings = async (req, res) => {
  try {
    const { canteenId } = req.params;
    
    const canteen = await Canteen.findById(canteenId).populate('manager', 'name email');
    if (!canteen) {
      return res.status(404).json(new ApiResponse(404, null, 'Canteen not found'));
    }
    
    if (req.user.role === 'canteen_manager' && canteen.manager?._id.toString() !== req.user._id.toString()) {
      return res.status(403).json(new ApiResponse(403, null, 'Access denied'));
    }

    res.json(new ApiResponse(200, { canteen }));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// Update canteen schedule
export const updateCanteenSchedule = async (req, res) => {
  try {
    const { canteenId } = req.params;
    const { operatingHours } = req.body;
    
    const canteen = await Canteen.findById(canteenId);
    if (!canteen) {
      return res.status(404).json(new ApiResponse(404, null, 'Canteen not found'));
    }
    
    if (req.user.role === 'canteen_manager' && canteen.manager?.toString() !== req.user._id.toString()) {
      return res.status(403).json(new ApiResponse(403, null, 'Access denied'));
    }

    canteen.operatingHours = operatingHours;
    await canteen.save();

    res.json(new ApiResponse(200, { canteen }, 'Schedule updated'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// Toggle canteen status
export const toggleCanteenStatus = async (req, res) => {
  try {
    const { canteenId } = req.params;
    
    const canteen = await Canteen.findById(canteenId);
    if (!canteen) {
      return res.status(404).json(new ApiResponse(404, null, 'Canteen not found'));
    }
    
    if (req.user.role === 'canteen_manager' && canteen.manager?.toString() !== req.user._id.toString()) {
      return res.status(403).json(new ApiResponse(403, null, 'Access denied'));
    }

    canteen.isActive = !canteen.isActive;
    await canteen.save();

    res.json(new ApiResponse(200, { canteen }, 'Status updated'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// Update canteen details
export const updateCanteenDetails = async (req, res) => {
  try {
    const { canteenId } = req.params;
    const { description, location, cuisines } = req.body;
    
    const canteen = await Canteen.findById(canteenId);
    if (!canteen) {
      return res.status(404).json(new ApiResponse(404, null, 'Canteen not found'));
    }
    
    if (req.user.role === 'canteen_manager' && canteen.manager?.toString() !== req.user._id.toString()) {
      return res.status(403).json(new ApiResponse(403, null, 'Access denied'));
    }

    if (description) canteen.description = description;
    if (location) canteen.location = location;
    if (cuisines) canteen.cuisines = cuisines;
    
    await canteen.save();

    res.json(new ApiResponse(200, { canteen }, 'Details updated'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};
