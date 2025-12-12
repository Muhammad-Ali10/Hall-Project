import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHallById } from '../redux/slices/hallSlice';
import { createBooking } from '../redux/slices/bookingSlice';
import toast from 'react-hot-toast';
import api from '../utils/api';
import PhoneInput from '../components/PhoneInput';

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

const BookingPage = () => {
  const { hallId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentHall } = useSelector((state) => state.halls);
  const { loading } = useSelector((state) => state.bookings);
  const [idProofFile, setIdProofFile] = useState(null);

  useEffect(() => {
    dispatch(fetchHallById(hallId));
  }, [dispatch, hallId]);

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
      try {
        const bookingData = {
          hall: hallId,
          eventDate: values.eventDate,
          eventType: values.eventType,
          attendeeDetails: values.attendeeDetails,
          idProof: idProofFile,
        };
        const result = await dispatch(createBooking(bookingData)).unwrap();
        toast.success('Booking created successfully');
        navigate(`/payment/${result._id}`);
      } catch (error) {
        toast.error(error.message || 'Failed to create booking');
      }
    },
  });

  if (!currentHall) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Book {currentHall.name}</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={formik.handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Event Date *</label>
            <input
              type="date"
              {...formik.getFieldProps('eventDate')}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border rounded-lg"
            />
            {formik.touched.eventDate && formik.errors.eventDate && (
              <p className="text-red-500 text-sm">{formik.errors.eventDate}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Event Type *</label>
            <select
              {...formik.getFieldProps('eventType')}
              className="w-full px-4 py-2 border rounded-lg"
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
              <p className="text-red-500 text-sm">{formik.errors.eventType}</p>
            )}
          </div>

          <h3 className="text-xl font-semibold mb-4">Attendee Details</h3>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Name *</label>
            <input
              type="text"
              {...formik.getFieldProps('attendeeDetails.name')}
              className="w-full px-4 py-2 border rounded-lg"
            />
            {formik.touched.attendeeDetails?.name && formik.errors.attendeeDetails?.name && (
              <p className="text-red-500 text-sm">{formik.errors.attendeeDetails.name}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Phone *</label>
            <PhoneInput
              value={formik.values.attendeeDetails.phone}
              onChange={(value) => formik.setFieldValue('attendeeDetails.phone', value)}
              error={formik.errors.attendeeDetails?.phone}
              touched={formik.touched.attendeeDetails?.phone}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              {...formik.getFieldProps('attendeeDetails.email')}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">ID Proof (PDF/Image) *</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setIdProofFile(e.target.files[0])}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <h4 className="font-semibold mb-2">Booking Summary</h4>
            <p>Hall: {currentHall.name}</p>
            <p>Price: ₹{currentHall.price}</p>
            <p>Advance (50%): ₹{Math.round(currentHall.price * 0.5)}</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50 font-semibold shadow-lg"
          >
            {loading ? 'Creating Booking...' : 'Proceed to Payment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingPage;

