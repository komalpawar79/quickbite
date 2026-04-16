import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: {
      type: String,
      enum: ['student', 'staff', 'faculty', 'admin', 'canteen_manager'],
      default: 'student'
    },
    universityId: { type: String, required: true, unique: true },
    profileImage: { type: String },
    department: String,
    hostelNumber: String,
    preferences: {
      dietary: { type: String, enum: ['veg', 'non-veg', 'vegan', 'all'], default: 'all' },
      theme: { type: String, enum: ['light', 'dark'], default: 'light' },
      notifications: { type: Boolean, default: true }
    },
    loyaltyPoints: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    canteenAssigned: { type: mongoose.Schema.Types.ObjectId, ref: 'Canteen' }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
