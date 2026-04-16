import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

const LearnMoreModal = ({ isOpen, onClose }) => {
  const [userType, setUserType] = useState(null);

  const studentContent = {
    title: '🎓 QuickBite for Students',
    tagline: 'Your Perfect Campus Food Companion',
    highlights: [
      { icon: '💰', title: 'Student Discounts', desc: '20% off on all combo meals with student ID' },
      { icon: '⚡', title: 'Super Fast', desc: '30-minute guaranteed delivery to your hostel' },
      { icon: '🤝', title: 'Group Orders', desc: '25% discount when ordering with 5+ friends' },
      { icon: '⏰', title: 'Perfect Timing', desc: 'Breakfast, lunch, snacks - we\'re here all day' },
      { icon: '📱', title: 'Easy Payment', desc: 'Multiple payment options including student wallets' },
      { icon: '⭐', title: 'Verified Reviews', desc: '4.6+ rating from 10K+ verified students' },
    ],
    testimonials: [
      {
        name: 'Rajesh Kumar',
        year: '2nd Year CSE',
        quote: 'Finally, good food without leaving my hostel! QuickBite is a lifesaver during exams.',
        avatar: '👨‍🎓',
      },
      {
        name: 'Priya Sharma',
        year: '1st Year BBA',
        quote: 'Love the group discounts! My friends and I save so much money now.',
        avatar: '👩‍🎓',
      },
      {
        name: 'Arjun Singh',
        year: '3rd Year Mech',
        quote: 'The 30-minute delivery guarantee is amazing. Always on time, always hot!',
        avatar: '👨‍🎓',
      },
    ],
    cta: '🍔 Start Ordering Now',
  };

  const facultyContent = {
    title: '👨‍🏫 QuickBite for Faculty & Staff',
    tagline: 'Premium Dining for Campus Professionals',
    highlights: [
      { icon: '💼', title: 'Faculty Special', desc: 'Daily lunch buffet at flat ₹99 - unbeatable value!' },
      { icon: '📦', title: 'Bulk Orders', desc: 'Special pricing for staff meetings and events' },
      { icon: '🚚', title: 'Quick Service', desc: 'Priority delivery to staff quarters and offices' },
      { icon: '🏛️', title: 'Premium Options', desc: 'Exclusive dishes prepared for faculty preferences' },
      { icon: '💳', title: 'Easy Billing', desc: 'Monthly billing and invoice support available' },
      { icon: '🎁', title: 'Loyalty Rewards', desc: 'Earn points on every order for future discounts' },
    ],
    testimonials: [
      {
        name: 'Dr. Amit Verma',
        role: 'Associate Professor',
        quote: 'QuickBite has simplified my lunch breaks. Quality food, great price, delivered to my office!',
        avatar: '👨‍🏫',
      },
      {
        name: 'Ms. Sneha Patel',
        role: 'Department Head',
        quote: 'We use QuickBite for all our staff meetings. The bulk discounts are fantastic.',
        avatar: '👩‍🏫',
      },
      {
        name: 'Mr. Rajesh Nair',
        role: 'Senior Lecturer',
        quote: 'Professional service, consistent quality. This is what campus dining should be!',
        avatar: '👨‍🏫',
      },
    ],
    cta: '🍔 Order for Your Team',
  };

  const content = userType === 'student' ? studentContent : userType === 'faculty' ? facultyContent : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-green-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 bg-green-100 hover:bg-green-200 rounded-full transition"
              >
                <FiX className="text-2xl text-slate-700" />
              </motion.button>

              {/* Selection View */}
              {!userType && (
                <motion.div
                  className="p-8 md:p-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
                      Welcome to QuickBite! 🎉
                    </h2>
                    <p className="text-xl text-slate-600 mb-2">
                      Choose your profile to see exclusive benefits
                    </p>
                    <p className="text-slate-500">
                      We have special offers tailored just for you!
                    </p>
                  </div>

                  {/* Choice Buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Student Card */}
                    <motion.div
                      whileHover={{ y: -8 }}
                      onClick={() => setUserType('student')}
                      className="cursor-pointer group"
                    >
                      <div className="bg-gradient-to-br from-green-500 to-green-600 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition h-full">
                        <div className="text-6xl mb-4">🎓</div>
                        <h3 className="text-3xl font-bold text-white mb-2">I'm a Student</h3>
                        <p className="text-green-100 mb-6 text-lg">
                          Get student discounts, group offers, and fast hostel delivery
                        </p>
                        <motion.div
                          className="inline-block bg-white text-green-600 font-bold px-6 py-2 rounded-lg group-hover:scale-105 transition"
                          whileHover={{ scale: 1.05 }}
                        >
                          Learn More →
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Faculty Card */}
                    <motion.div
                      whileHover={{ y: -8 }}
                      onClick={() => setUserType('faculty')}
                      className="cursor-pointer group"
                    >
                      <div className="bg-gradient-to-br from-slate-600 to-slate-700 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition h-full">
                        <div className="text-6xl mb-4">👨‍🏫</div>
                        <h3 className="text-3xl font-bold text-white mb-2">I'm Faculty/Staff</h3>
                        <p className="text-slate-200 mb-6 text-lg">
                          Premium pricing, bulk orders, and professional service
                        </p>
                        <motion.div
                          className="inline-block bg-white text-slate-700 font-bold px-6 py-2 rounded-lg group-hover:scale-105 transition"
                          whileHover={{ scale: 1.05 }}
                        >
                          Learn More →
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Content View */}
              {content && (
                <motion.div
                  className="p-8 md:p-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Back Button */}
                  <motion.button
                    whileHover={{ x: -4 }}
                    onClick={() => setUserType(null)}
                    className="text-green-600 font-bold mb-8 hover:text-green-700 transition flex items-center gap-2"
                  >
                    ← Back
                  </motion.button>

                  {/* Header */}
                  <div className="mb-10">
                    <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent mb-2">
                      {content.title}
                    </h2>
                    <p className="text-xl text-slate-600">
                      {content.tagline}
                    </p>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {content.highlights.map((highlight, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-l-4 border-green-600 hover:shadow-md transition"
                      >
                        <div className="text-4xl mb-3">{highlight.icon}</div>
                        <h4 className="text-lg font-bold text-slate-900 mb-2">
                          {highlight.title}
                        </h4>
                        <p className="text-slate-700">
                          {highlight.desc}
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Testimonials */}
                  <div className="mb-12">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">
                      💬 What Others Say
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {content.testimonials.map((testimonial, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          className="bg-white p-6 rounded-xl shadow-md border border-green-200 hover:shadow-lg transition"
                        >
                          <div className="text-5xl mb-3">{testimonial.avatar}</div>
                          <p className="text-slate-700 mb-4 italic">
                            "{testimonial.quote}"
                          </p>
                          <div>
                            <p className="font-bold text-slate-900">
                              {testimonial.name}
                            </p>
                            <p className="text-sm text-slate-500">
                              {testimonial.year || testimonial.role}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onClose}
                      className="px-10 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-2xl transition"
                    >
                      {content.cta}
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LearnMoreModal;
