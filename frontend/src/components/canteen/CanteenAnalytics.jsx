import React, { useEffect } from 'react';
import useCanteenAnalyticsStore from '../../store/canteenAnalyticsStore';
import useAuthStore from '../../store/authStore';

const CanteenAnalytics = () => {
  const { user } = useAuthStore();
  const { kpis, popularItems, loading, error, fetchKPIs, fetchPopularItems } = useCanteenAnalyticsStore();

  useEffect(() => {
    if (user?.canteenId) {
      console.log('🏪 Fetching analytics for canteen:', user.canteenId);
      fetchKPIs(user.canteenId);
      fetchPopularItems(user.canteenId);
    }
  }, [user, fetchKPIs, fetchPopularItems]);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Analytics & Reports</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
          ⚠️ Error: {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-2">Today Orders</div>
          <div className="text-3xl font-bold text-orange-600">{loading ? '...' : kpis?.todayOrders || 0}</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-2">Today Revenue</div>
          <div className="text-3xl font-bold text-green-600">₹{loading ? '...' : kpis?.todayRevenue || 0}</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-2">Total Revenue</div>
          <div className="text-3xl font-bold text-blue-600">₹{loading ? '...' : kpis?.totalRevenue || 0}</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-2">Active Orders</div>
          <div className="text-3xl font-bold text-amber-600">{loading ? '...' : kpis?.activeOrders || 0}</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-2">Completed Orders</div>
          <div className="text-3xl font-bold text-purple-600">{loading ? '...' : kpis?.completedOrders || 0}</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-2">Menu Items</div>
          <div className="text-3xl font-bold text-indigo-600">{loading ? '...' : kpis?.totalMenuItems || 0}</div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Popular Items (Last 7 Days)</h3>
        {loading ? <div className="text-center py-8">Loading...</div> : popularItems.length === 0 ? (
          <div className="text-center py-8 text-gray-600">No data available</div>
        ) : (
          <div className="space-y-4">
            {popularItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">{idx + 1}</div>
                  <div>
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-sm text-gray-600">Rs.{item.price}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-orange-600">{item.totalSold} sold</div>
                  <div className="text-sm text-gray-600">Rs.{item.revenue} revenue</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CanteenAnalytics;
