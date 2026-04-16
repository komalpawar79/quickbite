import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiArrowRight, FiTruck, FiHome, FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import RazorpayPayment from '../components/payment/RazorpayPayment';

const OrderPage = () => {
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart, calculateTotal, updateQuantity, removeFromCart } = useCartStore();
  const { user, token, isAuthenticated } = useAuthStore();
  const [orderMode, setOrderMode] = useState('dine-in');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [specialRequests, setSpecialRequests] = useState('');
  const [address, setAddress] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [canteenInfo, setCanteenInfo] = useState(null);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);

  // Payment success handler
  const handlePaymentSuccess = (data) => {
    toast.success('✅ Payment completed successfully!');
    setOrderConfirmed(true);
    setShowPaymentGateway(false);
    clearCart();
    setShowSummary(false);
  };

  // Payment failure handler
  const handlePaymentFailure = (reason) => {
    toast.error(`❌ Payment failed: ${reason}`);
    setShowPaymentGateway(false);
    // Order is already created, user can retry payment
  };

  // ✅ Auth Guard - Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Calculate total when component mounts or cart changes
  useEffect(() => {
    calculateTotal();
  }, [cart, calculateTotal]);


  const handleIncreaseQuantity = (itemId) => {
    const item = cart.find(i => i._id === itemId);
    if (item) {
      updateQuantity(itemId, item.quantity + 1);
      calculateTotal();
    }
  };

  const handleDecreaseQuantity = (itemId) => {
    const item = cart.find(i => i._id === itemId);
    if (item) {
      if (item.quantity > 1) {
        updateQuantity(itemId, item.quantity - 1);
        calculateTotal();
      } else {
        removeFromCart(itemId);
        calculateTotal();
        toast.success('Item removed from cart');
      }
    }
  };

  const tax = Math.round(totalPrice * 0.05);
  const finalTotal = totalPrice + tax;

  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }
    setShowSummary(true);
  };

  const handleConfirmOrder = async () => {
    if (!user) {
      toast.error('Please login first!');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      // Validate cart
      if (cart.length === 0) {
        throw new Error('Cart is empty');
      }

      // Validate delivery address for delivery mode
      if (orderMode === 'delivery' && (!address || address.trim() === '')) {
        throw new Error('Please enter your delivery address for campus delivery');
      }

      // Get canteen ID from first item
      const firstItem = cart[0];
      let canteenId = firstItem.canteenId || firstItem.canteen;
      
      // Extract _id if canteenId is an object
      if (typeof canteenId === 'object' && canteenId !== null) {
        canteenId = canteenId._id || canteenId.id;
      }
      
      // Convert to string
      canteenId = String(canteenId);

      if (!canteenId || canteenId === 'undefined' || canteenId === 'null') {
        throw new Error('Canteen ID not found in cart');
      }

      // Get canteen info first
      const canteenResponse = await fetch(`http://localhost:5000/api/canteens/${canteenId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const canteenData = await canteenResponse.json();
      if (canteenData.success && canteenData.canteen) {
        setCanteenInfo(canteenData.canteen);
      }

      // Prepare order items - validate ObjectId format
      const items = cart.map(item => {
        const itemId = item._id?.toString?.() || String(item._id);
        
        // Check if it's a valid MongoDB ObjectId (24 hex chars)
        if (!itemId || itemId.length === 0) {
          throw new Error(`Invalid item ID: "${itemId}"`);
        }
        
        // Validate ObjectId format (24 character hex string)
        if (!/^[0-9a-f]{24}$/i.test(itemId) && !/^\d+$/.test(itemId)) {
          console.warn(`Item ID "${itemId}" may not be valid MongoDB format, but sending anyway:`, item);
        }

        return {
          menuItem: itemId,
          quantity: parseInt(item.quantity) || 1,
          price: parseFloat(item.price) || 0,
          specialInstructions: ''
        };
      });

      const orderData = {
        canteenId: String(canteenId),
        items: items,
        orderMode,
        totalAmount: parseFloat(totalPrice) || 0,
        tax: parseInt(tax) || 0,
        finalAmount: parseFloat(finalTotal) || 0,
        paymentMethod,
        specialRequests,
        userPhone: user?.phone || '',
        deliveryAddress: address,
        estimatedTime: 30,
        status: 'pending',
        paymentStatus: paymentMethod === 'razorpay' ? 'pending' : 'pending'
      };

      console.log('Sending order data:', orderData);

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Order creation failed:', {
          status: response.status,
          response: data,
          message: data.message || data.error || 'Failed to create order'
        });
        throw new Error(data.message || data.error || 'Failed to create order');
      }

      toast.success('✅ Order placed successfully!');
      console.log('Order created:', data);
      
      // Set the confirmed order
      setConfirmedOrder(data.data?.order || data.order);
      
      // Mark order as confirmed
      setOrderConfirmed(true);
      
      // If payment method is Razorpay, show payment gateway modal
      if (paymentMethod === 'razorpay') {
        setShowPaymentGateway(true);
        // Payment modal will handle the checkout
      } else {
        // For COD and other methods, clear cart and hide summary
        clearCart();
        setShowSummary(false);
      }
    } catch (error) {
      console.error('Order error:', error);
      toast.error(error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50  py-8">
      {/* Order Confirmation Modal - Hide when showing payment gateway */}
      {orderConfirmed && confirmedOrder && !showPaymentGateway && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-white  rounded-xl shadow-2xl max-w-md w-full p-8"
          >
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center"
              >
                <span className="text-3xl text-white">✓</span>
              </motion.div>
            </div>

            {/* Confirmation Message */}
            <h2 className="text-2xl font-bold text-center text-dark  mb-2">
              Order Confirmed!
            </h2>
            <p className="text-center text-gray-600  mb-6">
              Your order has been placed successfully
            </p>

            {/* Order Details */}
            <div className="bg-gray-50  rounded-lg p-4 mb-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 ">Order ID:</span>
                <span className="font-semibold text-dark ">
                  #{confirmedOrder._id?.slice(-6)?.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 ">Phone:</span>
                <span className="font-semibold text-blue-600">
                  {confirmedOrder.userPhone || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 ">Total Amount:</span>
                <span className="font-semibold text-green-600">
                  ₹{confirmedOrder.finalAmount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 ">Delivery Mode:</span>
                <span className="font-semibold text-dark  capitalize">
                  {confirmedOrder.orderMode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 ">Estimated Time:</span>
                <span className="font-semibold text-dark ">
                  ~{confirmedOrder.estimatedTime} min
                </span>
              </div>
            </div>

            {/* Items Summary */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700  mb-3 text-sm">
                Order Items ({confirmedOrder.items?.length || 0})
              </h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {confirmedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-gray-600 ">
                    <span>
                      {item.menuItem?.name || 'Item'} x {item.quantity}
                    </span>
                    <span className="font-semibold">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => navigate('/my-orders')}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Track Your Order
              </button>
              <button
                onClick={() => {
                  setOrderConfirmed(false);
                  navigate('/menu');
                }}
                className="w-full bg-gray-200 text-dark  py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Continue Shopping
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Razorpay Payment Gateway Modal  */}
      {showPaymentGateway && confirmedOrder && canteenInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8"
          >
            <h2 className="text-2xl font-bold text-dark mb-4">Complete Payment</h2>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-6 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-semibold">#{confirmedOrder._id?.slice(-6)?.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Canteen:</span>
                <span className="font-semibold">{canteenInfo.name}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="font-bold text-dark">Amount:</span>
                <span className="font-bold text-green-600">₹{confirmedOrder.finalAmount}</span>
              </div>
            </div>

            <RazorpayPayment
              orderId={confirmedOrder._id}
              amount={confirmedOrder.finalAmount}
              canteenId={canteenInfo._id}
              canteenName={canteenInfo.name}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentFailure={handlePaymentFailure}
            />

            <button
              onClick={() => {
                setShowPaymentGateway(false);
                toast('Payment cancelled. You can retry from My Orders.');
              }}
              className="w-full mt-3 bg-gray-200 text-dark py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Skip for Now
            </button>
          </motion.div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-dark  mb-8">Order Summary</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Mode */}
              <div className="bg-white  p-6 rounded-lg shadow-soft">
                <h2 className="text-2xl font-bold text-dark  mb-4">Select Delivery Mode</h2>
                <div className="space-y-3">
                  {[
                    { id: 'dine-in', label: 'Dine-In', icon: <FiHome className="text-2xl" /> },
                    { id: 'takeaway', label: 'Takeaway', icon: <FiShoppingCart className="text-2xl" /> },
                    { id: 'delivery', label: 'Campus Delivery', icon: <FiTruck className="text-2xl" /> },
                  ].map((mode) => (
                    <motion.button
                      key={mode.id}
                      onClick={() => setOrderMode(mode.id)}
                      className={`w-full p-4 rounded-lg flex items-center space-x-4 transition ${
                        orderMode === mode.id
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100  text-dark  hover:bg-primary-100 :bg-gray-600'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {mode.icon}
                      <span className="font-semibold">{mode.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white  p-6 rounded-lg shadow-soft">
                <h2 className="text-2xl font-bold text-dark  mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {[
                    { id: 'razorpay', label: '💳 Razorpay (Card/UPI/Wallet)' },
                    { id: 'upi', label: '📱 UPI' },
                    { id: 'cash', label: '💵 Cash on Delivery' },
                  ].map((method) => (
                    <motion.button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`w-full p-4 rounded-lg text-left font-semibold transition ${
                        paymentMethod === method.id
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100  text-dark  hover:bg-primary-100 :bg-gray-600'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {method.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Delivery Address - Only for Campus Delivery */}
              {orderMode === 'delivery' && (
                <div className="bg-white  p-6 rounded-lg shadow-soft">
                  <h2 className="text-2xl font-bold text-dark  mb-4">📍 Delivery Location</h2>
                  <p className="text-gray-600 text-sm mb-3">Where should we deliver your order?</p>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="E.g. Campus - Building A, Block 2 / Hostel Room 201 / Your Address..."
                    className="w-full px-4 py-3 border border-gray-300  rounded-lg bg-white  text-dark  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows="3"
                  />
                </div>
              )}

              {/* Special Requests */}
              <div className="bg-white  p-6 rounded-lg shadow-soft">
                <h2 className="text-2xl font-bold text-dark  mb-4">Special Requests</h2>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Add any special instructions for your order..."
                  className="w-full px-4 py-3 border border-gray-300  rounded-lg bg-white  text-dark  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="4"
                />
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                className="bg-white  p-6 rounded-lg shadow-premium sticky top-24"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h3 className="text-2xl font-bold text-dark  mb-6">Bill Summary</h3>

                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {cart.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Your cart is empty</p>
                  ) : (
                    cart.map((item) => (
                      <div key={item._id} className="flex justify-between items-center text-sm bg-gray-50  p-3 rounded-lg gap-2">
                        <div className="flex-1">
                          <span className="text-gray-600 ">
                            {item.name}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              onClick={() => handleDecreaseQuantity(item._id)}
                              className={`p-1 rounded transition ${
                                item.quantity === 1
                                  ? 'bg-red-500 hover:bg-red-600 text-white'
                                  : 'bg-orange-500 hover:bg-orange-600 text-white'
                              }`}
                              title={item.quantity === 1 ? 'Click to remove item' : 'Decrease quantity'}
                            >
                              <FiMinus size={12} />
                            </button>
                            <span className="font-semibold text-dark  w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleIncreaseQuantity(item._id)}
                              className="p-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                            >
                              <FiPlus size={12} />
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-dark  block">
                            ₹{item.price * item.quantity}
                          </span>
                          <span className="text-xs text-gray-500 ">
                            ₹{item.price} each
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            removeFromCart(item._id);
                            calculateTotal();
                            toast.success('Item removed');
                          }}
                          className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition flex-shrink-0"
                          title="Delete item"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-gray-200  pt-4 space-y-3">
                  {address && (
                    <div className="flex gap-2 p-3 bg-blue-50 rounded-lg text-sm">
                      <span className="text-lg">📍</span>
                      <div className="flex-1">
                        <p className="text-gray-600 font-semibold">Delivery To:</p>
                        <p className="text-dark font-semibold">{address}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 ">Subtotal</span>
                    <span className="text-dark  font-semibold">₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 ">Tax (5%)</span>
                    <span className="text-dark  font-semibold">₹{tax}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 ">
                    <span className="text-dark ">Total</span>
                    <span className="text-primary-500">₹{finalTotal}</span>
                  </div>
                </div>

                <motion.button
                  onClick={handlePlaceOrder}
                  className="w-full mt-6 btn-primary py-3 font-bold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={cart.length === 0}
                >
                  <span>Place Order</span>
                  <FiArrowRight />
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Order Confirmation Modal - Hide when showing payment gateway */}
        {showSummary && !showPaymentGateway && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowSummary(false)}
          >
            <motion.div
              className="bg-white  rounded-lg p-8 max-w-md w-full"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-dark  mb-4">Confirm Order?</h3>
              <p className="text-gray-600  mb-6">
                Order Mode: <span className="font-bold capitalize text-dark ">{orderMode}</span>
                <br />
                Payment: <span className="font-bold capitalize text-dark ">{paymentMethod}</span>
                <br />
                {address && (
                  <>
                    Location: <span className="font-bold text-dark ">{address}</span>
                    <br />
                  </>
                )}
                Total: <span className="font-bold text-primary-500">₹{finalTotal}</span>
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowSummary(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300  rounded-lg text-dark  hover:bg-gray-100 :bg-gray-700 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmOrder}
                  disabled={loading}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OrderPage;
