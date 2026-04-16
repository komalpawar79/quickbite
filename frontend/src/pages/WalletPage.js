import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiArrowDown, FiArrowUp, FiCopy, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useWalletStore from '../store/walletStore';
import useAuthStore from '../store/authStore';

const WalletPage = () => {
  const { isAuthenticated } = useAuthStore();
  const {
    balance,
    totalAdded,
    totalSpent,
    transactions,
    isLoading,
    fetchWallet,
    addMoney,
    fetchTransactions,
  } = useWalletStore();

  const [showAddMoney, setShowAddMoney] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWallet();
      fetchTransactions();
    }
  }, [isAuthenticated]);

  const handleAddMoney = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const result = await addMoney(parseFloat(amount), 'Online');
    if (result.success) {
      toast.success(result.message);
      setAmount('');
      setSelectedAmount(null);
      setShowAddMoney(false);
      fetchWallet();
    } else {
      toast.error(result.error);
    }
  };

  const quickAddAmounts = [100, 200, 500, 1000];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100   flex items-center justify-center px-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h1 className="text-4xl font-bold text-dark  mb-4">
            Please Login First
          </h1>
          <p className="text-gray-600 ">
            You need to be logged in to use wallet features
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100   py-12 px-4">
      <motion.div
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-5xl font-black text-dark  mb-2">
            💳 My Wallet
          </h1>
          <p className="text-gray-600  text-lg">
            Manage your QuickBite wallet and payments
          </p>
        </motion.div>

        {/* Main Balance Card */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-br from-primary-500 to-secondary-500 text-white p-8 rounded-3xl shadow-2xl mb-8"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <p className="text-white/80 font-semibold mb-2">Available Balance</p>
              <h2 className="text-6xl font-black mb-6">₹{balance.toFixed(2)}</h2>
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddMoney(true)}
                  className="flex items-center gap-2 bg-white text-primary-600 px-6 py-3 rounded-lg font-bold hover:bg-opacity-90 transition"
                >
                  <FiPlus className="text-xl" />
                  Add Money
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    fetchWallet();
                    toast.success('Wallet refreshed!');
                  }}
                  className="flex items-center gap-2 bg-white/20 border border-white px-6 py-3 rounded-lg font-bold hover:bg-white/30 transition"
                >
                  <FiRefreshCw className="text-xl" />
                  Refresh
                </motion.button>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-8 md:mt-0 md:text-right space-y-4">
              <div>
                <p className="text-white/80 font-semibold">Total Added</p>
                <p className="text-3xl font-bold">₹{totalAdded.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-white/80 font-semibold">Total Spent</p>
                <p className="text-3xl font-bold">₹{totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Add Money Modal */}
        {showAddMoney && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowAddMoney(false)}
          >
            <motion.div
              className="bg-white  rounded-2xl p-8 max-w-md w-full"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-dark  mb-6">
                Add Money to Wallet
              </h3>

              {/* Quick Add Amounts */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {quickAddAmounts.map((amt) => (
                  <motion.button
                    key={amt}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedAmount(amt);
                      setAmount(amt.toString());
                    }}
                    className={`py-3 rounded-lg font-bold transition ${
                      selectedAmount === amt
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100  text-dark  hover:bg-gray-200 :bg-gray-600'
                    }`}
                  >
                    ₹{amt}
                  </motion.button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-dark  mb-2">
                  Custom Amount
                </label>
                <div className="flex gap-2">
                  <span className="flex items-center bg-gray-100  px-3 rounded-lg text-dark  font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setSelectedAmount(null);
                    }}
                    placeholder="Enter amount"
                    className="flex-1 px-4 py-3 border-2 border-gray-200  rounded-lg bg-white  text-dark  focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Limit Info */}
              <p className="text-xs text-gray-500  mb-6">
                Minimum: ₹1 | Maximum: ₹100,000
              </p>

              {/* Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddMoney}
                  disabled={isLoading}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Add Money'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddMoney(false)}
                  className="flex-1 bg-gray-200  text-dark  font-bold py-3 rounded-lg transition"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white  p-6 rounded-2xl shadow-soft"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-dark ">
                Total Money Added
              </h3>
              <FiArrowDown className="text-3xl text-green-500" />
            </div>
            <p className="text-4xl font-black text-green-500">
              ₹{totalAdded.toFixed(2)}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white  p-6 rounded-2xl shadow-soft"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-dark ">
                Total Money Spent
              </h3>
              <FiArrowUp className="text-3xl text-red-500" />
            </div>
            <p className="text-4xl font-black text-red-500">
              ₹{totalSpent.toFixed(2)}
            </p>
          </motion.div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div variants={itemVariants}>
          <h3 className="text-2xl font-bold text-dark  mb-4">
            📋 Recent Transactions
          </h3>

          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((txn, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white  p-4 rounded-xl shadow-soft hover:shadow-lg transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        txn.type === 'credit'
                          ? 'bg-green-100 '
                          : 'bg-red-100 '
                      }`}
                    >
                      {txn.type === 'credit' ? (
                        <FiArrowDown className={`text-2xl ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`} />
                      ) : (
                        <FiArrowUp className={`text-2xl text-red-600`} />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-dark ">
                        {txn.description}
                      </p>
                      <p className="text-sm text-gray-500 ">
                        {new Date(txn.date).toLocaleDateString()} -{' '}
                        {new Date(txn.date).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`text-xl font-black ${
                      txn.type === 'credit'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toFixed(2)}
                  </p>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              className="bg-white  p-12 rounded-2xl shadow-soft text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-gray-600  text-lg">
                No transactions yet. Add money to get started! 💳
              </p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WalletPage;
