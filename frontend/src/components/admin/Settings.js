import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle, Settings as SettingsIcon, User, Clock, Menu, Shield } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);

  // Admin Profile
  const [profileForm, setProfileForm] = useState({
    adminProfile: {
      name: 'Admin',
      email: '',
      mobile: '',
      profilePicture: ''
    }
  });

  // Operating Hours
  const [hoursForm, setHoursForm] = useState({
    operatingHours: {
      opening: '09:00',
      closing: '22:00',
      operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }
  });

  // Menu Settings
  const [menuForm, setMenuForm] = useState({
    menuSettings: {
      itemsEnabled: true,
      allowPriceChange: true,
      categories: ['Food', 'Beverage', 'Snacks', 'Desserts']
    }
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard/settings');
      const data = res.data?.settings;
      
      if (data) {
        setSettings(data);
        setProfileForm({ adminProfile: data.adminProfile || { name: 'Admin', email: '', mobile: '', profilePicture: '' } });
        setHoursForm({ operatingHours: data.operatingHours || { opening: '09:00', closing: '22:00', operatingDays: days } });
        setMenuForm({ menuSettings: data.menuSettings || { itemsEnabled: true, allowPriceChange: true, categories: ['Food', 'Beverage', 'Snacks', 'Desserts'] } });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      await api.put('/admin/dashboard/settings', profileForm);
      toast.success('Profile updated successfully');
      fetchSettings();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const saveHours = async () => {
    try {
      setSaving(true);
      await api.put('/admin/dashboard/settings', hoursForm);
      toast.success('Operating hours updated successfully');
      fetchSettings();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Failed to save operating hours');
    } finally {
      setSaving(false);
    }
  };

  const saveMenuSettings = async () => {
    try {
      setSaving(true);
      await api.put('/admin/dashboard/settings', menuForm);
      toast.success('Menu settings updated successfully');
      fetchSettings();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Failed to save menu settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <SettingsIcon size={32} className="text-green-600" />
            Settings
          </h1>
          <p className="text-gray-600 mt-2">Manage your admin profile, restaurant settings, and system configuration</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'profile', label: 'Admin Profile', icon: User },
            { id: 'hours', label: 'Operating Hours', icon: Clock },
            { id: 'menu', label: 'Menu Settings', icon: Menu }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Admin Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <User size={28} className="text-green-600" />
              Admin Profile Settings
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={profileForm.adminProfile.name}
                  onChange={(e) => setProfileForm({
                    adminProfile: { ...profileForm.adminProfile, name: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={profileForm.adminProfile.email}
                  onChange={(e) => setProfileForm({
                    adminProfile: { ...profileForm.adminProfile, email: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                <input
                  type="tel"
                  value={profileForm.adminProfile.mobile}
                  onChange={(e) => setProfileForm({
                    adminProfile: { ...profileForm.adminProfile, mobile: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture URL</label>
                <input
                  type="url"
                  value={profileForm.adminProfile.profilePicture}
                  onChange={(e) => setProfileForm({
                    adminProfile: { ...profileForm.adminProfile, profilePicture: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  placeholder="https://example.com/profile.jpg"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  <Save size={20} />
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Operating Hours Tab */}
        {activeTab === 'hours' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Clock size={28} className="text-green-600" />
              Operating Hours
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Opening Time</label>
                  <input
                    type="time"
                    value={hoursForm.operatingHours.opening}
                    onChange={(e) => setHoursForm({
                      operatingHours: { ...hoursForm.operatingHours, opening: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Closing Time</label>
                  <input
                    type="time"
                    value={hoursForm.operatingHours.closing}
                    onChange={(e) => setHoursForm({
                      operatingHours: { ...hoursForm.operatingHours, closing: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Operating Days</label>
                <div className="grid grid-cols-2 gap-3">
                  {days.map(day => (
                    <label key={day} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={hoursForm.operatingHours.operatingDays.includes(day)}
                        onChange={(e) => {
                          const newDays = e.target.checked
                            ? [...hoursForm.operatingHours.operatingDays, day]
                            : hoursForm.operatingHours.operatingDays.filter(d => d !== day);
                          setHoursForm({
                            operatingHours: { ...hoursForm.operatingHours, operatingDays: newDays }
                          });
                        }}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={saveHours}
                  disabled={saving}
                  className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  <Save size={20} />
                  {saving ? 'Saving...' : 'Save Operating Hours'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Menu Settings Tab */}
        {activeTab === 'menu' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Menu size={28} className="text-green-600" />
              Menu Settings
            </h2>

            <div className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="itemsEnabled"
                  checked={menuForm.menuSettings.itemsEnabled}
                  onChange={(e) => setMenuForm({
                    menuSettings: { ...menuForm.menuSettings, itemsEnabled: e.target.checked }
                  })}
                  className="w-5 h-5 text-green-600 rounded"
                />
                <label htmlFor="itemsEnabled" className="text-sm font-medium text-gray-700">
                  Enable Menu Items
                </label>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="allowPrice"
                  checked={menuForm.menuSettings.allowPriceChange}
                  onChange={(e) => setMenuForm({
                    menuSettings: { ...menuForm.menuSettings, allowPriceChange: e.target.checked }
                  })}
                  className="w-5 h-5 text-green-600 rounded"
                />
                <label htmlFor="allowPrice" className="text-sm font-medium text-gray-700">
                  Allow Price Changes
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Menu Categories</label>
                <div className="space-y-2">
                  {menuForm.menuSettings.categories.map((category, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => {
                          const newCategories = [...menuForm.menuSettings.categories];
                          newCategories[idx] = e.target.value;
                          setMenuForm({
                            menuSettings: { ...menuForm.menuSettings, categories: newCategories }
                          });
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      />
                      <button
                        onClick={() => {
                          const newCategories = menuForm.menuSettings.categories.filter((_, i) => i !== idx);
                          setMenuForm({
                            menuSettings: { ...menuForm.menuSettings, categories: newCategories }
                          });
                        }}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setMenuForm({
                    menuSettings: { ...menuForm.menuSettings, categories: [...menuForm.menuSettings.categories, 'New Category'] }
                  })}
                  className="mt-4 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition font-medium"
                >
                  Add Category
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={saveMenuSettings}
                  disabled={saving}
                  className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  <Save size={20} />
                  {saving ? 'Saving...' : 'Save Menu Settings'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
