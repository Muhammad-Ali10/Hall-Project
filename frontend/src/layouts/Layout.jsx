import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';

const Layout = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return null;
    const role = user.role;
    if (role === 'customer') return '/dashboard/customer';
    if (role === 'hall') return '/dashboard/hall';
    if (role === 'serviceProvider') return '/dashboard/service-provider';
    if (role === 'admin') return '/dashboard/admin';
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl md:text-3xl font-bold text-orange-600 hover:text-orange-700 transition">
                HallBooking
              </Link>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <Link
                to="/halls"
                className="hidden md:block text-gray-700 hover:text-orange-600 font-semibold transition"
              >
                Browse Halls
              </Link>
              {user ? (
                <>
                  {getDashboardLink() && (
                    <Link
                      to={getDashboardLink()}
                      className="hidden md:block text-gray-700 hover:text-orange-600 font-semibold transition"
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="bg-black text-white px-3 md:px-4 py-2 rounded-lg hover:bg-gray-800 font-semibold transition text-sm md:text-base"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-orange-600 font-semibold transition text-sm md:text-base"
                  >
                    Login
                  </Link>
                  <Link
                    to="/hall/register"
                    className="bg-orange-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-orange-700 font-semibold transition shadow-md text-sm md:text-base"
                  >
                    List Hall
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
      <footer className="bg-black text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-center">© 2024 Convention Hall Booking Platform</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

