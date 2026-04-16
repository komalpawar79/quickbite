import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { CreditCard, Loader } from 'lucide-react';

const RazorpayPayment = ({ orderId, amount, canteenId, canteenName, onPaymentSuccess, onPaymentFailure }) => {
  const [loading, setLoading] = useState(false);
  const [transactionId, setTransactionId] = useState(null);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initiatePayment = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      // Step 1: Initiate payment on backend
      const initiateResponse = await fetch('http://localhost:5000/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId,
          amount,
          canteenId
        })
      });

      const initiateData = await initiateResponse.json();

      if (!initiateData.success) {
        throw new Error(initiateData.message || 'Failed to initiate payment');
      }

      const {
        razorpayOrderId,
        transactionId: txnId,
        keyId
      } = initiateData.data;

      setTransactionId(txnId);

      // Step 2: Open Razorpay checkout
      const options = {
        key: keyId,
        amount: Math.round(amount * 100), // Amount in paise
        currency: 'INR',
        name: 'QuickBite',
        description: `Order from ${canteenName}`,
        order_id: razorpayOrderId,
        handler: async (response) => {
          await verifyPayment(response, txnId);
        },
        prefill: {
          name: initiateData.data.userName,
          email: initiateData.data.userEmail
        },
        theme: {
          color: '#3b82f6'
        },
        modal: {
          // Called when user closes/dismisses the Razorpay modal
          ondismiss: () => {
            console.log('User closed payment modal without completing');
            setLoading(false);
            toast('Payment cancelled');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('❌ Payment initiation error:', error);
      toast.error(error.message || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  const verifyPayment = async (response, txnId) => {
    try {
      const token = localStorage.getItem('token');

      // Step 3: Verify payment on backend
      const verifyResponse = await fetch('http://localhost:5000/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
          orderId,
          transactionId: txnId,
          canteenId
        })
      });

      const verifyData = await verifyResponse.json();

      if (verifyData.success) {
        toast.success('✅ Payment successful! Order confirmed.');
        console.log('✅ Payment verified:', verifyData.data);
        onPaymentSuccess(verifyData.data);
      } else {
        throw new Error(verifyData.message || 'Payment verification failed');
      }

    } catch (error) {
      console.error('❌ Payment verification error:', error);
      toast.error(error.message || 'Payment verification failed');
      
      // Record payment failure
      await recordPaymentFailure(txnId, error.message);
      onPaymentFailure(error.message);
    } finally {
      setLoading(false);
    }
  };

  const recordPaymentFailure = async (txnId, reason) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/payments/failure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId,
          transactionId: txnId,
          reason,
          canteenId
        })
      });
    } catch (error) {
      console.error('Error recording payment failure:', error);
    }
  };

  return (
    <button
      onClick={initiatePayment}
      disabled={loading}
      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
    >
      {loading ? (
        <>
          <Loader className="w-5 h-5 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="w-5 h-5" />
          Pay ₹{amount.toFixed(2)} with Razorpay
        </>
      )}
    </button>
  );
};

export default RazorpayPayment;
