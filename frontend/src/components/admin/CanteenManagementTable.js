import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Check, Eye } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CanteenManagementTable = () => {
  const [canteens, setCanteens] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    location: { building: '', floor: '' },
    description: '',
    operatingHours: { open: '08:00', close: '20:00', daysOpen: [] },
    cuisines: [],
    isActive: true
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchCanteens();
  }, [page, searchTerm]);

  const fetchCanteens = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/dashboard/canteens?page=${page}&limit=20`);
      const canteensList = res.data?.canteens || [];
      setCanteens(canteensList);
      setTotalPages(res.data?.pages || 1);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch canteens');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      location: { building: '', floor: '' },
      description: '',
      operatingHours: { open: '08:00', close: '20:00', daysOpen: [] },
      cuisines: [],
      isActive: true
    });
    setShowModal(true);
  };

  const handleEdit = (canteen) => {
    setEditingId(canteen._id);
    setFormData({
      name: canteen.name || '',
      location: canteen.location || { building: '', floor: '' },
      description: canteen.description || '',
      operatingHours: canteen.operatingHours || { open: '08:00', close: '20:00', daysOpen: [] },
      cuisines: canteen.cuisines || [],
      isActive: canteen.isActive !== false
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name) {
        toast.error('Canteen name is required');
        return;
      }

      if (editingId) {
        // Update
        await api.patch(`/admin/dashboard/canteens/${editingId}`, formData);
        toast.success('Canteen updated successfully!');
      } else {
        // Create
        await api.post('/admin/dashboard/canteens', formData);
        toast.success('Canteen created successfully!');
      }
      setShowModal(false);
      fetchCanteens();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Failed to save canteen');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this canteen?')) {
      try {
        await api.delete(`/admin/dashboard/canteens/${id}`);
        toast.success('Canteen deleted successfully!');
        fetchCanteens();
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to delete canteen');
      }
    }
  };

  const toggleStatus = async (id, status) => {
    try {
      await api.patch(`/admin/dashboard/canteens/${id}/status`, { isActive: !status });
      toast.success('Status updated!');
      fetchCanteens();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredCanteens = canteens.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.location?.building?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold">Canteen Management</h2>
          <p className="text-gray-600 mt-1">Manage all campus canteens</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
        >
          <Plus size={20} />
          Add Canteen
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search canteens by name or building..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
        />
      </div>

      {/* Canteens Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : filteredCanteens.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Hours</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Rating</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCanteens.map((canteen) => (
                    <tr key={canteen._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{canteen.name}</p>
                          <p className="text-sm text-gray-500">{canteen.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{canteen.location?.building}</p>
                          <p className="text-gray-500">Floor: {canteen.location?.floor || '-'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900">{canteen.operatingHours?.open} - {canteen.operatingHours?.close}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            <span className="font-medium text-gray-900">{(canteen.avgRating || 0).toFixed(1)}</span>
                            <span className="text-gray-500">({canteen.totalRatings || 0})</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleStatus(canteen._id, canteen.isActive)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                            canteen.isActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {canteen.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleEdit(canteen)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(canteen._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <p className="text-sm text-gray-600">{filteredCanteens.length} canteens</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center h-64 text-gray-500">
            <p>No canteens found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">
                {editingId ? 'Edit Canteen' : 'Add New Canteen'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Canteen Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                />
              </div>

              {/* Location */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Building</label>
                  <input
                    type="text"
                    value={formData.location.building}
                    onChange={(e) => setFormData({
                      ...formData,
                      location: { ...formData.location, building: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Floor</label>
                  <input
                    type="text"
                    value={formData.location.floor}
                    onChange={(e) => setFormData({
                      ...formData,
                      location: { ...formData.location, floor: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                />
              </div>

              {/* Operating Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Operating Hours</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-600">Opening Time</label>
                    <input
                      type="time"
                      value={formData.operatingHours.open}
                      onChange={(e) => setFormData({
                        ...formData,
                        operatingHours: { ...formData.operatingHours, open: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Closing Time</label>
                    <input
                      type="time"
                      value={formData.operatingHours.close}
                      onChange={(e) => setFormData({
                        ...formData,
                        operatingHours: { ...formData.operatingHours, close: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    />
                  </div>
                </div>

                <label className="block text-xs text-gray-600 mt-3 mb-2">Operating Days</label>
                <div className="grid grid-cols-4 gap-2">
                  {days.map(day => (
                    <label key={day} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.operatingHours.daysOpen?.includes(day)}
                        onChange={(e) => {
                          const newDays = e.target.checked
                            ? [...(formData.operatingHours.daysOpen || []), day]
                            : (formData.operatingHours.daysOpen || []).filter(d => d !== day);
                          setFormData({
                            ...formData,
                            operatingHours: { ...formData.operatingHours, daysOpen: newDays }
                          });
                        }}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                      <span className="text-xs text-gray-700">{day.slice(0, 3)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-green-600 rounded"
                />
                <label htmlFor="active" className="text-sm font-medium text-gray-700">
                  Active / Open
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
                >
                  <Check size={20} />
                  {editingId ? 'Update Canteen' : 'Create Canteen'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
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

export default CanteenManagementTable;
