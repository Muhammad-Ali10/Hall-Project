import { useState, useEffect } from 'react';
import StatCard from '../../../components/dashboard/StatCard';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import { FiCalendar, FiDollarSign, FiTrendingUp, FiStar } from 'react-icons/fi';

const HallAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await api.get('/halls/my/hall/analytics');
      setAnalytics(response.data.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Bookings"
          value={analytics?.bookings?.total || 0}
          icon={FiCalendar}
          color="blue"
        />
        <StatCard
          title="Confirmed"
          value={analytics?.bookings?.confirmed || 0}
          icon={FiCalendar}
          color="green"
        />
        <StatCard
          title="Pending"
          value={analytics?.bookings?.pending || 0}
          icon={FiCalendar}
          color="orange"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${(analytics?.revenue?.total || 0).toLocaleString()}`}
          icon={FiDollarSign}
          color="purple"
        />
      </div>

      {/* Monthly Revenue */}
      {analytics?.revenue?.byMonth && analytics.revenue.byMonth.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Revenue</h2>
          <div className="space-y-2">
            {analytics.revenue.byMonth.map((month) => (
              <div key={month._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">Month {month._id}</span>
                <span className="font-semibold text-orange-600">₹{month.total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popular Dates */}
      {analytics?.popularDates && analytics.popularDates.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Popular Dates</h2>
          <div className="space-y-2">
            {analytics.popularDates.map((date, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">{date._id}</span>
                <span className="font-semibold text-orange-600">{date.count} bookings</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HallAnalytics;

