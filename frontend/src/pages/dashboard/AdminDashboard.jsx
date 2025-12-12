import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  FiBarChart2,
  FiHome,
  FiUsers,
  FiMapPin,
  FiBriefcase,
  FiCalendar,
  FiSettings,
} from 'react-icons/fi';
import AdminOverview from './admin/AdminOverview';
import ManageHalls from './admin/ManageHalls';
import HallReview from './admin/HallReview';
import ManageServiceProviders from './admin/ManageServiceProviders';
import ServiceProviderReview from './admin/ServiceProviderReview';
import ManageUsers from './admin/ManageUsers';
import ManageBookings from './admin/ManageBookings';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const sidebarItems = [
    { path: '/dashboard/admin', label: 'Overview', icon: <FiBarChart2 size={20} /> },
    { path: '/dashboard/admin/halls', label: 'Manage Halls', icon: <FiMapPin size={20} /> },
    { path: '/dashboard/admin/service-providers', label: 'Service Providers', icon: <FiBriefcase size={20} /> },
    { path: '/dashboard/admin/users', label: 'Manage Users', icon: <FiUsers size={20} /> },
    { path: '/dashboard/admin/bookings', label: 'Manage Bookings', icon: <FiCalendar size={20} /> },
  ];

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await api.get('/admin/analytics');
      setAnalytics(response.data.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems} title="Admin Dashboard">
      <Routes>
        <Route
          index
          element={<AdminOverview analytics={analytics} loading={loading} />}
        />
        <Route path="halls" element={<ManageHalls />} />
        <Route path="halls/:hallId/review" element={<HallReview />} />
        <Route path="service-providers" element={<ManageServiceProviders />} />
        <Route
          path="service-providers/:serviceProviderId/review"
          element={<ServiceProviderReview />}
        />
        <Route path="users" element={<ManageUsers />} />
        <Route path="bookings" element={<ManageBookings />} />
      </Routes>
    </DashboardLayout>
  );
};

export default AdminDashboard;
