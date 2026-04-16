import mongoose from 'mongoose';

const adminSettingsSchema = new mongoose.Schema({
  // Admin Profile
  adminProfile: {
    name: { type: String, default: 'Admin' },
    email: { type: String, default: '' },
    mobile: { type: String, default: '' },
    profilePicture: { type: String, default: '' }
  },

  // Restaurant/System Settings
  restaurantSettings: {
    name: { type: String, default: 'Campus Canteen' },
    address: { type: String, default: 'University Main Block, Near Library, Mumbai' },
    contactNumber: { type: String, default: '' },
    websiteLogo: { type: String, default: '' },
    appLogo: { type: String, default: '' },
    isOpen: { type: Boolean, default: true }
  },

  // Operating Hours
  operatingHours: {
    opening: { type: String, default: '09:00' },
    closing: { type: String, default: '22:00' },
    operatingDays: { 
      type: [String], 
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }
  },

  // Menu Settings
  menuSettings: {
    itemsEnabled: { type: Boolean, default: true },
    allowPriceChange: { type: Boolean, default: true },
    categories: { 
      type: [String], 
      default: ['Food', 'Beverage', 'Snacks', 'Desserts']
    }
  },

  // Health Status
  healthStatus: {
    status: { 
      type: String, 
      enum: ['Healthy', 'Degraded', 'Down'], 
      default: 'Healthy'
    },
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: { type: String, default: '' },
    lastChecked: { type: Date, default: Date.now },
    healthNotes: { type: String, default: '' }
  },

  // System preferences
  preferences: {
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'Asia/Kolkata' }
  },

  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('AdminSettings', adminSettingsSchema);
