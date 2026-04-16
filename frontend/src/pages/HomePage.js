import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiLock, FiTrendingUp } from 'react-icons/fi';
import MenuCard from '../components/MenuCard';

const HomePage = () => {
  const [showLearnMore] = useState(false);
  const [allMenuItems, setAllMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all canteens and pick one menu item from each
  useEffect(() => {
    const fetchCanteens = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:5000/api/canteens');
        const data = await res.json();
        
        if (res.ok && data.canteens && data.canteens.length > 0) {
          // Get one menu item from each canteen
          let items = [];
          data.canteens.forEach(canteen => {
            if (canteen.menuItems && canteen.menuItems.length > 0) {
              // Pick first item from each canteen
              items.push(canteen.menuItems[0]);
            }
          });
          
          // Shuffle items randomly
          const shuffled = items.sort(() => Math.random() - 0.5);
          setAllMenuItems(shuffled);
        }
      } catch (error) {
        console.error('Error fetching canteens:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCanteens();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-white to-gray-50">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
          <div className="absolute -bottom-8 right-10 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }} />
        </div>

        {/* Content */}
        <motion.div
          className="relative z-10 text-center px-6 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div
            className="mb-6 inline-block"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="bg-green-100 border border-green-400 text-green-700 px-6 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
              🎓 Your Campus Food Companion
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1 
            className="text-6xl md:text-8xl font-black text-slate-900 mb-6 drop-shadow-lg leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Fast Food,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 animate-pulse">
              Smart Choice!
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            className="text-lg md:text-2xl text-slate-700 font-semibold mb-10 max-w-3xl mx-auto drop-shadow-lg leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Order delicious food from all campus canteens in <span className="text-green-600 font-bold">just 3 taps</span>. Real-time tracking, easy payments, and meals delivered to your hostel or classroom.
          </motion.p>

          {/* Feature Pills */}
          <motion.div
            className="flex flex-wrap justify-center gap-4 mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {['⚡ 30-Min Delivery', '🔒 Secure Payment', '📍 Live Tracking', '⭐ Trusted Reviews'].map((feature, i) => (
              <div key={i} className="bg-green-100/50 backdrop-blur-md border border-green-300 px-4 py-2 rounded-full text-sm text-slate-700 font-semibold hover:bg-green-200 transition">
                {feature}
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Link
              to="/menu"
              className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-lg px-10 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              <span>🚀 Explore Menu</span>
              <span className="animate-bounce">→</span>
            </Link>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            className="grid grid-cols-3 gap-4 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            {[
              { number: '10K+', label: 'Students' },
              { number: '5', label: 'Canteens' },
              { number: '2K+', label: 'Dishes' },
            ].map((stat, i) => (
              <div key={i} className="bg-green-100/50 backdrop-blur-md border border-green-300 rounded-lg p-4 hover:bg-green-200 transition">
                <div className="text-2xl md:text-3xl font-bold text-green-700">{stat.number}</div>
                <div className="text-sm text-slate-700 font-semibold mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="text-slate-700 text-4xl drop-shadow-lg">↓</div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-br from-white via-green-50/30 to-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-200/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-200/15 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block mb-6 px-6 py-3 bg-green-100 border border-green-400 rounded-full">
              <span className="text-green-700 font-bold text-sm">⭐ WHY CHOOSE US</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-6">Why Students Love Us 💕</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Built specifically for campus life – fast, affordable, and designed to save your time during study hours.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {features.slice(0, 6).map((feature, index) => (
              <motion.div 
                key={index} 
                variants={item}
                whileHover={{ y: -8 }}
                className="group relative h-full"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/25 to-emerald-500/25 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
                
                <div className="relative bg-gradient-to-br from-white to-green-50/50 border-1.5 border-green-200/80 p-6 rounded-2xl hover:border-green-400 transition-all duration-300 hover:shadow-xl transform group-hover:scale-102 h-full flex flex-col backdrop-blur-sm">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300 transform group-hover:rotate-12">
                    {feature.icon}
                  </div>
                  
                  <h3 className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-700 text-sm leading-snug flex-grow">
                    {feature.description}
                  </p>
                  
                  <div className="mt-4 h-1 w-6 bg-gradient-to-r from-green-500 to-emerald-600 group-hover:w-full transition-all duration-300 rounded-full" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-b from-white via-green-50 to-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block mb-4 px-6 py-2 bg-green-100 border border-green-400 rounded-full">
              <span className="text-green-700 font-bold text-sm">⭐ TESTIMONIALS</span>
            </div>
            <h2 className="text-5xl font-black text-slate-900 mb-6">What Students Say 📢</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Join 10K+ happy students who are already ordering from campus canteens.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {[
              {
                name: 'Chaitali Sahare',
                role: '2nd Year, BCA',
                text: 'Finally! A food app just for campus. Saves me 30 mins every day. Plus the discounts are insane! 🎉',
                avatar: '👩‍🎓',
                rating: 5,
              },
              {
                name: 'Ashwi Kadam',
                role: '3rd Year, M-Tech',
                text: 'The delivery is so fast I got my order while I was still selecting my menu item. Mind = blown 🤯',
                avatar: '👨‍🎓',
                rating: 5,
              },
              {
                name: 'Prabal Dope',
                role: '1st Year, Bsc-IT',
                text: 'Never miss studying sessions because of hunger again. Real-time tracking is amazing! ⏱️',
                avatar: '👩‍🎓',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <motion.div 
                key={index} 
                variants={item}
                whileHover={{ y: -10 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
                
                <div className="relative bg-gradient-to-br from-white to-green-50 border-2 border-green-200 p-8 rounded-3xl hover:border-green-500 transition-all duration-300 hover:shadow-2xl">
                  <div className="flex mb-4 gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <motion.span 
                        key={i} 
                        className="text-xl"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                      >
                        ⭐
                      </motion.span>
                    ))}
                  </div>
                  
                  <p className="text-slate-700 text-lg italic font-medium mb-6">
                    "{testimonial.text}"
                  </p>
                  
                  <div className="flex items-center gap-4 pt-6 border-t-2 border-green-200">
                    <div className="text-4xl">{testimonial.avatar}</div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">{testimonial.name}</h4>
                      <p className="text-sm text-green-600 font-semibold">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-b from-white to-green-50/50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-green-200/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block mb-6 px-6 py-3 bg-green-100 border border-green-400 rounded-full">
              <span className="text-green-700 font-bold text-sm">🚀 SIMPLE PROCESS</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-6">How It Works? 🎯</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Get your favorite meal in just 3 simple steps
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {[
              { step: 1, title: 'Browse & Select', desc: 'Explore menus from all campus canteens', icon: <FiShoppingCart className="w-8 h-8" /> },
              { step: 2, title: 'Quick Checkout', desc: 'Pay securely via UPI or Card', icon: <FiLock className="w-8 h-8" /> },
              { step: 3, title: 'Get Delivered', desc: 'Receive hot meals in 30 minutes', icon: <FiTrendingUp className="w-8 h-8" /> },
            ].map((itemData, i) => (
              <motion.div 
                key={i} 
                variants={item}
                className="group relative"
              >
                {i < 2 && (
                  <div className="hidden md:block absolute top-20 -right-4 w-8 h-1 bg-gradient-to-r from-green-500 to-emerald-600" />
                )}

                <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-0 group-hover:opacity-100" />

                <div className="relative bg-gradient-to-br from-white to-green-50/50 border-2 border-green-200 p-8 rounded-2xl hover:border-green-400 transition-all duration-300 hover:shadow-2xl text-center h-full flex flex-col items-center justify-center">
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {itemData.step}
                  </div>

                  <div className="text-5xl mb-6 text-green-600 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 transform">
                    {itemData.icon}
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    {itemData.title}
                  </h3>

                  <p className="text-slate-600 font-medium">
                    {itemData.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* All Canteens Menu Items Section */}
      <section className="py-24 bg-gradient-to-b from-green-50/50 to-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-200/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-200/15 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block mb-4 px-6 py-2 bg-green-100 border border-green-400 rounded-full">
              <span className="text-green-700 font-bold text-sm">🍽️ ALL CANTEENS</span>
            </div>
            <h2 className="text-5xl font-black text-slate-900 mb-6">Explore Delicious Menu 👇</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Browse amazing dishes from all 5 campus canteens - randomly curated just for you!
            </p>
          </motion.div>

          {loading ? (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-5xl mb-4 animate-bounce">⏳</div>
              <p className="text-lg text-gray-600">Loading menu items...</p>
            </motion.div>
          ) : allMenuItems && allMenuItems.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {allMenuItems.slice(0, 4).map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <MenuCard item={item} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {sampleMenuItems.slice(0, 4).map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <MenuCard item={item} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* View All Button */}
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Link
              to="/menu"
              className="inline-flex items-center justify-center bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-lg px-10 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              <span>Browse Full Menu</span>
              <span className="ml-2 animate-bounce">→</span>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

const features = [
  {
    icon: '🍽️',
    title: 'All Campus Canteens',
    description: 'Browse menus from 15+ canteens across campus. Every dining spot, one app.',
  },
  {
    icon: '⚡',
    title: '30-Min Delivery',
    description: 'Order during lectures, get food at hostel before study break. Lightning fast!',
  },
  {
    icon: '💰',
    title: 'Student Discounts',
    description: '20% off orders, free delivery, special cashback on your favorite meals.',
  },
  {
    icon: '🔐',
    title: 'Secure Payment',
    description: 'UPI, Cards, Wallet, or COD. Your payments are 100% safe and secure.',
  },
  {
    icon: '⭐',
    title: 'Real Reviews',
    description: 'Read genuine reviews from 10K+ students. See what\'s actually good.',
  },
  {
    icon: '📍',
    title: 'Live Tracking',
    description: 'See exactly where your order is. Real-time updates every 30 seconds.',
  },
];

const sampleMenuItems = [
  {
    _id: '1',
    name: 'Aloo Gobi',
    description: 'Spiced potato and cauliflower curry cooked to perfection',
    price: 120,
    category: 'lunch',
    rating: 4.5,
    reviewCount: 234,
    image: 'https://via.placeholder.com/300x200?text=Aloo+Gobi',
    discount: 10,
  },
  {
    _id: '2',
    name: 'Paneer Tikka',
    description: 'Grilled cottage cheese cubes marinated in spices',
    price: 150,
    category: 'snacks',
    rating: 4.7,
    reviewCount: 156,
    image: 'https://via.placeholder.com/300x200?text=Paneer+Tikka',
    discount: 5,
  },
  {
    _id: '3',
    name: 'Masala Dosa',
    description: 'Crispy rice crepe filled with spiced potatoes',
    price: 80,
    category: 'breakfast',
    rating: 4.6,
    reviewCount: 312,
    image: 'https://via.placeholder.com/300x200?text=Masala+Dosa',
    discount: 0,
  },
  {
    _id: '4',
    name: 'Biryani',
    description: 'Fragrant rice cooked with meat and traditional spices',
    price: 200,
    category: 'lunch',
    rating: 4.8,
    reviewCount: 421,
    image: 'https://via.placeholder.com/300x200?text=Biryani',
    discount: 15,
  },
];

export default HomePage;
