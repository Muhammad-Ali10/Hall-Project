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
import ServiceProviderOverview from './serviceProvider/ServiceProviderOverview';
import EditServiceProvider from './serviceProvider/EditServiceProvider';
import ManagePortfolio from './serviceProvider/ManagePortfolio';
import ManagePackages from './serviceProvider/ManagePackages';
import ServiceProviderProfile from './serviceProvider/ServiceProviderProfile';
import ChangePasswordSP from './serviceProvider/ChangePasswordSP';

const ServiceProviderDashboard = () => {
  const sidebarItems = [
    { path: '/dashboard/service-provider', label: 'Overview', icon: <FiHome size={20} /> },
    { path: '/dashboard/service-provider/edit', label: 'Edit Details', icon: <FiEdit3 size={20} /> },
    { path: '/dashboard/service-provider/portfolio', label: 'Portfolio', icon: <FiImage size={20} /> },
    { path: '/dashboard/service-provider/packages', label: 'Packages', icon: <FiDollarSign size={20} /> },
    { path: '/dashboard/service-provider/profile', label: 'Profile', icon: <FiUser size={20} /> },
    { path: '/dashboard/service-provider/password', label: 'Change Password', icon: <FiSettings size={20} /> },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} title="Service Provider Dashboard">
      <Routes>
        <Route index element={<ServiceProviderOverview />} />
        <Route path="edit" element={<EditServiceProvider />} />
        <Route path="portfolio" element={<ManagePortfolio />} />
        <Route path="packages" element={<ManagePackages />} />
        <Route path="profile" element={<ServiceProviderProfile />} />
        <Route path="password" element={<ChangePasswordSP />} />
      </Routes>
    </DashboardLayout>
  );
};

export default ServiceProviderDashboard;
