import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiLogOut, FiShoppingCart } from 'react-icons/fi';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import CartSidebar from './CartSidebar';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const { getCartCount } = useCartStore();

  return (
    <>
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-green-50 to-white shadow-md border-b border-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img 
              src="/logo.png" 
              alt="QuickBite Logo" 
              className="h-16 w-auto object-contain group-hover:opacity-80 transition-opacity"
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                mixBlendMode: 'multiply'
              }}
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {user?.role !== 'canteen_manager' ? (
              <>
                <Link to="/" className="px-3 py-2 text-slate-700 hover:text-green-600 transition font-medium">
                  Home
                </Link>
                <Link to="/menu" className="px-3 py-2 text-slate-700 hover:text-green-600 transition font-medium">
                  Menu
                </Link>
                {isAuthenticated && (
                  <Link to="/my-orders" className="px-3 py-2 text-slate-700 hover:text-green-600 transition font-medium">
                    My Orders
                  </Link>
                )}
                {isAuthenticated && user?.role !== 'canteen_manager' && (
                  <Link to="/my-messages" className="px-3 py-2 text-slate-700 hover:text-green-600 transition font-medium">
                    My Messages
                  </Link>
                )}
                {user?.role === 'admin' && (
                  <Link to="/admin/dashboard" className="px-3 py-2 text-slate-700 hover:text-green-600 transition font-medium">
                    Admin
                  </Link>
                )}
                <Link to="/about" className="px-3 py-2 text-slate-700 hover:text-green-600 transition font-medium">
                  About
                </Link>
                <Link to="/contact" className="px-3 py-2 text-slate-700 hover:text-green-600 transition font-medium">
                  Contact
                </Link>
              </>
            ) : (
              <Link to="/canteen/dashboard" className="px-3 py-2 text-slate-700 hover:text-green-600 transition font-medium">
                Dashboard
              </Link>
            )}
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-3">
            {/* Cart Icon - Show for users and admins */}
            {isAuthenticated && user?.role !== 'canteen_manager' && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-slate-700 hover:text-green-600 transition rounded-lg hover:bg-green-100"
                title="Shopping Cart"
              >
                <FiShoppingCart className="text-xl" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {getCartCount()}
                  </span>
                )}
              </button>
            )}
            
            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link to="/profile" className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-green-100 transition">
                  <FiUser className="text-slate-700" />
                  <span className="text-sm font-medium text-slate-700 hidden sm:inline">
                    {user?.name || 'Profile'}
                  </span>
                </Link>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to logout?')) {
                      logout();
                    }
                  }}
                  className="p-2 text-slate-700 hover:text-red-600 transition rounded-lg hover:bg-red-50"
                  title="Logout"
                >
                  <FiLogOut className="text-xl" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-green-600 hover:text-green-700 font-semibold transition"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-green-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-700 transition shadow-md hover:shadow-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-2xl text-slate-700 hover:text-green-600 transition"
            >
              {isOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-1 bg-green-50 rounded-lg mb-2">
            {user?.role !== 'canteen_manager' ? (
              <>
                <Link to="/" className="block px-4 py-3 text-slate-700 hover:bg-green-100 hover:text-green-600 rounded transition font-medium">
                  Home
                </Link>
                <Link to="/menu" className="block px-4 py-3 text-slate-700 hover:bg-green-100 hover:text-green-600 rounded transition font-medium">
                  Menu
                </Link>
                {isAuthenticated && (
                  <Link to="/my-orders" className="block px-4 py-3 text-slate-700 hover:bg-green-100 hover:text-green-600 rounded transition font-medium">
                    My Orders
                  </Link>
                )}
                {isAuthenticated && user?.role !== 'canteen_manager' && (
                  <Link to="/my-messages" className="block px-4 py-3 text-slate-700 hover:bg-green-100 hover:text-green-600 rounded transition font-medium">
                    My Messages
                  </Link>
                )}
                {user?.role === 'admin' && (
                  <Link to="/admin/dashboard" className="block px-4 py-3 text-slate-700 hover:bg-green-100 hover:text-green-600 rounded transition font-medium">
                    Admin Dashboard
                  </Link>
                )}
                <Link to="/about" className="block px-4 py-3 text-slate-700 hover:bg-green-100 hover:text-green-600 rounded transition font-medium">
                  About
                </Link>
                <Link to="/contact" className="block px-4 py-3 text-slate-700 hover:bg-green-100 hover:text-green-600 rounded transition font-medium">
                  Contact
                </Link>
              </>
            ) : (
              <Link to="/canteen/dashboard" className="block px-4 py-3 text-slate-700 hover:bg-green-100 hover:text-green-600 rounded transition font-medium">
                Canteen Dashboard
              </Link>
            )}
            {!isAuthenticated && (
              <div className="px-4 py-2 space-y-2 border-t border-green-200 pt-3">
                <Link to="/login" className="block text-center px-4 py-2 text-green-600 hover:text-green-700 font-semibold border border-green-600 rounded-lg transition">
                  Login
                </Link>
                <Link to="/signup" className="block text-center px-4 py-2 bg-green-600 text-white hover:bg-green-700 font-semibold rounded-lg transition shadow-md">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
    <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;
