import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import {
  FiHome,
  FiEdit3,
  FiImage,
  FiDollarSign,
  FiCalendar,
  FiBarChart2,
  FiUser,
  FiSettings,
} from 'react-icons/fi';
import HallOverview from './hall/HallOverview';
import EditHall from './hall/EditHall';
import ManageMedia from './hall/ManageMedia';
import ManagePricing from './hall/ManagePricing';
import ManageBookings from './hall/ManageBookings';
import ManageAvailability from './hall/ManageAvailability';
import HallAnalytics from './hall/HallAnalytics';
import HallProfile from './hall/HallProfile';
import ChangePassword from './hall/ChangePassword';

const HallDashboard = () => {
  const sidebarItems = [
    { path: '/dashboard/hall', label: 'Overview', icon: <FiHome size={20} /> },
    { path: '/dashboard/hall/edit', label: 'Edit Hall', icon: <FiEdit3 size={20} /> },
    { path: '/dashboard/hall/media', label: 'Media', icon: <FiImage size={20} /> },
    { path: '/dashboard/hall/pricing', label: 'Pricing & Capacity', icon: <FiDollarSign size={20} /> },
    { path: '/dashboard/hall/availability', label: 'Availability', icon: <FiCalendar size={20} /> },
    { path: '/dashboard/hall/bookings', label: 'Bookings', icon: <FiCalendar size={20} /> },
    { path: '/dashboard/hall/analytics', label: 'Analytics', icon: <FiBarChart2 size={20} /> },
    { path: '/dashboard/hall/profile', label: 'Profile', icon: <FiUser size={20} /> },
    { path: '/dashboard/hall/password', label: 'Change Password', icon: <FiSettings size={20} /> },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} title="Hall Dashboard">
      <Routes>
        <Route index element={<HallOverview />} />
        <Route path="edit" element={<EditHall />} />
        <Route path="media" element={<ManageMedia />} />
        <Route path="pricing" element={<ManagePricing />} />
        <Route path="availability" element={<ManageAvailability />} />
        <Route path="bookings" element={<ManageBookings />} />
        <Route path="analytics" element={<HallAnalytics />} />
        <Route path="profile" element={<HallProfile />} />
        <Route path="password" element={<ChangePassword />} />
      </Routes>
    </DashboardLayout>
  );
};

export default HallDashboard;
