import React, { useState, useEffect } from 'react';
import { Plus, Edit, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../../services/api';

const CanteenManagement = () => {
  const [canteens, setCanteens] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', location: {}, operatingHours: {} });

  useEffect(() => {
    fetchCanteens();
  }, []);

  const fetchCanteens = async () => {
    try {
      const res = await api.get('/admin/dashboard/canteens');
      console.log('Canteens response:', res.data);
      setCanteens(res.data?.canteens || []);
    } catch (error) {
      console.error('Error fetching canteens:', error);
      setCanteens([]);
    }
  };

  const toggleStatus = async (id, status) => {
    try {
      await api.patch(`/admin/dashboard/canteens/${id}/status`, { isActive: !status });
      fetchCanteens();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/dashboard/canteens', formData);
      setShowModal(false);
      fetchCanteens();
      setFormData({ name: '', location: {}, operatingHours: {} });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Canteen Management</h2>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          <Plus size={20} />
          Add Canteen
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {canteens.map((canteen) => (
          <div key={canteen._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold">{canteen.name}</h3>
                <p className="text-gray-500 text-sm">{canteen.location?.building}</p>
              </div>
              <button onClick={() => toggleStatus(canteen._id, canteen.isActive)}>
                {canteen.isActive ? <ToggleRight className="text-green-600" size={32} /> : <ToggleLeft className="text-gray-400" size={32} />}
              </button>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Manager:</span>
                <span className="font-medium">{canteen.manager?.name || 'Not assigned'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rating:</span>
                <span className="font-medium">⭐ {canteen.avgRating?.toFixed(1) || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${canteen.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {canteen.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <button className="w-full mt-4 flex items-center justify-center gap-2 border border-green-600 text-green-600 px-4 py-2 rounded-lg hover:bg-green-50">
              <Edit size={16} />
              Edit Details
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">Add New Canteen</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Canteen Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Building</label>
                <input
                  type="text"
                  value={formData.location.building || ''}
                  onChange={(e) => setFormData({ ...formData, location: { ...formData.location, building: e.target.value } })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                  Create
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border px-4 py-2 rounded-lg hover:bg-gray-50">
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

export default CanteenManagement;
