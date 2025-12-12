import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../../../components/dashboard/StatCard';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import {
  FiCalendar,
  FiDollarSign,
  FiTrendingUp,
  FiAlertCircle,
  FiEdit3,
  FiImage,
} from 'react-icons/fi';

const HallOverview = () => {
  const [hall, setHall] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [hallRes, analyticsRes] = await Promise.all([
        api.get('/halls/my/hall'),
        api.get('/halls/my/hall/analytics'),
      ]);
      setHall(hallRes.data.data);
      setAnalytics(analyticsRes.data.data);
    } catch (error) {
      toast.error('Failed to load data');
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

  if (!hall) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 text-center">
        <p className="text-gray-500 text-lg mb-4">No hall found</p>
        <Link
          to="/hall/register"
          className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 font-semibold"
        >
          Register Your Hall
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hall Info Card */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{hall.name}</h1>
            <p className="text-gray-600 mb-4">{hall.address?.fullAddress}</p>
            <div className="flex items-center space-x-6">
              {hall.capacity && (
                <div>
                  <p className="text-sm text-gray-500">Capacity</p>
                  <p className="font-semibold text-gray-900">{hall.capacity} people</p>
                </div>
              )}
              {hall.price && (
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-semibold text-gray-900">₹{hall.price.toLocaleString()}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Rating</p>
                <p className="font-semibold text-gray-900">
                  {hall.rating?.average?.toFixed(1) || '0.0'} ⭐
                </p>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Link
              to="/dashboard/hall/edit"
              className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 font-semibold"
            >
              <FiEdit3 size={18} />
              <span>Edit</span>
            </Link>
            <Link
              to="/dashboard/hall/media"
              className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-semibold"
            >
              <FiImage size={18} />
              <span>Media</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Bookings"
            value={analytics.bookings?.total || 0}
            icon={FiCalendar}
            color="blue"
          />
          <StatCard
            title="Confirmed"
            value={analytics.bookings?.confirmed || 0}
            icon={FiCalendar}
            color="green"
          />
          <StatCard
            title="Pending"
            value={analytics.bookings?.pending || 0}
            icon={FiAlertCircle}
            color="orange"
          />
          <StatCard
            title="Total Revenue"
            value={`₹${(analytics.revenue?.total || 0).toLocaleString()}`}
            icon={FiDollarSign}
            color="purple"
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/dashboard/hall/bookings"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <FiCalendar className="text-orange-600 mb-3" size={32} />
          <h3 className="font-semibold text-gray-900 mb-1">Manage Bookings</h3>
          <p className="text-sm text-gray-600">View and manage all bookings</p>
        </Link>
        <Link
          to="/dashboard/hall/analytics"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <FiTrendingUp className="text-orange-600 mb-3" size={32} />
          <h3 className="font-semibold text-gray-900 mb-1">View Analytics</h3>
          <p className="text-sm text-gray-600">Track performance and revenue</p>
        </Link>
        <Link
          to="/dashboard/hall/pricing"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <FiDollarSign className="text-orange-600 mb-3" size={32} />
          <h3 className="font-semibold text-gray-900 mb-1">Update Pricing</h3>
          <p className="text-sm text-gray-600">Set capacity and pricing</p>
        </Link>
      </div>
    </div>
  );
};

export default HallOverview;

