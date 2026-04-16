import mongoose from 'mongoose';

const canteenSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    location: {
      building: String,
      floor: String,
      coordinates: { latitude: Number, longitude: Number }
    },
    description: String,
    image: String,
    operatingHours: {
      open: String,
      close: String,
      daysOpen: [String]
    },
    cuisines: [String],
    avgRating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
    serviceTypes: {
      dineIn: Boolean,
      takeaway: Boolean,
      delivery: Boolean
    },
    specialOffers: [
      {
        title: String,
        description: String,
        discount: Number,
        validUntil: Date
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model('Canteen', canteenSchema);
