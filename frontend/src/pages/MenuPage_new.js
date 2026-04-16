import React, { useState, useEffect } from 'react';
import { FiFilter, FiSearch, FiChevronDown } from 'react-icons/fi';
import { motion } from 'framer-motion';
import MenuCard from '../components/MenuCard';
import toast from 'react-hot-toast';

const MenuPage = () => {
  const [selectedCanteen, setSelectedCanteen] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [filters, setFilters] = useState({
    dietary: '',
    priceRange: 'all',
    category: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [canteens, setCanteens] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Fetch all canteens on component mount
  useEffect(() => {
    const fetchCanteens = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/canteens');
        const data = await response.json();
        
        if (data.success && data.canteens) {
          setCanteens(data.canteens);
          // Auto-select first canteen if available
          if (data.canteens.length > 0) {
            setSelectedCanteen(data.canteens[0]._id);
          }
        } else {
          console.warn('Failed to fetch canteens:', data);
        }
      } catch (error) {
        console.error('Error fetching canteens:', error);
        setFetchError('Failed to load canteens');
      }
    };

    fetchCanteens();
  }, []);

  // Fetch menu items when selectedCanteen changes
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        setFetchError(null);
        
        if (!selectedCanteen) {
          // Fetch all menu items if no canteen selected
          const response = await fetch('http://localhost:5000/api/menu');
          const data = await response.json();
          
          if (data.success && data.items) {
            setMenuItems(data.items);
          } else if (data.count !== undefined) {
            setMenuItems(data.items || []);
          } else {
            console.warn('Unexpected response format:', data);
            setMenuItems([]);
          }
        } else {
          // Fetch menu items for specific canteen
          const response = await fetch(
            `http://localhost:5000/api/menu/canteen/${selectedCanteen}`
          );
          const data = await response.json();
          
          if (data.success && data.items) {
            setMenuItems(data.items);
          } else if (data.count !== undefined) {
            setMenuItems(data.items || []);
          } else {
            console.warn('Unexpected response format:', data);
            setMenuItems([]);
          }
        }
      } catch (error) {
        console.error('Error fetching menu items:', error);
        setFetchError('Failed to load menu items');
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [selectedCanteen]);

  // Sorting function
  const getSortedItems = (items) => {
    const sorted = [...items];
    switch (sortBy) {
      case 'popular':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      default:
        return sorted;
    }
  };

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    // Search filter
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Dietary filter
    if (filters.dietary && item.dietary !== filters.dietary) {
      return false;
    }

    // Price range filter
    if (filters.priceRange !== 'all') {
      const [min, max] = filters.priceRange === '300+' 
        ? [300, Infinity] 
        : filters.priceRange.split('-').map(Number);
      if (item.price < min || item.price > max) {
        return false;
      }
    }

    return true;
  });

  const sortedItems = getSortedItems(filteredItems);
  const selectedCanteenData = selectedCanteen 
    ? canteens.find(c => c._id === selectedCanteen) 
    : null;

  return (
    <div className="min-h-screen bg-gray-50  py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-black text-dark  mb-4">Explore Menu</h1>
          <p className="text-lg text-gray-600 ">
            {selectedCanteenData 
              ? `Order from ${selectedCanteenData.name}` 
              : `Browse and order from ${canteens.length} campus canteens`
            }
          </p>
        </motion.div>

        {/* Error Message */}
        {fetchError && (
          <motion.div
            className="mb-6 p-4 bg-red-100  border border-red-300  rounded-lg text-red-700 "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            ❌ {fetchError}
          </motion.div>
        )}

        {/* Canteen Selection */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold text-dark  mb-4">Select Canteen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {canteens.length === 0 ? (
              <p className="text-gray-500">Loading canteens...</p>
            ) : (
              canteens.map((canteen) => (
                <motion.button
                  key={canteen._id}
                  onClick={() => setSelectedCanteen(
                    canteen._id === selectedCanteen ? null : canteen._id
                  )}
                  className={`p-4 rounded-lg text-left transition ${
                    selectedCanteen === canteen._id
                      ? 'bg-primary-500 text-white shadow-lg'
                      : 'bg-white  text-dark  hover:shadow-md'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <h3 className="font-bold text-lg">{canteen.name}</h3>
                  <p className="text-sm opacity-75">
                    {canteen.location?.building || 'Campus Location'}
                  </p>
                </motion.button>
              ))
            )}
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          className="mb-8 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-4 text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300  rounded-lg bg-white  text-dark  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300  rounded-lg bg-white  text-dark  focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="popular">⭐ Popular</option>
              <option value="price-low">💰 Price: Low to High</option>
              <option value="price-high">💸 Price: High to Low</option>
            </select>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                showFilters
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200  text-dark '
              }`}
            >
              <FiFilter />
              <span>Filters</span>
            </button>
          </div>
        </motion.div>

        {/* Filter Options */}
        {showFilters && (
          <motion.div
            className="mb-8 bg-white  p-6 rounded-lg shadow"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h3 className="font-bold text-dark  mb-4">Filter Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Dietary Filter */}
              <div>
                <label className="block text-sm font-semibold text-dark  mb-2">
                  🥗 Dietary
                </label>
                <select
                  value={filters.dietary}
                  onChange={(e) => setFilters({ ...filters, dietary: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300  rounded-lg bg-white  text-dark "
                >
                  <option value="">All Options</option>
                  <option value="veg">Vegetarian</option>
                  <option value="non-veg">Non-Vegetarian</option>
                  <option value="vegan">Vegan</option>
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-semibold text-dark  mb-2">
                  💰 Price Range
                </label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300  rounded-lg bg-white  text-dark "
                >
                  <option value="all">All Prices</option>
                  <option value="0-100">₹0 - ₹100</option>
                  <option value="100-200">₹100 - ₹200</option>
                  <option value="200-300">₹200 - ₹300</option>
                  <option value="300+">₹300+</option>
                </select>
              </div>

              {/* Reset Button */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({ dietary: '', priceRange: 'all', category: '' });
                    setSearchQuery('');
                  }}
                  className="w-full px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition font-semibold"
                >
                  🔄 Reset All
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results Info */}
        <motion.div
          className="mb-6 flex justify-between items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="text-sm text-gray-600  font-semibold">
            {loading ? (
              <span>⏳ Loading menu...</span>
            ) : sortedItems.length === 0 ? (
              <span>❌ No items found</span>
            ) : (
              <span>✅ Showing {sortedItems.length} item{sortedItems.length !== 1 ? 's' : ''}</span>
            )}
          </div>
        </motion.div>

        {/* Menu Items Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading menu items...</p>
            </div>
          ) : sortedItems.length === 0 ? (
            <div className="text-center py-12 bg-white  rounded-lg">
              <p className="text-gray-500 text-lg">No items found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedItems.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <MenuCard item={item} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MenuPage;
