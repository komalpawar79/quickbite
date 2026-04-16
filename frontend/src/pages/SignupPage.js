import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    universityId: '',
    department: '',
    role: 'student',
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuthStore();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const { confirmPassword, ...signupData } = formData;
      const result = await signup(signupData);
      
      if (result && result.success) {
        toast.success('🎉 Account created! Welcome to QuickBite!');
        // Auto-login is already done by signup function
        // Just redirect to menu after a short delay
        setTimeout(() => navigate('/menu'), 800);
      } else {
        const errorMessage = result?.error || 'Signup failed. Please try again.';
        toast.error(errorMessage);
        console.error('Signup error response:', result);
      }
    } catch (error) {
      console.error('Signup catch error:', error);
      toast.error(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50   py-12 px-4">
      <motion.div
        className="max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Card */}
        <div className="bg-white  rounded-lg shadow-premium p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex justify-center">
              <img 
                src="/logo.png" 
                alt="QuickBite Logo" 
                className="h-20 w-auto object-contain"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                  mixBlendMode: 'multiply'
                }}
              />
            </div>
            <h1 className="text-3xl font-bold text-dark  mb-2">Create Account</h1>
            <p className="text-gray-600 ">Join Campus Canteen and start ordering</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-dark  mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-300  rounded-lg bg-white  text-dark  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            {/* Email & University ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-dark  mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@university.edu"
                  className="w-full px-4 py-3 border border-gray-300  rounded-lg bg-white  text-dark  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-dark  mb-2">
                  University ID <span className="text-gray-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="universityId"
                  value={formData.universityId}
                  onChange={handleChange}
                  placeholder="VIT123456"
                  className="w-full px-4 py-3 border border-gray-300  rounded-lg bg-white  text-dark  placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-dark  mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-300  rounded-lg bg-white  text-dark  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-dark  mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-300  rounded-lg bg-white  text-dark  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>

            {/* Role Selector */}
            <div>
              <label className="block text-sm font-semibold text-dark  mb-2">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center p-3 border-2 border-gray-300  rounded-lg cursor-pointer hover:border-primary-500 transition" style={{ borderColor: formData.role === 'student' ? '#f0b32f' : undefined }}>
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={formData.role === 'student'}
                    onChange={handleChange}
                    className="w-4 h-4 accent-primary-500"
                  />
                  <span className="ml-3 font-semibold text-dark ">👨‍🎓 Student</span>
                </label>
                <label className="flex items-center p-3 border-2 border-gray-300  rounded-lg cursor-pointer hover:border-primary-500 transition" style={{ borderColor: formData.role === 'staff' ? '#f0b32f' : undefined }}>
                  <input
                    type="radio"
                    name="role"
                    value="staff"
                    checked={formData.role === 'staff'}
                    onChange={handleChange}
                    className="w-4 h-4 accent-primary-500"
                  />
                  <span className="ml-3 font-semibold text-dark ">👨‍💼 Staff</span>
                </label>
              </div>
            </div>

            {/* Phone & Department */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-dark  mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXXXXXXX"
                  className="w-full px-4 py-3 border border-gray-300  rounded-lg bg-white  text-dark  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-dark  mb-2">
                  Department <span className="text-gray-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Computer Science"
                  className="w-full px-4 py-3 border border-gray-300  rounded-lg bg-white  text-dark  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-center space-x-2">
              <input type="checkbox" required className="rounded" />
              <span className="text-sm text-gray-600 ">
                I agree to the{' '}
                <a href="#" className="text-primary-500 hover:text-primary-600 font-semibold">
                  Terms & Conditions
                </a>
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center mt-6 text-gray-600 ">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-500 hover:text-primary-600 font-semibold">
              Login here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
