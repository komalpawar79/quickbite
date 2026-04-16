import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, user } = useAuthStore();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        toast.success('Login successful!');
        // Redirect based on user role
        const userRole = result.user?.role;
        setTimeout(() => {
          if (userRole === 'admin') {
            navigate('/admin/dashboard');
          } else if (userRole === 'canteen_manager') {
            navigate('/canteen/dashboard');
          } else {
            navigate('/');
          }
        }, 500);
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50   flex items-center justify-center py-12 px-4">
      <motion.div
        className="max-w-md w-full"
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
            <h1 className="text-3xl font-bold text-dark  mb-2">Campus Canteen</h1>
            <p className="text-gray-600 ">Login to order your favorite food</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
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

            {/* Password */}
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

            {/* Remember Me & Forgot Password */}
            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span className="text-gray-600 ">Remember me</span>
              </label>
              <a href="#" className="text-primary-500 hover:text-primary-600 font-semibold">
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center mt-6 text-gray-600 ">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-500 hover:text-primary-600 font-semibold">
              Sign up here
            </Link>
          </p>
        </div>


      </motion.div>
    </div>
  );
};

export default LoginPage;
