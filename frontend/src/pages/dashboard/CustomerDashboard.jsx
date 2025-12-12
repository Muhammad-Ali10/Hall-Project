import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import {
  FiHome,
  FiCalendar,
  FiHeart,
  FiBell,
  FiUser,
  FiSettings,
} from 'react-icons/fi';
import CustomerOverview from './customer/CustomerOverview';
import BookingHistory from './customer/BookingHistory';
import Favorites from './customer/Favorites';
import Notifications from './customer/Notifications';
import CustomerProfile from './customer/CustomerProfile';
import ChangePasswordCustomer from './customer/ChangePasswordCustomer';

const CustomerDashboard = () => {
  const sidebarItems = [
    { path: '/dashboard/customer', label: 'Overview', icon: <FiHome size={20} /> },
    { path: '/dashboard/customer/bookings', label: 'My Bookings', icon: <FiCalendar size={20} /> },
    { path: '/dashboard/customer/favorites', label: 'Favorites', icon: <FiHeart size={20} /> },
    { path: '/dashboard/customer/notifications', label: 'Notifications', icon: <FiBell size={20} /> },
    { path: '/dashboard/customer/profile', label: 'Profile', icon: <FiUser size={20} /> },
    { path: '/dashboard/customer/password', label: 'Change Password', icon: <FiSettings size={20} /> },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} title="Customer Dashboard">
      <Routes>
        <Route index element={<CustomerOverview />} />
        <Route path="bookings" element={<BookingHistory />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<CustomerProfile />} />
        <Route path="password" element={<ChangePasswordCustomer />} />
      </Routes>
    </DashboardLayout>
  );
};

export default CustomerDashboard;
