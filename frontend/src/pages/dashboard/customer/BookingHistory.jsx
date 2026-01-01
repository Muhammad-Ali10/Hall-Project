import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import { FiCalendar, FiMapPin, FiDollarSign } from 'react-icons/fi';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await api.get('/bookings/customer/my');
      setBookings(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (error) {
      toast.error('Failed to load bookings');
      setBookings([]);
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
      <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>

      {!Array.isArray(bookings) || bookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">No bookings yet</p>
          <a
            href="/halls"
            className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 font-semibold"
          >
            Browse Halls
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{booking.hall?.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <FiCalendar className="text-orange-600" />
                      <span className="text-gray-600">
                        {new Date(booking.eventDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiMapPin className="text-orange-600" />
                      <span className="text-gray-600">{booking.hall?.address?.city}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiDollarSign className="text-orange-600" />
                      <span className="font-semibold text-gray-900">
                        ₹{booking.totalAmount?.toLocaleString() || '0'}
                      </span>
                    </div>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    booking.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : booking.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {booking.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingHistory;

