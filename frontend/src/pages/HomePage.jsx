import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTopHalls } from '../redux/slices/hallSlice';
import { fetchServiceProvidersByCategory } from '../redux/slices/serviceProviderSlice';
import HeroSearch from '../components/HeroSearch';
import { FiMapPin, FiUsers, FiDollarSign, FiStar, FiPhone } from 'react-icons/fi';

const HomePage = () => {
  const { user } = useSelector((state) => state.auth);
  const { topHalls, loading: hallsLoading } = useSelector((state) => state.halls);
  const { serviceProviders } = useSelector((state) => state.serviceProviders);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    // Fetch only featured halls (4-5 max) without location
    dispatch(fetchTopHalls({ limit: 5 }));

    // Fetch service providers
    dispatch(fetchServiceProvidersByCategory(['decoration', 'catering', 'photography', 'makeup']));
  }, [dispatch]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">
              Book Your Perfect Event Venue
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-orange-50">
              Find and book convention halls for weddings, corporate events, and more
            </p>
          </div>
          
          {/* Hero Search Bar */}
          <HeroSearch />
        </div>
      </section>

      {/* Top Halls Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              Featured Halls
            </h2>
            <Link
              to="/halls"
              className="text-orange-600 font-semibold hover:text-orange-700 flex items-center gap-2"
            >
              View All <span>→</span>
            </Link>
          </div>

          {hallsLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
          ) : topHalls.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No halls available</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {topHalls.slice(0, 4).map((hall) => (
                <Link
                  key={hall._id}
                  to={`/halls/${hall._id}`}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {hall.photos && hall.photos.length > 0 ? (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={hall.photos[0].url}
                        alt={hall.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="relative h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-2 text-gray-900 line-clamp-1">{hall.name}</h3>
                    <div className="flex items-center text-gray-600 mb-2 text-sm">
                      <FiMapPin className="mr-1" size={14} />
                      <span className="truncate">{hall.address?.city || 'Location not specified'}</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      {hall.capacity && (
                        <div className="flex items-center text-gray-600 text-sm">
                          <FiUsers className="mr-1" size={14} />
                          <span>{hall.capacity}</span>
                        </div>
                      )}
                      {hall.price && (
                        <div className="flex items-center text-orange-600 font-bold text-lg">
                          <FiDollarSign size={16} />
                          <span>{hall.price.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    {hall.rating && hall.rating.average > 0 && (
                      <div className="flex items-center mb-3">
                        <FiStar className="text-yellow-400 mr-1" size={14} />
                        <span className="text-sm font-semibold">{hall.rating.average.toFixed(1)}</span>
                        <span className="text-gray-500 text-sm ml-1">({hall.rating.count})</span>
                      </div>
                    )}
                    <button className="w-full bg-orange-600 text-white py-2 rounded-lg font-semibold hover:bg-orange-700 transition text-sm">
                      View Details
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-orange-600">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Search & Browse</h3>
              <p className="text-gray-600 text-sm">Find the perfect hall using our advanced search filters</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-orange-600">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">View Details</h3>
              <p className="text-gray-600 text-sm">Check photos, amenities, pricing, and availability</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-orange-600">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Book & Pay</h3>
              <p className="text-gray-600 text-sm">Secure your booking with our safe payment system</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-orange-600">4</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Enjoy Event</h3>
              <p className="text-gray-600 text-sm">Celebrate your special day at your chosen venue</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <h3 className="text-4xl md:text-5xl font-bold mb-2">500+</h3>
              <p className="text-orange-100 text-lg">Verified Halls</p>
            </div>
            <div>
              <h3 className="text-4xl md:text-5xl font-bold mb-2">10K+</h3>
              <p className="text-orange-100 text-lg">Happy Customers</p>
            </div>
            <div>
              <h3 className="text-4xl md:text-5xl font-bold mb-2">50+</h3>
              <p className="text-orange-100 text-lg">Cities Covered</p>
            </div>
            <div>
              <h3 className="text-4xl md:text-5xl font-bold mb-2">4.8★</h3>
              <p className="text-orange-100 text-lg">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Cities Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">Popular Cities</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {['Karachi', 'Lahore', 'Islamabad', 'Multan', 'Faisalabad', 'Rawalpindi', 'Peshawar', 'Quetta'].map((city) => (
              <Link
                key={city}
                to={`/halls?city=${city}`}
                className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition-all hover:-translate-y-1 group"
              >
                <div className="text-4xl mb-3">🏙️</div>
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-orange-600 transition">
                  {city}
                </h3>
                <p className="text-sm text-gray-600 mt-1">Explore halls</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Service Providers Section */}
      {serviceProviders.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
              Recommended Service Providers
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {serviceProviders.slice(0, 8).map((provider) => (
                <div
                  key={provider._id}
                  className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-100 hover:border-orange-300 hover:shadow-lg transition-all"
                >
                  <h3 className="text-lg font-bold mb-2 text-gray-800">{provider.businessName}</h3>
                  <p className="text-sm text-orange-600 font-semibold mb-3 capitalize">
                    {provider.category}
                  </p>
                  {provider.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{provider.description}</p>
                  )}
                  <a
                    href={`tel:${provider.phone}`}
                    className="flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 font-semibold transition w-full"
                  >
                    <FiPhone />
                    Call Now
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 bg-orange-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Why Choose Us?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center bg-white p-8 rounded-2xl shadow-md">
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🏢</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Wide Selection</h3>
              <p className="text-gray-600">Choose from hundreds of verified halls</p>
            </div>
            <div className="text-center bg-white p-8 rounded-2xl shadow-md">
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">💳</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Secure Payment</h3>
              <p className="text-gray-600">Safe and secure payment processing</p>
            </div>
            <div className="text-center bg-white p-8 rounded-2xl shadow-md">
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Verified Halls</h3>
              <p className="text-gray-600">All halls are verified and approved</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="bg-black text-white py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Are you a Hall Owner?</h2>
            <p className="text-gray-300 mb-8 text-lg">List your hall and start getting bookings</p>
            <Link
              to="/hall/register"
              className="bg-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-700 inline-block shadow-lg transition"
            >
              Register Your Hall
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">HallBooking</h3>
              <p className="text-gray-400 text-sm">
                Your trusted platform for booking convention halls and event venues.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/halls" className="hover:text-orange-500 transition">Browse Halls</Link></li>
                <li><Link to="/hall/register" className="hover:text-orange-500 transition">Register Hall</Link></li>
                <li><Link to="/service-provider/register" className="hover:text-orange-500 transition">Become Service Provider</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-orange-500 transition">Help Center</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-orange-500 transition">Facebook</a>
                <a href="#" className="text-gray-400 hover:text-orange-500 transition">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-orange-500 transition">Instagram</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} HallBooking. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
