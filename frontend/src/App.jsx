import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from './layouts/Layout';
import HomePage from './pages/HomePage';
import UnifiedLogin from './pages/auth/UnifiedLogin';
import HallRegister from './pages/auth/HallRegister';
import ServiceProviderRegister from './pages/auth/ServiceProviderRegister';
import HallsPage from './pages/HallsPage';
import HallDetailPage from './pages/HallDetailPage';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';
import CustomerDashboard from './pages/dashboard/CustomerDashboard';
import HallDashboard from './pages/dashboard/HallDashboard';
import ServiceProviderDashboard from './pages/dashboard/ServiceProviderDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="halls" element={<HallsPage />} />
        <Route path="halls/:id" element={<HallDetailPage />} />
        
        {/* Auth Routes */}
        <Route path="login" element={<UnifiedLogin />} />
        <Route path="hall/register" element={<HallRegister />} />
        <Route path="service-provider/register" element={<ServiceProviderRegister />} />
        
        {/* Protected Routes */}
        <Route
          path="booking/:hallId"
          element={
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="payment/:bookingId"
          element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard/admin/*"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard/hall/*"
          element={
            <ProtectedRoute allowedRoles={['hall']}>
              <HallDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard/service-provider/*"
          element={
            <ProtectedRoute allowedRoles={['serviceProvider']}>
              <ServiceProviderDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard/customer/*"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;

