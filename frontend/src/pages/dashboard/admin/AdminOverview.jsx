import { useEffect, useState } from 'react';
import StatCard from '../../../components/dashboard/StatCard';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import {
  FiUsers,
  FiMapPin,
  FiCalendar,
  FiDollarSign,
  FiTrendingUp,
  FiAlertCircle,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

const AdminOverview = ({ analytics, loading }) => {
  const [pendingHalls, setPendingHalls] = useState([]);
  const [pendingServiceProviders, setPendingServiceProviders] = useState([]);

  useEffect(() => {
    loadPendingItems();
  }, []);

  const loadPendingItems = async () => {
    try {
      const [hallsRes, spRes] = await Promise.all([
        api.get('/admin/hall-owners?status=pending&limit=5'),
        api.get('/admin/service-providers?status=inactive&limit=5'),
      ]);
      setPendingHalls(Array.isArray(hallsRes.data?.data) ? hallsRes.data.data : []);
      setPendingServiceProviders(Array.isArray(spRes.data?.data) ? spRes.data.data : []);
    } catch (error) {
      console.error('Failed to load pending items:', error);
      setPendingHalls([]);
      setPendingServiceProviders([]);
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
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={analytics?.users?.total || 0}
          icon={FiUsers}
          color="blue"
          trend={{
            value: analytics?.users?.customers || 0,
            label: 'customers',
            type: 'up',
          }}
        />
        <StatCard
          title="Total Halls"
          value={analytics?.halls?.total || 0}
          icon={FiMapPin}
          color="orange"
          trend={{
            value: analytics?.halls?.active || 0,
            label: 'active',
            type: 'up',
          }}
        />
        <StatCard
          title="Total Bookings"
          value={analytics?.bookings?.total || 0}
          icon={FiCalendar}
          color="green"
          trend={{
            value: analytics?.bookings?.pending || 0,
            label: 'pending',
            type: 'up',
          }}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${(analytics?.revenue?.total || 0).toLocaleString()}`}
          icon={FiDollarSign}
          color="purple"
        />
      </div>

      {/* Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Halls */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Pending Hall Approvals</h2>
            <Link
              to="/dashboard/admin/halls?status=pending"
              className="text-orange-600 hover:text-orange-700 font-medium text-sm"
            >
              View All
            </Link>
          </div>
          {!Array.isArray(pendingHalls) || pendingHalls.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No pending approvals</p>
          ) : (
            <div className="space-y-3">
              {pendingHalls.map((owner) => (
                <Link
                  key={owner._id}
                  to={`/dashboard/admin/halls/${owner.hall?._id}/review`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{owner.hall?.name || 'N/A'}</p>
                      <p className="text-sm text-gray-600">{owner.email}</p>
                    </div>
                    <FiAlertCircle className="text-orange-500" size={20} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Pending Service Providers */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Pending Service Providers</h2>
            <Link
              to="/dashboard/admin/service-providers?status=inactive"
              className="text-orange-600 hover:text-orange-700 font-medium text-sm"
            >
              View All
            </Link>
          </div>
          {!Array.isArray(pendingServiceProviders) || pendingServiceProviders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No pending approvals</p>
          ) : (
            <div className="space-y-3">
              {pendingServiceProviders.map((sp) => (
                <Link
                  key={sp._id}
                  to={`/dashboard/admin/service-providers/${sp._id}/review`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{sp.businessName}</p>
                      <p className="text-sm text-gray-600 capitalize">{sp.category}</p>
                    </div>
                    <FiAlertCircle className="text-orange-500" size={20} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;

