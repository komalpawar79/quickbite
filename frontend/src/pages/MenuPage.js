import React, { useState, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';
import MenuCard from '../components/MenuCard';

const MenuPage = () => {
  const [allMenuItems, setAllMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [canteens, setCanteens] = useState([]);
  const [selectedCanteen, setSelectedCanteen] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [activeCardId, setActiveCardId] = useState(null);

  const specialOffers = [
    {
      id: 1,
      title: 'Student Special',
      description: 'Any meal + drink at flat 20% off',
      discount: 20,
      validFor: 'All Students',
      color: 'from-blue-500 to-blue-600',
      details: {
        forStudents: 'Get your favorite meals with 20% discount. Valid on any meal combined with any beverage.',
        forStaff: 'Not available for staff members. Exclusive student benefit only.',
        terms: 'Valid with student ID card. Cannot be combined with other offers.',
        timing: 'Available during all canteen operating hours daily.'
      }
    },
    {
      id: 2,
      title: 'Faculty Special',
      description: 'Daily lunch buffet at flat price',
      discount: 'Flat Rs99',
      validFor: 'Faculty & Staff',
      color: 'from-purple-500 to-purple-600',
      details: {
        forStudents: 'Not available for students, but check other combo offers.',
        forStaff: 'Exclusive for faculty and administrative staff. All-you-can-have buffet lunch at just Rs99.',
        terms: 'Valid with staff ID card. Lunch time: 12 PM to 2 PM only.',
        timing: 'Monday to Friday. Weekends not applicable.'
      }
    },
    {
      id: 3,
      title: 'Breakfast Boost',
      description: 'Any breakfast item + coffee at 15% off',
      discount: 15,
      validFor: 'All Students',
      color: 'from-amber-500 to-amber-600',
      details: {
        forStudents: 'Start your day right with a filling breakfast and hot coffee. Great for early morning classes.',
        forStaff: 'Staff members can also enjoy breakfast specials during morning hours.',
        terms: 'Valid from 7 AM to 10 AM daily. Includes all breakfast items and hot beverages.',
        timing: 'Applies to coffee, tea, and other hot beverages.'
      }
    },
    {
      id: 4,
      title: 'Group Order Discount',
      description: 'Order for 5+ people and get 25% off',
      discount: 25,
      validFor: 'Groups & Clubs',
      color: 'from-green-500 to-green-600',
      details: {
        forStudents: 'Organize group meals for club meetings, study sessions, or parties. Minimum 5 orders required.',
        forStaff: 'Perfect for department meetings and team lunches. Book in advance for better service.',
        terms: 'Applicable for 5 or more orders placed together. Discount on entire bill.',
        timing: 'Advance booking preferred. Contact canteen for catering arrangements.'
      }
    },
    {
      id: 5,
      title: 'Evening Special',
      description: 'After 4 PM: Snacks + beverage combo only price',
      discount: 'Only Rs80',
      validFor: 'Till 7 PM',
      color: 'from-indigo-500 to-indigo-600',
      details: {
        forStudents: 'Evening study sessions? Grab snacks and beverages on budget. Perfect for library sessions.',
        forStaff: 'Evening tea time with snacks. Unwind after office hours.',
        terms: 'Valid from 4 PM to 7 PM daily. Combo includes any snack item and beverage.',
        timing: 'Last orders at 6:45 PM daily.'
      }
    },
    {
      id: 6,
      title: 'Weekend Treat',
      description: 'Saturdays & Sundays: Buy 2 get 1 free',
      discount: '50%',
      validFor: 'Weekends Only',
      color: 'from-pink-500 to-pink-600',
      details: {
        forStudents: 'Celebrate weekends with your favorite meals. Buy 2 items, get the third free on selected menu items.',
        forStaff: 'Treat yourself on weekends. Great for family outings with staff family members.',
        terms: 'Valid only on Saturdays and Sundays. Applicable on selected items marked with BOGO tag.',
        timing: 'Available throughout weekend operating hours.'
      }
    },
  ];

  // Fetch all canteens and their menu items on mount
  useEffect(() => {
    const fetchAllMenuItems = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:5000/api/canteens');
        const data = await res.json();
        
        if (res.ok && data.canteens && data.canteens.length > 0) {
          setCanteens(data.canteens);
          
          // Collect ALL items from ALL canteens
          let items = [];
          data.canteens.forEach(canteen => {
            if (canteen.menuItems && Array.isArray(canteen.menuItems)) {
              items = [...items, ...canteen.menuItems];
            }
          });
          
          // Shuffle items randomly
          const shuffled = items.sort(() => Math.random() - 0.5);
          setAllMenuItems(shuffled);
          setFilteredItems(shuffled);
        }
      } catch (error) {
        console.error('Error fetching menu items:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllMenuItems();
  }, []);

  // Filter items based on search and selected canteen
  useEffect(() => {
    let filtered = allMenuItems;

    // Filter by canteen if selected
    if (selectedCanteen) {
      filtered = filtered.filter(item => item.canteen === selectedCanteen._id);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredItems(filtered);
  }, [searchQuery, selectedCanteen, allMenuItems]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const uniqueCanteen = selectedCanteen ? canteens.find(c => c._id === selectedCanteen._id) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Loading State */}
        {loading && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-5xl mb-4 animate-bounce">⏳</div>
            <p className="text-lg text-gray-600">Loading menu items...</p>
          </motion.div>
        )}

        {!loading && (
          <>
            {/* Header */}
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-5xl font-black text-gray-900 mb-2">Explore Menu</h1>
                  <p className="text-lg text-gray-600">
                    {uniqueCanteen
                      ? `Order from ${uniqueCanteen.name}`
                      : `Browse and order from ${canteens.length} campus canteens`
                    }
                  </p>
                </div>
                <div className="text-right hidden md:block">
                  <div className="text-sm text-gray-600">
                    📍 {filteredItems.length} Items Available
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <div className="relative">
                <FiSearch className="absolute left-4 top-4 text-gray-400 text-xl" />
                <input
                  type="text"
                  placeholder="Search dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                  >
                    <FiX size={20} />
                  </button>
                )}
              </div>
            </motion.div>

            {/* Canteen Selection */}
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">📍 Select Canteen</h3>
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                <motion.button
                  onClick={() => setSelectedCanteen(null)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-3 rounded-xl whitespace-nowrap font-semibold transition ${
                    selectedCanteen === null
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                      : 'bg-white text-gray-900 border-2 border-gray-200 hover:border-green-500'
                  }`}
                >
                  ✨ All Canteens
                </motion.button>
                {canteens.map((canteen) => (
                  <motion.button
                    key={canteen._id}
                    onClick={() => setSelectedCanteen(canteen)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-6 py-3 rounded-xl whitespace-nowrap font-semibold transition flex items-center gap-2 ${
                      selectedCanteen?._id === canteen._id
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                        : 'bg-white text-gray-900 border-2 border-gray-200 hover:border-green-500'
                    }`}
                  >
                    <span className="text-2xl">🍽️</span>
                    <div className="text-left">
                      <div>{canteen.name}</div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Results Info */}
            <motion.div
              className="mb-6 flex justify-between items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-sm text-gray-600 font-semibold">
                {filteredItems.length === 0 ? (
                  <span>❌ No items found</span>
                ) : (
                  <span>✅ Showing {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}</span>
                )}
              </div>
            </motion.div>

            {/* Menu Items Grid */}
            {filteredItems.length > 0 ? (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    whileHover={{ y: -5 }}
                  >
                    <MenuCard 
                      item={item} 
                      isActive={activeCardId === item._id}
                      onOpenQuantity={() => {
                        if (activeCardId !== item._id) {
                          setActiveCardId(item._id);
                        }
                      }}
                      onCloseQuantity={() => setActiveCardId(null)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                className="col-span-full text-center py-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-5xl mb-4">🍽️</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-600 mb-6">Try searching with different keywords or select another canteen</p>
                <motion.button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCanteen(null);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold"
                >
                  🔄 Reset Filters
                </motion.button>
              </motion.div>
            )}

            {/* Learn More Modal */}
            {showOfferModal && selectedOffer && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowOfferModal(false)}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                >
                  {/* Header */}
                  <div className={`bg-gradient-to-r ${selectedOffer.color} text-white p-8 relative`}>
                    <button
                      onClick={() => setShowOfferModal(false)}
                      className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition"
                    >
                      <FiX size={24} />
                    </button>
                    <h2 className="text-3xl font-bold mb-2">{selectedOffer.title}</h2>
                    <p className="text-white/90">{selectedOffer.description}</p>
                  </div>

                  {/* Content */}
                  <div className="p-8 space-y-6">
                    {/* Discount Badge */}
                    <div className="flex items-center gap-4 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200">
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">Total Discount</p>
                        <p className="text-3xl font-black text-green-600">
                          {typeof selectedOffer.discount === 'number' ? `${selectedOffer.discount}% OFF` : selectedOffer.discount}
                        </p>
                      </div>
                    </div>

                    {/* For Students */}
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">For Students</h3>
                      <p className="text-gray-700">{selectedOffer.details.forStudents}</p>
                    </div>

                    {/* For Staff */}
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">For Staff</h3>
                      <p className="text-gray-700">{selectedOffer.details.forStaff}</p>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-bold text-gray-900 mb-2">Terms & Conditions</h3>
                      <p className="text-gray-700 text-sm">{selectedOffer.details.terms}</p>
                    </div>

                    {/* Timing */}
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <h3 className="font-bold text-gray-900 mb-2">Validity & Timing</h3>
                      <p className="text-gray-700 text-sm">{selectedOffer.details.timing}</p>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex gap-3 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowOfferModal(false)}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg hover:shadow-lg transition"
                      >
                        Place Order Now
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowOfferModal(false)}
                        className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 font-bold rounded-lg hover:bg-gray-300 transition"
                      >
                        Close
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
