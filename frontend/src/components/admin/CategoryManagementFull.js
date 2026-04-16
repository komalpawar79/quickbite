import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Edit2, Trash2, X, Search, Filter, TrendingUp, UtensilsCrossed, Store, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const CategoryManagementFull = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [canteens, setCanteens] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCanteens, setSelectedCanteens] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const socketRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    canteen: '',
    category: '',
    isAvailable: true
  });

  useEffect(() => {
    fetchMenuItems();
    fetchCanteens();
    fetchCategories();
    connectWebSocket();
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    // Auto-select all canteens when they load
    if (canteens.length > 0 && selectedCanteens.length === 0) {
      setSelectedCanteens(canteens.map(c => c._id));
    }
  }, [canteens]);

  // Set first category as default when categories load
  useEffect(() => {
    if (categories.length > 0 && !formData.category) {
      setFormData(prev => ({ ...prev, category: categories[0]._id }));
    }
  }, [categories]);

  const connectWebSocket = () => {
    try {
      const token = localStorage.getItem('token');
      socketRef.current = io('http://localhost:5000', {
        auth: { token },
        reconnection: true,
      });

      socketRef.current.on('menu-updated', () => {
        console.log('🔄 Menu updated via WebSocket');
        fetchMenuItems();
      });

      socketRef.current.on('connect', () => {
        socketRef.current.emit('join-admin');
      });
    } catch (error) {
      console.error('WebSocket connection failed:', error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard/menu-items');
      const items = res.data?.items || [];
      setMenuItems(items);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  const fetchCanteens = async () => {
    try {
      const res = await api.get('/admin/dashboard/canteens');
      const canteensList = res.data?.canteens || [];
      setCanteens(canteensList);
    } catch (error) {
      console.error('Error fetching canteens:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/admin/dashboard/categories');
      const categoriesList = res.data?.categories || [];
      setCategories(categoriesList);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  // Debounced search
  const debounceSearch = useCallback((value) => {
    const timer = setTimeout(() => {
      setSearchQuery(value);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    debounceSearch(value);
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      const response = editMode
        ? await api.patch(`/admin/dashboard/menu-items/${currentId}`, formData)
        : await api.post('/admin/dashboard/menu-items', formData);
      
      const newItem = response.data.data?.item || response.data.item;
      if (!editMode && newItem) {
        setMenuItems(prev => [newItem, ...prev]);
      } else {
        fetchMenuItems();
      }
      
      toast.success(editMode ? 'Menu item updated!' : 'Menu item created!');
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save');
    }
  }, [editMode, currentId, formData]);

  const handleEdit = useCallback((item) => {
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      canteen: item.canteen?._id || item.canteen,
      category: item.category,
      dietary: item.dietary,
      isAvailable: item.isAvailable
    });
    setCurrentId(item._id);
    setEditMode(true);
    setShowModal(true);
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    
    try {
      await api.delete(`/admin/dashboard/menu-items/${id}`);
      setMenuItems(prev => prev.filter(item => item._id !== id));
      toast.success('Menu item deleted!');
    } catch (error) {
      toast.error('Failed to delete');
    }
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      canteen: '',
      category: categories.length > 0 ? categories[0]._id : '',
      isAvailable: true
    });
    setEditMode(false);
    setCurrentId(null);
  };

  // Helper function to get category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c._id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  // Group menu items by canteen with filtering
  const groupedByCanteen = canteens.reduce((acc, canteen) => {
    if (!selectedCanteens.includes(canteen._id)) return acc;
    
    const filteredItems = menuItems.filter(item => {
      const itemCanteenId = item.canteen?._id || item.canteen;
      const matchesCanteen = itemCanteenId === canteen._id;
      const categoryName = getCategoryName(item.category).toLowerCase();
      const matchesCategory = selectedCategory === null || item.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        categoryName.includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesCanteen && matchesSearch && matchesCategory;
    });

    if (filteredItems.length > 0) {
      acc[canteen._id] = {
        name: canteen.name,
        items: filteredItems
      };
    }
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-8 text-white shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold mb-2">📋 Categories & Menu</h1>
                <p className="text-green-100 text-lg">Manage and organize your menu items across all canteens</p>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { resetForm(); setShowModal(true); }} 
                className="flex items-center gap-2 bg-white text-green-600 px-6 py-3 rounded-xl hover:bg-green-50 transition font-semibold shadow-lg"
              >
                <Plus size={20} />
                Add Menu Item
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Stats Dashboard */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {[
            { icon: Store, label: 'Total Canteens', value: canteens.length, color: 'from-blue-500 to-blue-600', lightColor: 'bg-blue-50', textColor: 'text-blue-600' },
            { icon: UtensilsCrossed, label: 'Menu Items', value: menuItems.length, color: 'from-green-500 to-green-600', lightColor: 'bg-green-50', textColor: 'text-green-600' },
            { icon: Zap, label: 'Active Items', value: menuItems.filter(i => i.isAvailable).length, color: 'from-orange-500 to-orange-600', lightColor: 'bg-orange-50', textColor: 'text-orange-600' },
            { icon: TrendingUp, label: 'Total Categories', value: categories.length, color: 'from-purple-500 to-purple-600', lightColor: 'bg-purple-50', textColor: 'text-purple-600' }
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`${stat.lightColor} rounded-2xl p-6 border-2 border-gray-100 hover:border-gray-200 transition shadow-sm hover:shadow-md`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  <span className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</span>
                </div>
                <p className="text-gray-700 font-semibold">{stat.label}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Search and Advanced Filters */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border-2 border-gray-100 p-6 mb-8 shadow-sm"
        >
          <div className="space-y-4">
            {/* Search Bar */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Search Items</label>
              <div className="relative">
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, category, or description..."
                  onChange={handleSearchChange}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder-gray-500"
                />
              </div>
            </div>

            {/* Canteen Filter with Enhanced UI */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Filter size={16} />
                  Filter by Canteen
                </label>
                <span className="text-xs font-medium text-gray-500">{selectedCanteens.length} selected</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {canteens.map(canteen => (
                  <motion.button
                    key={canteen._id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedCanteens(prev =>
                        prev.includes(canteen._id)
                          ? prev.filter(id => id !== canteen._id)
                          : [...prev, canteen._id]
                      );
                    }}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                      selectedCanteens.includes(canteen._id)
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent hover:border-gray-300'
                    }`}
                  >
                    {canteen.name}
                  </motion.button>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setSelectedCanteens(canteens.map(c => c._id))}
                  className="px-3 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition border-2 border-blue-200"
                >
                  ✓ Select All
                </button>
                <button
                  onClick={() => setSelectedCanteens([])}
                  className="px-3 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition border-2 border-red-200"
                >
                  ✕ Clear All
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-3 block">Filter by Category</label>
              <div className="flex flex-wrap gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    selectedCategory === null
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent hover:border-gray-300'
                  }`}
                >
                  All Categories
                </motion.button>
                {categories.map(cat => (
                  <motion.button
                    key={cat._id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(cat._id)}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                      selectedCategory === cat._id
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent hover:border-gray-300'
                    }`}
                  >
                    {cat.name}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white rounded-2xl border-2 border-gray-100"
          >
            <div className="flex justify-center mb-6">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center"
              >
                <UtensilsCrossed className="text-white" size={28} />
              </motion.div>
            </div>
            <p className="text-gray-600 text-lg font-semibold">Loading menu items...</p>
          </motion.div>
        ) : Object.keys(groupedByCanteen).length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-300"
          >
            <div className="text-7xl mb-6">🍽️</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {menuItems.length === 0 ? 'No Menu Items Yet' : 'No items matching filters'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {menuItems.length === 0 
                ? 'Start building your menu by adding your first delicious item!' 
                : 'Try adjusting your search or filter criteria'}
            </p>
            {menuItems.length === 0 && (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition"
              >
                ➕ Add First Item
              </motion.button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Canteen Sections */}
            {Object.entries(groupedByCanteen).map(([canteenId, { name, items }]) => (
              <motion.div 
                key={canteenId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border-2 border-gray-100 shadow-md hover:shadow-lg transition overflow-hidden"
              >
                {/* Canteen Header - Enhanced */}
                <div className="bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 text-white px-8 py-6 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-4xl"
                    >
                      🏪
                    </motion.div>
                    <div>
                      <h3 className="text-2xl font-bold">{name}</h3>
                      <p className="text-green-100 text-sm mt-1">
                        <span className="inline-block bg-white bg-opacity-20 px-3 py-1 rounded-full mr-2">
                          {items.length} items
                        </span>
                        <span className="inline-block bg-white bg-opacity-20 px-3 py-1 rounded-full">
                          {items.filter(i => i.isAvailable).length} available
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold">{items.length}</div>
                    <p className="text-green-100 text-sm">menu items</p>
                  </div>
                </div>

                {/* Menu Items Grid - Enhanced */}
                <div className="p-8">
                  {/* Group items by category */}
                  {(() => {
                    const groupedByCategory = items.reduce((acc, item) => {
                      const catName = getCategoryName(item.category);
                      if (!acc[catName]) {
                        acc[catName] = [];
                      }
                      acc[catName].push(item);
                      return acc;
                    }, {});

                    return (
                      <div className="space-y-8">
                        {Object.entries(groupedByCategory).map(([categoryName, categoryItems], catIdx) => (
                          <motion.div
                            key={categoryName}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: catIdx * 0.1 }}
                          >
                            <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-gray-200">
                              <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                              <h4 className="text-lg font-bold text-gray-800">{categoryName}</h4>
                              <span className="ml-auto text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                {categoryItems.length} items
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                              {categoryItems.map((item, itemIdx) => (
                                <motion.div
                                  key={item._id}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: itemIdx * 0.05 }}
                                  whileHover={{ scale: 1.05, y: -4 }}
                                  className="bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 overflow-hidden hover:border-green-300 transition shadow-sm hover:shadow-lg group"
                                >
                                  {/* Item Header with Status */}
                                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 text-white">
                                    <div className="flex justify-between items-start gap-2 mb-2">
                                      <h4 className="text-base font-bold line-clamp-2">{item.name}</h4>
                                      <motion.span 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className={`px-2 py-1 rounded-lg text-xs font-bold flex-shrink-0 ${
                                          item.isAvailable 
                                            ? 'bg-white text-green-700 shadow-md' 
                                            : 'bg-gray-600 text-white'
                                        }`}
                                      >
                                        {item.isAvailable ? '✓ Active' : '✗ Inactive'}
                                      </motion.span>
                                    </div>
                                    {item.spiceLevel && (
                                      <span className={`text-xs font-semibold px-2 py-1 rounded-lg inline-block backdrop-blur-sm ${
                                        item.spiceLevel === 'mild' 
                                          ? 'bg-blue-400 bg-opacity-30' 
                                          : item.spiceLevel === 'medium' 
                                          ? 'bg-yellow-400 bg-opacity-30' 
                                          : 'bg-red-400 bg-opacity-30'
                                      }`}>
                                        🌶️ {item.spiceLevel.toUpperCase()}
                                      </span>
                                    )}
                                  </div>

                                  {/* Item Details */}
                                  <div className="p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                      <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                        ₹{item.price}
                                      </span>
                                      {item.dietary && (
                                        <span className="text-xs font-semibold bg-purple-100 text-purple-700 px-2 py-1 rounded-lg">
                                          {item.dietary === 'vegetarian' ? '🥬 Veg' : '🍖 Non-Veg'}
                                        </span>
                                      )}
                                    </div>

                                    {item.description && (
                                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                        {item.description}
                                      </p>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="pt-3 border-t border-gray-200 flex gap-2">
                                      <motion.button 
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleEdit(item)}
                                        className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 px-3 py-2 rounded-lg hover:from-blue-100 hover:to-blue-200 transition font-semibold"
                                      >
                                        <Edit2 size={16} />
                                        Edit
                                      </motion.button>
                                      <motion.button 
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleDelete(item._id)}
                                        className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-red-50 to-red-100 text-red-600 px-3 py-2 rounded-lg hover:from-red-100 hover:to-red-200 transition font-semibold"
                                      >
                                        <Trash2 size={16} />
                                        Delete
                                      </motion.button>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            ))}
          </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border-2 border-gray-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 flex justify-between items-center rounded-t-xl">
                <h3 className="text-2xl font-bold">{editMode ? '✏️ Edit Menu Item' : '➕ Add New Menu Item'}</h3>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setShowModal(false); resetForm(); }} 
                  className="text-white hover:text-gray-200"
                >
                  <X size={24} />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-800">Item Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="e.g., Masala Dosa"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-800">Canteen *</label>
                    <select
                      value={formData.canteen}
                      onChange={(e) => setFormData({ ...formData, canteen: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      required
                    >
                      <option value="">Select Canteen</option>
                      {canteens.filter(c => c.isActive).map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-800">Price (₹) *</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="50"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-800">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-800">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                    rows="3"
                    placeholder="Brief description of the item"
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="rounded-md w-5 h-5 accent-green-600"
                  />
                  <label htmlFor="isAvailable" className="text-sm font-semibold text-gray-800 cursor-pointer">
                    ✓ Available for order
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:shadow-lg font-bold transition-all"
                  >
                    {editMode ? '✓ Update Item' : '✓ Create Item'}
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button" 
                    onClick={() => { setShowModal(false); resetForm(); }} 
                    className="flex-1 border-2 border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 font-bold transition-all text-gray-800"
                  >
                    ✕ Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};

export default CategoryManagementFull;
