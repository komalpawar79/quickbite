import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiEdit2, FiLogOut, FiClock, FiCheckCircle, FiXCircle, FiPackage, FiSave, FiX, FiCamera } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useOrderStore from '../store/orderStore';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, logout, isAuthenticated, updateUser } = useAuthStore();
  const { orders, fetchUserOrders, initWebSocket } = useOrderStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    phone: '',
    universityId: '',
    department: '',
    profileImage: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // ✅ Auth Guard - Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // ✅ Fetch orders and init WebSocket on mount
  useEffect(() => {
    if (user) {
      fetchUserOrders();
      initWebSocket();
      setEditData({
        name: user.name || '',
        phone: user.phone || '',
        universityId: user.universityId || '',
        department: user.department || '',
        profileImage: user.profileImage || ''
      });
      setImagePreview(user.profileImage || null);
    }
  }, [user, fetchUserOrders, initWebSocket]);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'badge-warning',
      confirmed: 'badge-info',
      preparing: 'badge-primary',
      ready: 'badge-success',
      completed: 'badge-success',
      cancelled: 'badge-error'
    };
    return colors[status] || 'badge-secondary';
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editData)
      });
      const data = await response.json();
      
      if (data.success) {
        updateUser(data.user);
        setImagePreview(data.user.profileImage || null);
        setEditData({
          name: data.user.name || '',
          phone: data.user.phone || '',
          universityId: data.user.universityId || '',
          department: data.user.department || '',
          profileImage: data.user.profileImage || ''
        });
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      } else {
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Error updating profile');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setEditData({ ...editData, profileImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ If not authenticated, show loading while redirecting
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50  flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600  font-semibold">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50  py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Profile Header */}
          <div className="bg-white  rounded-lg shadow-soft p-8 mb-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                {/* Profile Picture */}
                <div className="relative">
                  <div 
                    onClick={() => (user?.profileImage || imagePreview) && setShowImageModal(true)}
                    className={`w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center ${(user?.profileImage || imagePreview) && 'cursor-pointer hover:opacity-80 transition'}`}
                  >
                    {(isEditing ? imagePreview : user?.profileImage) ? (
                      <img src={isEditing ? imagePreview : user?.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">👤</span>
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full cursor-pointer hover:bg-primary-600 transition">
                      <FiCamera size={16} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-dark  mb-2">{user?.name}</h1>
                  <p className="text-gray-600 ">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
              >
                <FiEdit2 /> {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {/* Profile Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-sm text-gray-600  font-semibold mb-1">Name</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                ) : (
                  <p className="text-lg text-dark  font-semibold">{user?.name}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600  font-semibold mb-1">Phone</p>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <p className="text-lg text-dark  font-semibold">{user?.phone || 'Not set'}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600  font-semibold mb-1">University ID</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.universityId}
                    onChange={(e) => setEditData({ ...editData, universityId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Enter university ID"
                  />
                ) : (
                  <p className="text-lg text-dark  font-semibold">{user?.universityId || 'Not set'}</p>
                )}
              </div>
              {user?.role !== 'canteen_manager' && (
                <div>
                  <p className="text-sm text-gray-600  font-semibold mb-1">Department</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.department}
                      onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Enter department"
                    />
                  ) : (
                    <p className="text-lg text-dark  font-semibold">{user?.department || 'Not set'}</p>
                  )}
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600  font-semibold mb-1">Role</p>
                <p className="text-lg text-dark  font-semibold capitalize">{user?.role}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                  >
                    <FiSave /> Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                  >
                    <FiX /> Cancel
                  </button>
                </>
              ) : null}
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                <FiLogOut /> Logout
              </button>
            </div>
          </div>

          {/* Order History - Only for regular users */}
          {user?.role !== 'canteen_manager' && (
          <motion.div
            className="bg-white  rounded-lg shadow-soft p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-dark ">Recent Orders</h2>
              <button
                onClick={() => navigate('/my-orders')}
                className="text-primary-500 hover:text-primary-600 font-semibold"
              >
                View All →
              </button>
            </div>
            <div className="overflow-x-auto">
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500  mb-4">No orders yet</p>
                  <button
                    onClick={() => navigate('/menu')}
                    className="btn-primary px-6 py-2"
                  >
                    Start Ordering
                  </button>
                </div>
              ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 ">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-dark ">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-dark ">Items</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-dark ">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-dark ">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-dark ">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order._id} className="border-b border-gray-100  hover:bg-gray-50 :bg-gray-700">
                      <td className="px-6 py-4 text-sm text-dark ">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-dark ">
                        {order.items?.map(item => item.menuItem?.name).join(', ') || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-dark  font-semibold">
                        ₹{order.finalAmount}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`badge ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button 
                          onClick={() => navigate('/my-orders')}
                          className="text-primary-500 hover:text-primary-600 font-semibold"
                        >
                          Track
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
            </div>
          </motion.div>
          )}
        </motion.div>

        {/* Image Modal */}
        {showImageModal && (user?.profileImage || imagePreview) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowImageModal(false)}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg overflow-hidden max-w-2xl w-full"
            >
              <div className="relative">
                <img
                  src={user?.profileImage || imagePreview}
                  alt="Profile"
                  className="w-full h-auto max-h-96 object-contain"
                />
                <button
                  onClick={() => setShowImageModal(false)}
                  className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                >
                  <FiX size={24} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
