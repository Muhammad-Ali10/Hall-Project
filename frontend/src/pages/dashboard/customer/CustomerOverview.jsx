import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../../../components/dashboard/StatCard';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import { FiCalendar, FiHeart, FiBell } from 'react-icons/fi';

const CustomerOverview = () => {
  const [stats, setStats] = useState({
    bookings: 0,
    favorites: 0,
    notifications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [bookingsRes] = await Promise.all([
        api.get('/bookings/customer/my'),
      ]);
      setStats({
        bookings: bookingsRes.data.data?.length || 0,
        favorites: 0, // Would need favorites endpoint
        notifications: 0, // Would need notifications endpoint
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
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
      <h1 className="text-3xl font-bold text-gray-900">Welcome Back!</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="My Bookings"
          value={stats.bookings}
          icon={FiCalendar}
          color="blue"
        />
        <StatCard
          title="Favorites"
          value={stats.favorites}
          icon={FiHeart}
          color="orange"
        />
        <StatCard
          title="Notifications"
          value={stats.notifications}
          icon={FiBell}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/dashboard/customer/bookings"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <FiCalendar className="text-orange-600 mb-3" size={32} />
          <h3 className="font-semibold text-gray-900 mb-1">View Bookings</h3>
          <p className="text-sm text-gray-600">Manage your hall bookings</p>
        </Link>
        <Link
          to="/dashboard/customer/favorites"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <FiHeart className="text-orange-600 mb-3" size={32} />
          <h3 className="font-semibold text-gray-900 mb-1">Favorites</h3>
          <p className="text-sm text-gray-600">View your favorite halls</p>
        </Link>
      </div>
    </div>
  );
};

export default CustomerOverview;

