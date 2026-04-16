import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [canteens, setCanteens] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'student',
    universityId: '',
    department: '',
    canteenAssigned: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchCanteens();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard/users');
      setUsers(res.data?.users || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchCanteens = async () => {
    try {
      const res = await api.get('/admin/dashboard/canteens');
      setCanteens(res.data?.canteens || []);
    } catch (error) {
      console.error('Error fetching canteens:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting user data:', formData);
      const response = await api.post('/admin/dashboard/users', formData);
      console.log('User created response:', response);
      toast.success('User created successfully!');
      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      console.error('Error response:', error.response);
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'student',
      universityId: '',
      department: '',
      canteenAssigned: ''
    });
  };

  const handleRoleChange = (role) => {
    setFormData({ 
      ...formData, 
      role,
      canteenAssigned: role === 'canteen_manager' ? formData.canteenAssigned : ''
    });
    
    if (role === 'canteen_manager' && canteens.length === 0) {
      fetchCanteens();
    }
  };

  const updateUserStatus = async (id, isActive) => {
    try {
      await api.patch(`/admin/dashboard/users/${id}/status`, { isActive: !isActive });
      toast.success('Status updated!');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold">User Management</h2>
          <p className="text-gray-600 mt-1">Admin-created users only ({users.length} total)</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button 
            onClick={() => { 
              setShowModal(true);
              fetchCanteens();
            }} 
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
          >
            <Plus size={20} />
            Add User
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
        <div className="flex-shrink-0 pt-0.5">
          <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="text-sm text-blue-700">
          <p className="font-semibold">Admin-Created Users Only</p>
          <p className="mt-1">This section shows only users created by admins: <span className="font-medium">Canteen Managers, Staff, Faculty, and Admin accounts</span>. Self-registered students do not appear here.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">No users created yet</p>
          <button 
            onClick={() => { 
              setShowModal(true);
              fetchCanteens();
            }} 
            className="flex items-center justify-center gap-2 mx-auto bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
          >
            <Plus size={20} />
            Create First User
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">University ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Canteen</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4">{user.name}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700">{user.universityId || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700">{user.department || '-'}</span>
                  </td>
                  <td className="px-6 py-4">{user.canteenAssigned?.name || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => updateUserStatus(user._id, user.isActive)}
                      className="text-green-600 hover:text-green-800"
                    >
                      Toggle Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 flex justify-between items-center rounded-t-xl">
              <h3 className="text-2xl font-bold">Add New User</h3>
              <button onClick={() => { setShowModal(false); resetForm(); }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="staff">Staff</option>
                  <option value="canteen_manager">Canteen Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {formData.role === 'canteen_manager' && (
                <div>
                  <label className="block text-sm font-semibold mb-2">Assign Canteen *</label>
                  <select
                    value={formData.canteenAssigned}
                    onChange={(e) => setFormData({ ...formData, canteenAssigned: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Select Canteen</option>
                    {canteens.filter(c => c.isActive).map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {canteens.length === 0 ? 'No canteens found. Please create a canteen first.' : 
                     `${canteens.filter(c => c.isActive).length} active canteen(s) available`}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">University ID {formData.role !== 'canteen_manager' && formData.role !== 'admin' && '*'}</label>
                  <input
                    type="text"
                    value={formData.universityId}
                    onChange={(e) => setFormData({ ...formData, universityId: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required={formData.role !== 'canteen_manager' && formData.role !== 'admin'}
                    placeholder={formData.role === 'canteen_manager' || formData.role === 'admin' ? 'Optional' : 'Required'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold">
                  Create User
                </button>
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="flex-1 border-2 px-6 py-3 rounded-lg hover:bg-gray-50 font-semibold">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
