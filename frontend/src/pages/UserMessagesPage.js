import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiSend } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const UserMessagesPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Get user email from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.email) {
      setUserEmail(user.email);
      fetchUserMessages(user.email);
    } else {
      toast.error('Please login to view your messages');
      navigate('/login');
    }
  }, [navigate]);

  const fetchUserMessages = async (email) => {
    try {
      setLoading(true);
      const res = await api.get('/messages/user/my-messages', { params: { email } });
      console.log('User messages response:', res);
      setMessages(res.data?.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load your messages');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'read':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'replied':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new':
        return '🆕';
      case 'read':
        return '👁️';
      case 'replied':
        return '💬';
      default:
        return '📨';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-green-600 hover:text-green-800 font-semibold mb-4 transition"
          >
            <FiArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Messages</h1>
          <p className="text-gray-600">Track your inquiries and check admin replies</p>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="inline-block mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
            <p className="text-gray-600 text-lg">Loading your messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No messages yet</h2>
            <p className="text-gray-600 mb-6">You haven't sent any messages. Contact us anytime from our Contact page!</p>
            <button
              onClick={() => navigate('/contact')}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              Go to Contact
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Messages List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                  <h2 className="text-white font-bold text-lg">Your Messages ({messages.length})</h2>
                </div>
                <div className="divide-y">
                  {messages.map((msg) => (
                    <div
                      key={msg._id}
                      onClick={() => setSelectedMessage(msg)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition border-l-4 ${
                        selectedMessage?._id === msg._id
                          ? 'border-l-green-600 bg-green-50'
                          : 'border-l-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">{getStatusIcon(msg.status)}</span>
                            <h3 className="font-bold text-gray-900">{msg.subject}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(msg.status)}`}>
                              {msg.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{msg.message.substring(0, 60)}...</p>
                          <p className="text-xs text-gray-400">
                            {new Date(msg.createdAt).toLocaleDateString()} {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Message Detail */}
            {selectedMessage ? (
              <div className="bg-white rounded-lg shadow-lg p-6 h-fit sticky top-4">
                <div className="mb-6">
                  <div className="inline-block mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(selectedMessage.status)}`}>
                      {selectedMessage.status === 'replied'
                        ? '✅ Admin Replied'
                        : selectedMessage.status === 'read'
                        ? '👁️ Read by Admin'
                        : '⏳ Pending'}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedMessage.subject}</h3>
                  <p className="text-sm text-gray-500">
                    Sent: {new Date(selectedMessage.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="pb-6 border-b mb-6">
                  <p className="text-gray-700 leading-relaxed">{selectedMessage.message}</p>
                </div>

                {/* Contact Info */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Your Details</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700">
                      <span className="font-semibold">📧 Email:</span> {selectedMessage.email}
                    </p>
                    {selectedMessage.phone && (
                      <p className="text-gray-700">
                        <span className="font-semibold">📱 Phone:</span> {selectedMessage.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Admin Reply */}
                {selectedMessage.status === 'replied' && selectedMessage.reply ? (
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-green-900 mb-2">💬 Reply from Admin</p>
                    <p className="text-gray-800 leading-relaxed mb-3">{selectedMessage.reply}</p>
                    {selectedMessage.repliedAt && (
                      <p className="text-xs text-green-700">
                        Replied: {new Date(selectedMessage.repliedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                ) : selectedMessage.status === 'read' ? (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-900 mb-2">👁️ Under Review</p>
                    <p className="text-gray-700">Your message has been received and is being reviewed by our team. We'll get back to you soon!</p>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-yellow-900 mb-2">⏳ Pending Review</p>
                    <p className="text-gray-700">Your message is in queue. Our team will review it shortly.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center lg:col-span-1 h-fit">
                <p className="text-gray-500 text-lg">👈 Select a message to view details</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserMessagesPage;
