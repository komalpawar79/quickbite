import React, { useEffect, useState } from 'react';
import useCanteenSettingsStore from '../../store/canteenSettingsStore';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const CanteenSettings = () => {
  const { user } = useAuthStore();
  const { canteen, loading, fetchSettings, updateSchedule, toggleStatus } = useCanteenSettingsStore();
  const [schedule, setSchedule] = useState({ open: '08:00', close: '20:00', daysOpen: [] });
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    if (user?.canteenId) {
      fetchSettings(user.canteenId);
    }
  }, [user]);

  useEffect(() => {
    if (canteen?.operatingHours) {
      setSchedule(canteen.operatingHours);
    }
  }, [canteen]);

  const handleScheduleUpdate = async () => {
    try {
      await updateSchedule(user.canteenId, schedule);
      toast.success('Schedule updated!');
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const handleToggleStatus = async () => {
    try {
      await toggleStatus(user.canteenId);
      toast.success('Status updated!');
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Canteen Settings</h2>
      {loading ? <div className="text-center py-12">Loading...</div> : (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Canteen Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Name</label>
                <div className="font-semibold">{canteen?.name}</div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Location</label>
                <div className="font-semibold">{canteen?.location?.building}, {canteen?.location?.floor}</div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Status</label>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${canteen?.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {canteen?.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button onClick={handleToggleStatus} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    {canteen?.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Operating Hours</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Opening Time</label>
                  <input type="time" value={schedule.open} onChange={(e) => setSchedule({ ...schedule, open: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Closing Time</label>
                  <input type="time" value={schedule.close} onChange={(e) => setSchedule({ ...schedule, close: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Operating Days</label>
                <div className="grid grid-cols-4 gap-2">
                  {days.map(day => (
                    <label key={day} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={schedule.daysOpen?.includes(day)} onChange={(e) => {
                        const newDays = e.target.checked ? [...(schedule.daysOpen || []), day] : schedule.daysOpen.filter(d => d !== day);
                        setSchedule({ ...schedule, daysOpen: newDays });
                      }} className="rounded" />
                      <span className="text-sm">{day.slice(0, 3)}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button onClick={handleScheduleUpdate} className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold">
                Update Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanteenSettings;
