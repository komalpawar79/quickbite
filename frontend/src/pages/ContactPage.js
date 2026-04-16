import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPhone, FiMail, FiMapPin, FiClock, FiSend, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ContactPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Contact information
  const contactInfo = [
    {
      icon: FiPhone,
      title: 'Phone',
      details: '+91 98765 43210',
      emoji: '📞',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: FiMail,
      title: 'Email',
      details: 'support@quickbite.in',
      emoji: '✉️',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: FiMapPin,
      title: 'Address',
      details: 'Campus Main Gate, CSMU University',
      emoji: '📍',
      color: 'from-red-500 to-red-600',
    },
    {
      icon: FiClock,
      title: 'Hours',
      details: '7 AM - 10 PM (Mon-Sun)',
      emoji: '🕐',
      color: 'from-green-500 to-green-600',
    },
  ];

  // FAQ items
  const faqs = [
    {
      question: '❓ How do I place an order?',
      answer: 'Download the QuickBite app, browse the menu, add items to cart, select your canteen, and checkout. Your order will be ready in 30 minutes!',
    },
    {
      question: '❓ What if I want to cancel my order?',
      answer: 'You can cancel orders within 5 minutes of placement. After that, you can contact our support team for assistance.',
    },
    {
      question: '❓ Do you offer student discounts?',
      answer: 'Yes! We offer 20% discount on combo meals for students with valid university ID. Plus, special group discounts for 5+ orders.',
    },
    {
      question: '❓ Is payment secure?',
      answer: 'Absolutely! We use industry-leading encryption and support multiple payment methods including cards, UPI, and wallets.',
    },
    {
      question: '❓ What about dietary preferences?',
      answer: 'We have options for veg, non-veg, vegan, and special diets. Filter by dietary preference in the menu.',
    },
    {
      question: '❓ How do I provide feedback?',
      answer: 'After each order, you can rate and review your experience. Your feedback helps us improve our service!',
    },
  ];

  // Social media links
  const socialLinks = [
    { icon: '📱', name: 'Instagram', url: 'https://instagram.com/quickbite' },
    { icon: '🐦', name: 'Twitter', url: 'https://twitter.com/quickbite' },
    { icon: '👍', name: 'Facebook', url: 'https://facebook.com/quickbite' },
    { icon: '🎥', name: 'YouTube', url: 'https://youtube.com/quickbite' },
  ];

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Message sent successfully! We\'ll get back to you soon.');
        setIsSubmitted(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });

        // Reset form after 3 seconds
        setTimeout(() => {
          setIsSubmitted(false);
        }, 3000);
      } else {
        toast.error(data.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100  ">
      {/* Hero Section */}
      <motion.section
        className="relative py-20 px-4 bg-gradient-to-r from-primary-500/10 via-secondary-500/10 to-accent/10    overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Diagonal Lines Pattern */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                currentColor 10px,
                currentColor 20px
              )`,
            }}
          />
          
          {/* Food image overlay (subtle) */}
          <div
            className="absolute inset-0 opacity-8"
            style={{
              backgroundImage:
                'url("https://images.unsplash.com/photo-1504674900436-24f5e97e4d0e?w=1200")',
              backgroundAttachment: 'fixed',
              backgroundPosition: 'center',
              backgroundSize: 'cover',
              mixBlendMode: 'soft-light',
            }}
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/80  via-transparent to-white/80 " />
        </div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-10 left-10 text-6xl opacity-30"
          animate={{ y: [0, 20, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
        >
          💬
        </motion.div>
        <motion.div
          className="absolute bottom-10 right-10 text-6xl opacity-30"
          animate={{ y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 5 }}
        >
          📞
        </motion.div>

        <motion.div
          className="relative z-10 max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-5xl md:text-6xl font-black text-dark  mb-4">
            Get in Touch 💌
          </h1>
          <p className="text-xl md:text-2xl text-gray-600  mb-2">
            We'd love to hear from you!
          </p>
          <p className="text-lg text-gray-500 ">
            Have questions? Need support? Want to collaborate? Reach out anytime.
          </p>
        </motion.div>
      </motion.section>

      {/* Contact Info Cards */}
      <motion.section
        className="py-16 px-4 max-w-7xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactInfo.map((info, index) => {
            const Icon = info.icon;
            return (
              <motion.div
                key={index}
                variants={staggerItem}
                whileHover={{ y: -8 }}
                className={`bg-gradient-to-br ${info.color} text-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition relative overflow-hidden group`}
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 text-6xl opacity-20 group-hover:opacity-30 transition">
                  {info.emoji}
                </div>

                <div className="relative z-10">
                  <Icon className="text-4xl mb-4" />
                  <h3 className="text-xl font-bold mb-2">{info.title}</h3>
                  <p className="text-sm opacity-90 font-semibold">
                    {info.details}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Main Contact Section */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white  p-8 rounded-2xl shadow-soft">
              <h2 className="text-3xl font-bold text-dark  mb-2">
                Send us a Message
              </h2>
              <p className="text-gray-600  mb-8">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>

              {isSubmitted ? (
                <motion.div
                  className="flex flex-col items-center justify-center py-12"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <FiCheckCircle className="text-6xl text-green-500 mb-4" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-dark  mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-gray-600  text-center">
                    Thank you for contacting us. We'll respond within 24 hours.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="block text-sm font-semibold text-dark  mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your name"
                      className="w-full px-4 py-3 border-2 border-gray-200  rounded-lg bg-white  text-dark  placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition"
                    />
                  </motion.div>

                  {/* Email */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 }}
                  >
                    <label className="block text-sm font-semibold text-dark  mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your.email@university.edu"
                      className="w-full px-4 py-3 border-2 border-gray-200  rounded-lg bg-white  text-dark  placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition"
                    />
                  </motion.div>

                  {/* Phone */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-sm font-semibold text-dark  mb-2">
                      Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 border-2 border-gray-200  rounded-lg bg-white  text-dark  placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition"
                    />
                  </motion.div>

                  {/* Subject */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.25 }}
                  >
                    <label className="block text-sm font-semibold text-dark  mb-2">
                      Subject *
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200  rounded-lg bg-white  text-dark  focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition"
                    >
                      <option value="">Select a subject...</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Customer Support</option>
                      <option value="feedback">Feedback</option>
                      <option value="partnership">Partnership</option>
                      <option value="bug">Report a Bug</option>
                    </select>
                  </motion.div>

                  {/* Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-sm font-semibold text-dark  mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Your message here..."
                      rows="5"
                      className="w-full px-4 py-3 border-2 border-gray-200  rounded-lg bg-white  text-dark  placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition resize-none"
                    />
                  </motion.div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1 }}
                        >
                          ⏳
                        </motion.span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <FiSend />
                        Send Message
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>

          {/* Quick Links & Info */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Quick Links */}
            <div className="bg-white  p-8 rounded-2xl shadow-soft">
              <h3 className="text-2xl font-bold text-dark  mb-6">
                🔗 Quick Links
              </h3>
              <div className="space-y-3">
                {[
                  { emoji: '📖', text: 'About Us', action: () => navigate('/about') },
                  { emoji: '🍔', text: 'Browse Menu', action: () => navigate('/menu') },
                  { emoji: '🎁', text: 'View Offers', action: () => navigate('/menu') },
                  { emoji: '📱', text: 'Download App', action: null },
                ].map((link, i) => (
                  <motion.button
                    key={i}
                    onClick={link.action}
                    disabled={!link.action}
                    whileHover={link.action ? { x: 8 } : {}}
                    className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center justify-between ${
                      link.action
                        ? 'bg-green-50 hover:bg-green-100 cursor-pointer'
                        : 'bg-gray-100 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <span className="font-semibold text-dark ">
                      {link.emoji} {link.text}
                    </span>
                    <span className={link.action ? 'text-green-600' : 'text-gray-400'}>→</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white  p-8 rounded-2xl shadow-soft">
              <h3 className="text-2xl font-bold text-dark  mb-6">
                🌐 Follow Us
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {socialLinks.map((social, i) => (
                  <motion.a
                    key={i}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -5, scale: 1.05 }}
                    className="bg-gradient-to-br from-primary-500 to-secondary-500 text-white p-4 rounded-xl font-bold text-center hover:shadow-lg transition"
                  >
                    <div className="text-2xl mb-2">{social.icon}</div>
                    <div className="text-sm">{social.name}</div>
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Response Time */}
            <motion.div
              className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-500/50  p-6 rounded-2xl"
              whileHover={{ scale: 1.02 }}
            >
              <h4 className="font-bold text-dark  mb-2">⏱️ Response Time</h4>
              <p className="text-sm text-gray-600 ">
                We typically respond within <strong>24 hours</strong> during business hours.
              </p>
              <p className="text-sm text-gray-600  mt-2">
                For urgent issues, call us directly at <strong>+91 98765 43210</strong>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <motion.section
        className="py-16 px-4 bg-white "
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-dark  mb-4">
              Frequently Asked Questions 🤔
            </h2>
            <p className="text-gray-600  text-lg">
              Find answers to common questions about QuickBite
            </p>
          </motion.div>

          <motion.div
            className="space-y-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                variants={staggerItem}
                className="bg-gray-50  p-6 rounded-xl hover:shadow-lg transition border-l-4 border-primary-500"
              >
                <h4 className="font-bold text-dark  mb-3 text-lg">
                  {faq.question}
                </h4>
                <p className="text-gray-600 ">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-20 px-4 bg-gradient-to-r from-primary-500 to-secondary-500 relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        {/* Animated Background */}
        <motion.div
          className="absolute inset-0 opacity-10 text-9xl flex items-center justify-around pointer-events-none"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
        >
          <span>🍜</span>
          <span>💬</span>
          <span>📞</span>
        </motion.div>

        <motion.div
          className="relative z-10 max-w-4xl mx-auto text-center text-white"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Ready to Get Started? 🚀
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Order delicious food right now and experience QuickBite magic!
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/menu')}
            className="px-10 py-4 bg-white text-primary-600 font-bold text-lg rounded-xl shadow-lg hover:shadow-2xl transition"
          >
            🍔 Order Now
          </motion.button>
        </motion.div>
      </motion.section>
    </div>
  );
};

export default ContactPage;
