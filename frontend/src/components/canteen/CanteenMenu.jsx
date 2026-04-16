import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import io from 'socket.io-client';
import useCanteenMenuStore from '../../store/canteenMenuStore';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const CanteenMenu = () => {
  const { user } = useAuthStore();
  const { menuItems, loading, fetchMenu, addItem, updateItem, deleteItem, toggleAvailability } = useCanteenMenuStore();
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'breakfast',
    image: '',
    isAvailable: true
  });

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!user?.canteenId) return;

    const socket = io('http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      socket.emit('join-canteen', user.canteenId);
    });

    socket.on('menu-updated', async () => {
      console.log('🔄 Menu updated event received, refreshing...');
      await fetchMenu(user.canteenId);
      toast.success('Menu updated!', { duration: 2 });
    });

    socket.on('menu-item-added', async () => {
      console.log('➕ Menu item added event received, refreshing...');
      await fetchMenu(user.canteenId);
    });

    socket.on('menu-item-deleted', async () => {
      console.log('❌ Menu item deleted event received, refreshing...');
      await fetchMenu(user.canteenId);
    });

    socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.canteenId, fetchMenu]);

  useEffect(() => {
    if (user?.canteenId) {
      fetchMenu(user.canteenId);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await updateItem(currentId, formData);
        toast.success('Menu item updated!');
      } else {
        await addItem(user.canteenId, formData);
        toast.success('Menu item added!');
      }
      
      // Refresh menu to show latest items
      await fetchMenu(user.canteenId);
      
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error(error.message || 'Failed to save');
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category,
      image: item.image || '',
      isAvailable: item.isAvailable
    });
    setCurrentId(item._id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await deleteItem(id);
      toast.success('Item deleted!');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleAvailability(id);
      toast.success('Availability updated!');
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'breakfast',
      image: '',
      isAvailable: true
    });
    setEditMode(false);
    setCurrentId(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold">Menu Management</h2>
          <p className="text-gray-600 mt-1">Manage your canteen menu items</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }} 
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
        >
          <Plus size={20} />
          Add Menu Item
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : menuItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">No Menu Items Yet</h3>
          <button onClick={() => setShowModal(true)} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
            Add First Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 auto-rows-max">
          {menuItems.map((item) => (
            <div key={item._id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden h-full flex flex-col">
              {/* Image Container */}
              {item.image && (
                <div className="w-full h-40 bg-gray-200 overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
              )}
              
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-green-500 to-blue-500 p-3 text-white flex-shrink-0">
                <h3 className="text-base font-bold line-clamp-1">{item.name}</h3>
                <p className="text-xs capitalize text-green-100">{item.category}</p>
              </div>
              
              {/* Content */}
              <div className="p-3 space-y-2 flex-grow flex flex-col">
                {/* Price */}
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-green-600">Rs.{item.price}</span>
                </div>
                
                {/* Description */}
                {item.description && <p className="text-xs text-gray-600 line-clamp-2">{item.description}</p>}
                
                {/* Availability Button */}
                <button onClick={() => handleToggle(item._id)} className={`w-full px-2 py-1.5 rounded text-sm font-medium transition ${item.isAvailable ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                  {item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                </button>
                
                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button onClick={() => handleEdit(item)} className="flex-1 flex items-center justify-center gap-1 bg-blue-50 text-blue-600 px-2 py-1.5 rounded text-sm hover:bg-blue-100 transition font-medium">
                    <Edit2 size={14} />Edit
                  </button>
                  <button onClick={() => handleDelete(item._id)} className="flex-1 flex items-center justify-center gap-1 bg-red-50 text-red-600 px-2 py-1.5 rounded text-sm hover:bg-red-100 transition font-medium">
                    <Trash2 size={14} />Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-4 flex justify-between items-center rounded-t-xl">
              <h3 className="text-2xl font-bold">{editMode ? 'Edit' : 'Add'} Menu Item</h3>
              <button onClick={() => { setShowModal(false); resetForm(); }}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Item Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Price *</label>
                  <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Category *</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="snacks">Snacks</option>
                    <option value="beverages">Beverages</option>
                    <option value="desserts">Desserts</option>
                    <option value="special">Special</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Image URL</label>
                <input type="url" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="https://example.com/image.jpg" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border rounded-lg" rows="3" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold">
                  {editMode ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="flex-1 border-2 px-6 py-3 rounded-lg hover:bg-gray-50 font-semibold">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanteenMenu;
