import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { FiStar, FiShoppingCart } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';

const MenuCard = ({ item, isActive, onOpenQuantity, onCloseQuantity }) => {
  const navigate = useNavigate();
  const { addToCart, selectedCanteen } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [quantity, setQuantity] = useState(1);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleOpenQuantity = () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    onOpenQuantity();
  };

  const handleAddToCart = () => {
    addToCart(item, quantity, selectedCanteen || item.canteen);
    setQuantity(1);
    onCloseQuantity();
    toast.success('Item added to cart!');
  };

  // Prevent showing quantity selector if modal is open
  const showQuantitySelector = isActive && isAuthenticated && !showLoginModal;

  return (
    <>
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all border border-green-100 card-hover"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        <img
          src={item.image || 'https://via.placeholder.com/300x200?text=Food+Image'}
          alt={item.name}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
        />
        {/* Badges removed */}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-slate-900 truncate">{item.name}</h3>
        <p className="text-slate-600 text-sm mt-1 line-clamp-2">{item.description}</p>

        {/* Details */}
        <div className="flex justify-between items-center mt-3 text-xs text-slate-500">
          <span className="font-medium">{item.category}</span>
          <span>⏱️ {item.preparationTime || 30} min</span>
        </div>

        {/* Rating */}
        <div className="flex items-center mt-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <FiStar
                key={i}
                size={16}
                className={i < Math.floor(item.rating || 0) ? 'fill-current' : 'text-gray-300'}
              />
            ))}
          </div>
          <span className="text-xs text-slate-600 ml-1">({item.reviewCount || 0})</span>
        </div>

        {/* Price and Action */}
        <div className="flex justify-between items-center mt-4">
          <div>
            <span className="text-2xl font-bold text-green-600">₹{item.price}</span>
            {item.discount > 0 && (
              <span className="text-xs text-slate-400 line-through ml-2">
                ₹{Math.round(item.price / (1 - item.discount / 100))}
              </span>
            )}
          </div>
          <button
            onClick={handleOpenQuantity}
            className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition shadow-md"
            title={!isAuthenticated ? 'Login to add items to cart' : 'Add to cart'}
          >
            <FiShoppingCart />
          </button>
        </div>

        {/* Quantity Selector */}
        {showQuantitySelector && (
          <div className="mt-3 flex items-center space-x-2">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-2 py-1 bg-green-100 text-slate-700 rounded hover:bg-green-200 transition"
            >
              -
            </button>
            <span className="flex-1 text-center font-semibold text-slate-700">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-2 py-1 bg-green-100 text-slate-700 rounded hover:bg-green-200 transition"
            >
              +
            </button>
            <button
              onClick={handleAddToCart}
              className="flex-1 btn-primary text-sm"
            >
              Add
            </button>
          </div>
        )}
      </div>
    </motion.div>

    {/* Login Modal - Rendered via Portal to avoid stacking context issues */}
    {showLoginModal &&
      ReactDOM.createPortal(
        <AnimatePresence mode="wait">
          <motion.div
            key="login-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
            onClick={() => setShowLoginModal(false)}
          >
            <motion.div
              key="login-modal-content"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -20 }}
              transition={{ duration: 0.3, type: "spring", damping: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="text-6xl">🔐</div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
                Login Required
              </h2>

              {/* Description */}
              <div className="text-center mb-8">
                <p className="text-gray-600 text-sm leading-relaxed mb-2">
                  To add items to your cart and place orders, you need to be logged in.
                </p>
                <p className="text-gray-500 text-xs">
                  Don't have an account? Sign up now and start ordering!
                </p>
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    navigate('/login');
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
                >
                  🔓 Login
                </button>
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    navigate('/signup');
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
                >
                  ✍️ Sign Up
                </button>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="w-full border-2 border-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-50 transition duration-200"
                >
                  ✕ Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default MenuCard;
