import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, X } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CanteenManagementFull = () => {
  const [canteens, setCanteens] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: { building: '', floor: '' },
    description: '',
    operatingHours: { open: '08:00', close: '20:00', daysOpen: [] },
    cuisines: [],
    isActive: true
  });

  useEffect(() => {
    fetchCanteens();
  }, []);

  const fetchCanteens = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard/canteens');
      console.log('Fetch response:', res.data);
      const canteensList = res.data?.canteens || [];
      console.log('Canteens list:', canteensList);
      setCanteens(canteensList);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch canteens');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/admin/dashboard/canteens', formData);
      console.log('Create response:', response.data);
      
      // Add the new canteen to the list immediately
      const newCanteen = response.data.data?.canteen || response.data.canteen;
      if (newCanteen) {
        setCanteens(prev => [newCanteen, ...prev]);
      }
      
      toast.success('Canteen created successfully!');
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating canteen:', error);
      toast.error(error.response?.data?.message || 'Failed to create canteen');
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

  const resetForm = () => {
    setFormData({
      name: '',
      location: { building: '', floor: '' },
      description: '',
      operatingHours: { open: '08:00', close: '20:00', daysOpen: [] },
      cuisines: [],
      isActive: true
    });
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold">Canteen Management</h2>
          <p className="text-gray-600 mt-1">Manage all campus canteens</p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
        >
          <Plus size={20} />
          Add Canteen
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading canteens...</p>
        </div>
      ) : canteens.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-6xl mb-4">🏪</div>
          <h3 className="text-xl font-semibold mb-2">No Canteens Yet</h3>
          <p className="text-gray-600 mb-4">Create your first canteen to get started</p>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Add First Canteen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {canteens.filter(c => c.isActive).map((canteen) => (
            <div key={canteen._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">{canteen.name}</h3>
                    <p className="text-sm opacity-90">{canteen.location?.building}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    canteen.isActive ? 'bg-green-500' : 'bg-gray-500'
                  }`}>
                    {canteen.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">📍 Location:</span>
                  <span className="font-medium">{canteen.location?.building || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">👨‍💼 Manager:</span>
                  <span className="font-medium">{canteen.manager?.name || 'Not assigned'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">⭐ Rating:</span>
                  <span className="font-medium">{canteen.avgRating?.toFixed(1) || '0.0'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">🕐 Hours:</span>
                  <span className="font-medium">
                    {canteen.operatingHours?.open || '08:00'} - {canteen.operatingHours?.close || '20:00'}
                  </span>
                </div>

                <div className="pt-3 border-t flex gap-2">
                  <button 
                    onClick={() => setViewModal(canteen)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button 
                    onClick={() => toggleStatus(canteen._id, canteen.isActive)}
                    className={`flex-1 px-3 py-2 rounded-lg transition ${
                      canteen.isActive 
                        ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {canteen.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Canteen Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold">Add New Canteen</h3>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Canteen Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Main Canteen"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Building</label>
                  <input
                    type="text"
                    value={formData.location.building}
                    onChange={(e) => setFormData({ ...formData, location: { ...formData.location, building: e.target.value } })}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="e.g., Central Campus"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Floor</label>
                  <input
                    type="text"
                    value={formData.location.floor}
                    onChange={(e) => setFormData({ ...formData, location: { ...formData.location, floor: e.target.value } })}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="e.g., Ground Floor"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="3"
                  placeholder="Brief description of the canteen"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Opening Time</label>
                  <input
                    type="time"
                    value={formData.operatingHours.open}
                    onChange={(e) => setFormData({ ...formData, operatingHours: { ...formData.operatingHours, open: e.target.value } })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Closing Time</label>
                  <input
                    type="time"
                    value={formData.operatingHours.close}
                    onChange={(e) => setFormData({ ...formData, operatingHours: { ...formData.operatingHours, close: e.target.value } })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Operating Days</label>
                <div className="grid grid-cols-4 gap-2">
                  {days.map(day => (
                    <label key={day} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.operatingHours.daysOpen?.includes(day)}
                        onChange={(e) => {
                          const newDays = e.target.checked
                            ? [...(formData.operatingHours.daysOpen || []), day]
                            : formData.operatingHours.daysOpen.filter(d => d !== day);
                          setFormData({ ...formData, operatingHours: { ...formData.operatingHours, daysOpen: newDays } });
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{day.slice(0, 3)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold">
                  Create Canteen
                </button>
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="flex-1 border-2 px-6 py-3 rounded-lg hover:bg-gray-50 font-semibold">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold">{viewModal.name}</h3>
              <button onClick={() => setViewModal(null)} className="text-white hover:text-gray-200">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Building</p>
                  <p className="font-semibold">{viewModal.location?.building || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Floor</p>
                  <p className="font-semibold">{viewModal.location?.floor || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Description</p>
                <p className="font-medium">{viewModal.description || 'No description'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Opening Time</p>
                  <p className="font-semibold">{viewModal.operatingHours?.open || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Closing Time</p>
                  <p className="font-semibold">{viewModal.operatingHours?.close || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Operating Days</p>
                <div className="flex flex-wrap gap-2">
                  {viewModal.operatingHours?.daysOpen?.map(day => (
                    <span key={day} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      {day}
                    </span>
                  )) || <span className="text-gray-500">Not specified</span>}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Cuisines</p>
                <div className="flex flex-wrap gap-2">
                  {viewModal.cuisines?.map((cuisine, i) => (
                    <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                      {cuisine}
                    </span>
                  )) || <span className="text-gray-500">Not specified</span>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">{viewModal.avgRating?.toFixed(1) || '0.0'}</p>
                  <p className="text-sm text-gray-600">Rating</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">{viewModal.totalRatings || 0}</p>
                  <p className="text-sm text-gray-600">Reviews</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className={`text-2xl font-bold ${viewModal.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {viewModal.isActive ? '✓' : '✗'}
                  </p>
                  <p className="text-sm text-gray-600">Status</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanteenManagementFull;
