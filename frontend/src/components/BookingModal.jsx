import { useState, useEffect, useRef, useCallback } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { createBooking } from '../redux/slices/bookingSlice';
import { fetchHallById } from '../redux/slices/hallSlice';
import toast from 'react-hot-toast';
import api from '../utils/api';
import PhoneInput from './PhoneInput';
import { FiX, FiCalendar, FiMapPin, FiUsers, FiDollarSign } from 'react-icons/fi';

const validationSchema = Yup.object({
  eventDate: Yup.date().min(new Date(), 'Event date must be in the future').required('Required'),
  eventType: Yup.string().required('Required'),
  attendeeDetails: Yup.object({
    name: Yup.string().required('Required'),
    phone: Yup.string().required('Required'),
    email: Yup.string().email('Invalid email'),
    address: Yup.string(),
  }),
});

const BookingModal = ({ isOpen, onClose, hallId }) => {
  const dispatch = useDispatch();
  const { currentHall } = useSelector((state) => state.halls);
  const { loading } = useSelector((state) => state.bookings);
  const { user } = useSelector((state) => state.auth);
  const [idProofFile, setIdProofFile] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [hallLoading, setHallLoading] = useState(false);
  
  // Use refs to prevent duplicate API calls
  const isLoadingRef = useRef(false);
  const hasLoadedRef = useRef(false);
  const hallLoadingRef = useRef(false);

  const loadAvailableDates = useCallback(async () => {
    if (!hallId || isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    try {
      setLoadingDates(true);
      // Add cache-busting parameter to prevent 304 responses
      const response = await api.get(`/halls/${hallId}/available-dates`, {
        params: {
          _t: Date.now() // Cache buster
        },
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        setAvailableDates(response.data.data);
        hasLoadedRef.current = true;
      } else {
        console.warn('Invalid response format:', response.data);
        setAvailableDates([]);
      }
    } catch (error) {
      console.error('Failed to load available dates:', error);
      toast.error(error.response?.data?.message || 'Failed to load available dates. Please try again.');
      setAvailableDates([]);
    } finally {
      setLoadingDates(false);
      isLoadingRef.current = false;
    }
  }, [hallId]);

  const formik = useFormik({
    initialValues: {
      eventDate: '',
      eventType: '',
      attendeeDetails: {
        name: '',
        phone: '',
        email: '',
        address: '',
      },
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!user) {
        toast.error('Please login to book');
        return;
      }

      if (!values.eventDate) {
        toast.error('Please select an event date');
        return;
      }

      if (!idProofFile) {
        toast.error('Please upload an ID proof');
        return;
      }

      try {
        const bookingData = {
          hall: hallId,
          eventDate: values.eventDate,
          eventType: values.eventType,
          attendeeDetails: values.attendeeDetails,
          idProof: idProofFile,
        };
        
        const result = await dispatch(createBooking(bookingData)).unwrap();
        
        if (result && result.data && result.data._id) {
          toast.success('Booking created successfully');
          onClose();
          // Navigate to payment page
          window.location.href = `/payment/${result.data._id}`;
        } else {
          toast.error('Booking created but failed to get booking ID');
        }
      } catch (error) {
        console.error('Booking creation error:', error);
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create booking';
        toast.error(errorMessage);
      }
    },
  });

  useEffect(() => {
    if (isOpen && hallId) {
      // Reset refs when modal opens
      isLoadingRef.current = false;
      hasLoadedRef.current = false;
      hallLoadingRef.current = false;
      
      // Load hall data only if not already loading
      if (!hallLoadingRef.current && !currentHall) {
        hallLoadingRef.current = true;
        setHallLoading(true);
        dispatch(fetchHallById(hallId)).then(() => {
          setHallLoading(false);
          hallLoadingRef.current = false;
        }).catch(() => {
          setHallLoading(false);
          hallLoadingRef.current = false;
        });
      } else if (currentHall) {
        setHallLoading(false);
      }
      
      // Load available dates only once when modal opens
      if (!hasLoadedRef.current && !isLoadingRef.current) {
        loadAvailableDates();
      }
    } else {
      // Reset state when modal closes
      setAvailableDates([]);
      setSelectedDate(null);
      setIdProofFile(null);
      isLoadingRef.current = false;
      hasLoadedRef.current = false;
      hallLoadingRef.current = false;
      if (formik) {
        formik.resetForm();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, hallId]);

  const handleDateClick = (dateInfo) => {
    if (dateInfo.available && !dateInfo.booked && !dateInfo.blocked) {
      setSelectedDate(dateInfo.date);
      formik.setFieldValue('eventDate', dateInfo.date);
    }
  };

  if (!isOpen) return null;

  // Show loading state
  if (hallLoading || (!currentHall && hallId)) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-4"></div>
            <p className="text-gray-600">Loading hall details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentHall) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <p className="text-red-600 mb-4">Hall not found</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Book {currentHall.name}</h2>
            <p className="text-gray-600 mt-1">{currentHall.address?.fullAddress}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Hall Summary */}
          <div className="bg-orange-50 rounded-xl p-6 mb-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <FiDollarSign className="text-orange-600 mr-2" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="font-bold text-gray-900">₹{currentHall.price?.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center">
                <FiUsers className="text-orange-600 mr-2" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Capacity</p>
                  <p className="font-bold text-gray-900">{currentHall.capacity} people</p>
                </div>
              </div>
              <div className="flex items-center">
                <FiMapPin className="text-orange-600 mr-2" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-bold text-gray-900">{currentHall.address?.city}</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Available Dates Calendar */}
            <div>
              <label className="block text-gray-700 font-semibold mb-3">Select Event Date *</label>
              {loadingDates ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                  <p className="mt-2 text-gray-600">Loading available dates...</p>
                </div>
              ) : availableDates.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-2">No dates available. Please select a date manually.</p>
                  <input
                    type="date"
                    {...formik.getFieldProps('eventDate')}
                    min={new Date().toISOString().split('T')[0]}
                    className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                  />
                  {formik.touched.eventDate && formik.errors.eventDate && (
                    <p className="text-red-500 text-sm mt-1">{formik.errors.eventDate}</p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-2 max-h-64 overflow-y-auto p-4 bg-gray-50 rounded-lg">
                  {availableDates.map((dateInfo) => {
                    const isSelected = selectedDate === dateInfo.date;
                    const isAvailable = dateInfo.available && !dateInfo.booked && !dateInfo.blocked;
                    const date = new Date(dateInfo.date);
                    const day = date.getDate();
                    const month = date.toLocaleDateString('en-US', { month: 'short' });

                    return (
                      <button
                        key={dateInfo.date}
                        type="button"
                        onClick={() => handleDateClick(dateInfo)}
                        disabled={!isAvailable}
                        className={`
                          p-3 rounded-lg text-center transition
                          ${isSelected
                            ? 'bg-orange-600 text-white font-bold'
                            : isAvailable
                            ? 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer'
                            : 'bg-red-100 text-red-600 cursor-not-allowed opacity-50'
                          }
                        `}
                        title={
                          dateInfo.booked
                            ? 'Already booked'
                            : dateInfo.blocked
                            ? 'Not available'
                            : 'Available'
                        }
                      >
                        <div className="text-xs">{month}</div>
                        <div className="text-lg font-semibold">{day}</div>
                      </button>
                    );
                  })}
                </div>
              )}
              {!loadingDates && availableDates.length > 0 && formik.touched.eventDate && formik.errors.eventDate && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.eventDate}</p>
              )}
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Event Type *</label>
              <select
                {...formik.getFieldProps('eventType')}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
              >
                <option value="">Select event type</option>
                <option value="wedding">Wedding</option>
                <option value="corporate">Corporate</option>
                <option value="birthday">Birthday</option>
                <option value="conference">Conference</option>
                <option value="exhibition">Exhibition</option>
                <option value="other">Other</option>
              </select>
              {formik.touched.eventType && formik.errors.eventType && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.eventType}</p>
              )}
            </div>

            {/* Attendee Details */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Attendee Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Name *</label>
                  <input
                    type="text"
                    {...formik.getFieldProps('attendeeDetails.name')}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                  />
                  {formik.touched.attendeeDetails?.name && formik.errors.attendeeDetails?.name && (
                    <p className="text-red-500 text-sm mt-1">{formik.errors.attendeeDetails.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Phone *</label>
                  <PhoneInput
                    value={formik.values.attendeeDetails.phone}
                    onChange={(value) => formik.setFieldValue('attendeeDetails.phone', value)}
                    error={formik.errors.attendeeDetails?.phone}
                    touched={formik.touched.attendeeDetails?.phone}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    {...formik.getFieldProps('attendeeDetails.email')}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                  />
                  {formik.touched.attendeeDetails?.email && formik.errors.attendeeDetails?.email && (
                    <p className="text-red-500 text-sm mt-1">{formik.errors.attendeeDetails.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Address</label>
                  <textarea
                    {...formik.getFieldProps('attendeeDetails.address')}
                    rows={3}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* ID Proof */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">ID Proof (PDF/Image) *</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setIdProofFile(e.target.files[0])}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                required
              />
            </div>

            {/* Booking Summary */}
            <div className="bg-gray-100 p-6 rounded-xl">
              <h4 className="font-semibold mb-4 text-gray-900">Booking Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Hall Price:</span>
                  <span className="font-semibold">₹{currentHall.price?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Advance Payment (50%):</span>
                  <span className="font-semibold text-orange-600">
                    ₹{Math.round((currentHall.price || 0) * 0.5).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-300">
                  <span className="text-gray-600">Remaining Amount:</span>
                  <span className="font-semibold">
                    ₹{Math.round((currentHall.price || 0) * 0.5).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-700 disabled:opacity-50 shadow-lg hover:shadow-xl transition"
            >
              {loading ? 'Creating Booking...' : 'Proceed to Payment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;

