import Canteen from '../models/Canteen.js';
import MenuItem from '../models/MenuItem.js';

export const getAllCanteens = async (req, res) => {
  try {
    const canteens = await Canteen.find({ isActive: true })
      .populate('manager', 'name email');

    // Fetch and attach menu items for each canteen
    const canteensWithItems = await Promise.all(
      canteens.map(async (canteen) => {
        const menuItems = await MenuItem.find({ canteen: canteen._id, isAvailable: true });
        return {
          ...canteen.toObject(),
          menuItems: menuItems
        };
      })
    );

    res.json({ success: true, canteens: canteensWithItems });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCanteenById = async (req, res) => {
  try {
    const canteen = await Canteen.findById(req.params.id)
      .populate('manager', 'name email');

    if (!canteen) {
      return res.status(404).json({ error: 'Canteen not found' });
    }

    // Fetch menu items for this canteen
    const menuItems = await MenuItem.find({ canteen: canteen._id, isAvailable: true });
    const canteenWithItems = {
      ...canteen.toObject(),
      menuItems: menuItems
    };

    res.json({ success: true, canteen: canteenWithItems });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createCanteen = async (req, res) => {
  try {
    const { name, location, description, cuisines, serviceTypes } = req.body;

    const canteen = new Canteen({
      name,
      location,
      description,
      cuisines,
      serviceTypes,
      manager: req.userId
    });

    await canteen.save();
    res.status(201).json({ success: true, canteen });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const searchCanteens = async (req, res) => {
  try {
    const { q, cuisine } = req.query;

    let query = { isActive: true };

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    if (cuisine) {
      query.cuisines = { $in: [cuisine] };
    }

    const canteens = await Canteen.find(query)
      .populate('manager', 'name email');

    // Fetch and attach menu items for each canteen
    const canteensWithItems = await Promise.all(
      canteens.map(async (canteen) => {
        const menuItems = await MenuItem.find({ canteen: canteen._id, isAvailable: true });
        return {
          ...canteen.toObject(),
          menuItems: menuItems
        };
      })
    );

    res.json({ success: true, canteens: canteensWithItems });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const debugMenuItems = async (req, res) => {
  try {
    const canteens = await Canteen.find({ isActive: true });
    const totalMenuItems = await MenuItem.countDocuments();
    
    const canteenDetails = await Promise.all(
      canteens.map(async (canteen) => {
        const count = await MenuItem.countDocuments({ canteen: canteen._id });
        const items = await MenuItem.find({ canteen: canteen._id }).limit(1);
        return {
          canteenId: canteen._id,
          canteenName: canteen.name,
          itemCount: count,
          sampleItem: items[0] || 'No items'
        };
      })
    );

    res.json({ 
      success: true, 
      totalMenuItems,
      canteenDetails
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
