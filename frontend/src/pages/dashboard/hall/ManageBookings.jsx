import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import { FiCheck, FiX, FiDownload, FiEye } from 'react-icons/fi';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await api.get('/bookings/hall/my');
      setBookings(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (bookingId, action) => {
    try {
      await api.put(`/bookings/hall/${bookingId}/approval`, { action });
      toast.success(`Booking ${action}d successfully`);
      loadBookings();
    } catch (error) {
      toast.error(`Failed to ${action} booking`);
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
      <h1 className="text-3xl font-bold text-gray-900">Manage Bookings</h1>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">No bookings yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {booking.attendeeDetails?.name}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Event Date</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(booking.eventDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Phone</p>
                      <p className="font-semibold text-gray-900">{booking.attendeeDetails?.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Amount</p>
                      <p className="font-semibold text-gray-900">
                        ₹{booking.totalAmount?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Status</p>
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
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
                  {booking.hallApproval && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-500">Hall Approval: {booking.hallApproval}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {booking.hallApproval === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApproval(booking._id, 'approve')}
                        className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700"
                        title="Approve"
                      >
                        <FiCheck size={20} />
                      </button>
                      <button
                        onClick={() => handleApproval(booking._id, 'reject')}
                        className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700"
                        title="Reject"
                      >
                        <FiX size={20} />
                      </button>
                    </>
                  )}
                  {booking.idProof && (
                    <a
                      href={booking.idProof.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-orange-600 text-white p-2 rounded-lg hover:bg-orange-700"
                      title="Download ID Proof"
                    >
                      <FiDownload size={20} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageBookings;

