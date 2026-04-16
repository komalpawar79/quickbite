import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

export const signup = async (req, res) => {
  try {
    const { name, email, password, phone, role, universityId, department } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Please fill all required fields (name, email, password)' 
      });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ 
        success: false,
        error: 'Email already registered. Please login or use different email.' 
      });
    }

    // Check if university ID already exists (only if provided)
    if (universityId) {
      let existingUser = await User.findOne({ universityId });
      if (existingUser) {
        return res.status(400).json({ 
          success: false,
          error: 'University ID already registered. Please use different ID.' 
        });
      }
    }

    user = new User({
      name,
      email,
      password,
      phone,
      role: role || 'student',
      universityId,
      department
    });

    await user.save();
    await user.populate('canteenAssigned');

    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        canteenId: user.canteenAssigned?._id,
        canteenName: user.canteenAssigned?.name || 'My Canteen',
        profileImage: user.profileImage,
        universityId: user.universityId,
        department: user.department,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'An error occurred during signup. Please try again.' 
    });
  }
};

export const login = async (req, res) => {
  try {
    console.log('Login attempt:', req.body.email);
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing credentials');
      return res.status(400).json({ 
        success: false,
        error: 'Please provide email and password' 
      });
    }

    console.log('Finding user...');
    const user = await User.findOne({ email }).select('+password').populate('canteenAssigned');
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ 
        success: false,
        error: 'Invalid email or password' 
      });
    }

    console.log('Comparing passwords...');
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ 
        success: false,
        error: 'Invalid email or password' 
      });
    }

    console.log('Generating token...');
    const token = generateToken(user._id);
    console.log('Login successful for:', email);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        canteenId: user.canteenAssigned?._id,
        canteenName: user.canteenAssigned?.name || 'My Canteen',
        profileImage: user.profileImage,
        universityId: user.universityId,
        department: user.department,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'An error occurred during login. Please try again.' 
    });
  }
};

export const logout = (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('canteenAssigned');
    res.json({ 
      success: true, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        canteenId: user.canteenAssigned?._id,
        canteenName: user.canteenAssigned?.name || 'My Canteen',
        profileImage: user.profileImage,
        universityId: user.universityId,
        department: user.department,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, department, universityId, profileImage } = req.body;
    
    const updateData = { name, phone, department, universityId };
    if (profileImage) {
      updateData.profileImage = profileImage;
    }
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const setupAdmin = async (req, res) => {
  try {
    // Check if any admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        error: 'Admin user already exists. Cannot create another admin.'
      });
    }

    const { name, email, password, universityId } = req.body;

    // Validate required fields
    if (!name || !email || !password || !universityId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email, password, and universityId'
      });
    }

    // Check if email already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Create admin user
    user = new User({
      name,
      email,
      password,
      universityId,
      role: 'admin',
      department: 'Administration',
      isVerified: true,
      isActive: true
    });

    await user.save();

    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Setup admin error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error creating admin user'
    });
  }
};

export default {
  signup,
  login,
  logout,
  getMe,
  updateProfile,
  setupAdmin
};