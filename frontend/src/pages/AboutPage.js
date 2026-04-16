import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiAward, FiUsers, FiTrendingUp, FiHeart, FiMapPin, FiClock } from 'react-icons/fi';
import LearnMoreModal from '../components/LearnMoreModal';

const AboutPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('story');
  const [showLearnMore, setShowLearnMore] = useState(false);

  // Scroll animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Campus statistics
  const stats = [
    { icon: FiUsers, value: '10K+', label: 'Daily Users' },
    { icon: FiMapPin, value: '5', label: 'Canteens' },
    { icon: FiTrendingUp, value: '500+', label: 'Menu Items' },
    { icon: FiClock, value: '30 min', label: 'Avg Delivery' },
  ];

  // Team members
  const teamMembers = [
    {
      name: 'Raj Patil',
      role: 'Backend Developer',
      emoji: '👨‍💼',
     
    },
    {
      name: 'Saniya More',
      role: 'Frontend Developer',
      emoji: '👩‍💼',
      
    },
    {
      name: 'komal Pawar',
      role: 'Backend Developer ',
      emoji: '👨‍💻',
    
    },
    {
      name: 'Naushad Rahi',
      role: 'Frontend Developer',
      emoji: '👩‍💼',
    },
    {
      name: 'Rushikesh Deshmukh',
      role: 'UI/UX Designer',
      emoji: '👩‍💼',
      specialty: 'Student Support', 
    }
  ];

  // Why QuickBite
  const reasons = [
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: '30-minute guaranteed delivery or your order is FREE!',
    },
    {
      icon: '🔒',
      title: 'Safe & Hygienic',
      description: 'All canteens follow strict hygiene standards daily',
    },
    {
      icon: '💰',
      title: 'Budget Friendly',
      description: 'Special discounts for students, faculty, and groups',
    },
    {
      icon: '📱',
      title: 'Easy Ordering',
      description: 'Simple app interface, just 3 clicks to order',
    },
    {
      icon: '🌱',
      title: 'Healthy Options',
      description: 'Veg, non-veg, vegan, and special diet options',
    },
    {
      icon: '⭐',
      title: 'Quality Guaranteed',
      description: 'Ratings & reviews from 10K+ verified students',
    },
  ];

  // Campus zones
  const campusZones = [
    {
      zone: 'Central Campus',
      canteen: '🏢 Main Canteen',
      dishes: 'All-day breakfast to dinner',
      image: '🏫',
      color: 'from-blue-500 to-blue-600',
    },
    {
      zone: 'Near Hostels',
      canteen: '🍽️ Food Court',
      dishes: 'Popular favorites & combos',
      image: '🏘️',
      color: 'from-purple-500 to-purple-600',
    },
    {
      zone: 'Library Building',
      canteen: '⚡ Quick Bites',
      dishes: 'Fast snacks & beverages',
      image: '📚',
      color: 'from-amber-500 to-amber-600',
    },
    {
      zone: 'Student Center',
      canteen: '☕ Cafe Coffee',
      dishes: 'Coffee, shakes & pastries',
      image: '🎓',
      color: 'from-green-500 to-green-600',
    },
  ];

  // Journey timeline
  const timeline = [
    { year: '2024', event: '🚀 QuickBite Launched', description: 'Started with vision to revolutionize campus food' },
    { year: '2024', event: '🎉 1,000 Orders', description: 'Reached first 1,000 successful deliveries' },
    { year: '2024', event: '⭐ 4.6+ Rating', description: 'Maintained excellent quality standards' },
    { year: '2025', event: '🌟 Growing Strong', description: 'Expanding reach with more features' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <motion.section
        className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-600 via-emerald-500 to-green-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Geometric Grid Pattern SVG */}
          <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-about" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
              </pattern>
              <pattern id="dots-about" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="2" fill="rgba(255,255,255,0.5)"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-about)" />
            <rect width="100%" height="100%" fill="url(#dots-about)" />
          </svg>

          {/* Floating Gradient Blobs */}
          <motion.div
            animate={{ y: [0, 20, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 6, repeat: Infinity, repeatType: "loop" }}
            className="absolute top-10 left-10 w-80 h-80 bg-gradient-to-br from-green-300 to-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          />
          <motion.div
            animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 8, repeat: Infinity, repeatType: "loop", delay: 2 }}
            className="absolute -bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-emerald-300 to-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15"
          />
          <motion.div
            animate={{ y: [0, 15, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 7, repeat: Infinity, repeatType: "loop", delay: 3 }}
            className="absolute top-1/2 right-1/4 w-72 h-72 bg-gradient-to-br from-white to-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"
          />
        </div>

        {/* Hero Content */}
        <motion.div
          className="relative z-10 text-center px-6 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div
            className="inline-block mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <span className="px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white font-semibold text-sm">
              ✨ Behind QuickBite
            </span>
          </motion.div>

          <motion.h1
            className="text-6xl md:text-7xl font-black text-white mb-6 drop-shadow-2xl leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            About Our
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-100 via-white to-emerald-100">
              Campus Journey
            </span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-white/90 font-medium mb-12 drop-shadow-lg max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Transforming student dining with fast, fresh, and friendly food powered by passion
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/menu')}
              className="px-8 py-4 bg-white text-green-600 rounded-full font-bold text-lg shadow-lg hover:shadow-2xl transition-all"
            >
              Order Now
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowLearnMore(true)}
              className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white/20 text-white rounded-full font-bold text-lg transition-all"
            >
              Learn More
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        className="py-20 px-4 max-w-7xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            By The Numbers
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our impact on campus life, measured in satisfaction and growth
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                variants={staggerItem}
                className="relative group"
                whileHover={{ y: -10 }}
              >
                {/* Glow Background */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-300" />
                
                <div className="relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 group-hover:border-green-200">
                  <Icon className="text-5xl text-green-600 mx-auto mb-4" />
                  <div className="text-4xl font-black text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 font-semibold text-lg">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Tabs Section */}
      <motion.section
        className="py-20 px-4 max-w-7xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Explore Our Story
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From humble beginnings to campus favorite
          </p>
        </motion.div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-3 mb-12 justify-center">
          {['story', 'why', 'campus', 'team'].map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-full font-bold capitalize transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab === 'story' && '📖'} {tab === 'why' && '⭐'} {tab === 'campus' && '🏫'} {tab === 'team' && '👥'} {tab}
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Story Tab */}
          {activeTab === 'story' && (
            <div className="space-y-8">
              <motion.div
                className="bg-gradient-to-br from-white to-gray-50 p-10 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
              >
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">Our Story</h2>
                <div className="space-y-4">
                  <p className="text-gray-700 text-lg leading-relaxed">
                    <span className="font-bold text-green-600">QuickBite was born from a simple observation:</span> students are hungry, busy, and deserve better food options on campus!
                  </p>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    We started with a vision to transform the way students eat on campus. <span className="font-bold text-emerald-600">No more waiting in long queues, no more expensive delivery fees, no more compromising on quality.</span>
                  </p>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    Today, QuickBite serves <span className="font-bold text-green-600">10,000+ students daily</span> with <span className="font-bold">5 canteens, 500 + dishes,</span> and <span className="font-bold text-emerald-600">lightning-fast delivery.</span> We're not just a food app - we're part of the campus lifestyle! 🎓
                  </p>
                </div>
              </motion.div>

              {/* Timeline */}
              <div className="space-y-4">
                {timeline.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative group"
                    whileHover={{ x: 10 }}
                  >
                    {/* Left border with gradient */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 to-emerald-500 group-hover:from-green-400 group-hover:to-emerald-400 rounded transition-all" />
                    
                    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg border border-gray-100 group-hover:border-green-200 transition-all ml-6">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl font-black text-green-600 whitespace-nowrap pt-1">{item.year}</div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{item.event}</h3>
                          <p className="text-gray-600 leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Why Tab */}
          {activeTab === 'why' && (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {reasons.map((reason, index) => (
                <motion.div
                  key={index}
                  variants={staggerItem}
                  whileHover={{ y: -12 }}
                  className="relative group"
                >
                  {/* Glow Background */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl opacity-0 group-hover:opacity-30 blur transition duration-300" />
                  
                  {/* Card */}
                  <div className="relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 group-hover:border-green-200">
                    {/* Icon with Gradient Background */}
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center text-4xl mb-4 group-hover:from-green-200 group-hover:to-emerald-200 transition-all">
                      {reason.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {reason.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {reason.description}
                    </p>
                    {/* Bottom accent line */}
                    <div className="absolute bottom-0 left-8 right-8 h-1 bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-all rounded-full" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Campus Tab */}
          {activeTab === 'campus' && (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {campusZones.map((zone, index) => (
                <motion.div
                  key={index}
                  variants={staggerItem}
                  whileHover={{ y: -5 }}
                  className={`bg-gradient-to-br ${zone.color} text-white p-8 rounded-2xl shadow-lg overflow-hidden relative group`}
                >
                  {/* Background Animation */}
                  <div className="absolute inset-0 opacity-10 text-8xl flex items-center justify-center pointer-events-none">
                    {zone.image}
                  </div>

                  <div className="relative z-10">
                    <div className="text-5xl mb-3">{zone.image}</div>
                    <h3 className="text-2xl font-bold mb-2">{zone.zone}</h3>
                    <p className="text-lg font-semibold mb-2">{zone.canteen}</p>
                    <p className="text-sm opacity-90">{zone.dishes}</p>
                  </div>

                  {/* Hover Effect */}
                  <motion.div
                    className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                    whileHover={{ opacity: 1 }}
                  >
                    <button className="bg-white text-dark px-6 py-2 rounded-lg font-bold">
                      Visit →
                    </button>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Team Tab */}
          {activeTab === 'team' && (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  variants={staggerItem}
                  whileHover={{ y: -12 }}
                  className="relative group"
                >
                  {/* Glow Background */}
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-green-400 via-emerald-500 to-green-400 rounded-2xl opacity-0 group-hover:opacity-25 blur transition duration-300" />
                  
                  {/* Card */}
                  <div className="relative bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl text-center transition-all border border-gray-100 group-hover:border-green-200">
                    {/* Avatar with gradient circle */}
                    <div className="w-20 h-20 mx-auto mb-4 relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full blur opacity-20 group-hover:opacity-40 transition" />
                      <div className="relative w-full h-full bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center text-4xl">
                        {member.emoji}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {member.name}
                    </h3>
                    <p className="text-sm font-semibold text-green-600 mb-2 group-hover:text-emerald-600 transition">
                      {member.role}
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {member.specialty}
                    </p>
                    
                    {/* Top accent line */}
                    <div className="absolute top-0 left-1/4 right-1/4 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </motion.section>

      {/* Call to Action Section */}
      <motion.section
        className="py-20 px-4 bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Animated Background Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-cta" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-cta)" />
        </svg>

        {/* Floating Elements */}
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 4, repeat: Infinity, repeatType: "loop" }}
          className="absolute top-10 right-10 w-72 h-72 bg-white/5 rounded-full mix-blend-multiply filter blur-3xl"
        />
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 5, repeat: Infinity, repeatType: "loop", delay: 1 }}
          className="absolute -bottom-20 left-1/4 w-80 h-80 bg-white/5 rounded-full mix-blend-multiply filter blur-3xl"
        />

        <motion.div
          className="relative z-10 max-w-4xl mx-auto text-center text-white"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-block mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <span className="px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-sm font-semibold">
              🎉 Limited Time Offer
            </span>
          </motion.div>

          <h2 className="text-5xl md:text-6xl font-black mb-6 drop-shadow-lg">
            Ready to Order Your
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-100 via-white to-emerald-100">
              Favorite Meal?
            </span>
          </h2>
          <p className="text-xl md:text-2xl mb-10 opacity-95 drop-shadow-md max-w-2xl mx-auto">
            Join 10,000+ happy students and get fresh food delivered in 30 minutes!
          </p>
          <motion.button
            whileHover={{ scale: 1.08, boxShadow: "0 25px 50px rgba(0,0,0,0.25)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/menu')}
            className="px-10 py-4 bg-white text-green-600 font-bold text-lg rounded-full shadow-2xl hover:shadow-3xl transition-all"
          >
            Start Ordering Now
          </motion.button>
        </motion.div>
      </motion.section>

      {/* Footer Info */}
      <motion.section
        className="py-12 px-4 bg-white "
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl mb-2">📱</div>
            <h3 className="font-bold text-dark  mb-1">Easy App</h3>
            <p className="text-gray-600 ">Download QuickBite app for easy ordering</p>
          </div>
          <div>
            <div className="text-4xl mb-2">🚚</div>
            <h3 className="font-bold text-dark  mb-1">Fast Delivery</h3>
            <p className="text-gray-600 ">Average 30 mins from order to your door</p>
          </div>
          <div>
            <div className="text-4xl mb-2">⭐</div>
            <h3 className="font-bold text-dark  mb-1">Quality Assured</h3>
            <p className="text-gray-600 ">Rated 4.6+ by 10K+ verified students</p>
          </div>
        </div>
      </motion.section>

      {/* LearnMoreModal Component */}
      <LearnMoreModal isOpen={showLearnMore} onClose={() => setShowLearnMore(false)} />
    </div>
  );
};

export default AboutPage;
