import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      const response = await api.get(`/bookings/my/${bookingId}`);
      setBooking(response.data.data);
    } catch (error) {
      toast.error('Failed to load booking');
    }
  };

  const createPaymentOrder = async () => {
    try {
      setLoading(true);
      const response = await api.post(`/payments/${bookingId}/order`);
      setOrderData(response.data.data);
      loadRazorpayScript();
    } catch (error) {
      toast.error('Failed to create payment order');
    } finally {
      setLoading(false);
    }
  };

  const handleTestPayment = async () => {
    try {
      setLoading(true);
      await api.post(`/payments/${bookingId}/test`);
      toast.success('Test payment completed successfully!');
      navigate('/dashboard/customer');
    } catch (error) {
      toast.error('Test payment failed');
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      initializeRazorpay();
    };
    document.body.appendChild(script);
  };

  const initializeRazorpay = () => {
    const options = {
      key: orderData.key,
      amount: orderData.amount * 100,
      currency: orderData.currency,
      order_id: orderData.orderId,
      name: 'Convention Hall Booking',
      description: 'Hall Booking Advance Payment',
      handler: async function (response) {
        try {
          await api.post(`/payments/${bookingId}/verify`, {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          toast.success('Payment successful!');
          navigate('/dashboard/customer');
        } catch (error) {
          toast.error('Payment verification failed');
        }
      },
      prefill: {
        contact: booking?.attendeeDetails?.phone || '',
        email: booking?.attendeeDetails?.email || '',
      },
      theme: {
        color: '#3399cc',
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  if (!booking) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Payment</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
          <div className="space-y-2">
            <p>Hall: {booking.hall?.name}</p>
            <p>Event Date: {new Date(booking.eventDate).toLocaleDateString()}</p>
            <p>Total Amount: ₹{booking.payment?.amount}</p>
            <p className="text-lg font-semibold">
              Advance Amount: ₹{booking.payment?.advanceAmount}
            </p>
          </div>
        </div>

        {booking.payment?.status === 'completed' ? (
          <div className="bg-green-100 p-4 rounded-lg text-center">
            <p className="text-green-800 font-semibold">Payment Already Completed</p>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={createPaymentOrder}
              disabled={loading}
              className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50 font-semibold shadow-lg"
            >
              {loading ? 'Processing...' : 'Pay ₹' + booking.payment?.advanceAmount}
            </button>
            <button
              onClick={handleTestPayment}
              disabled={loading}
              className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 disabled:opacity-50 font-semibold shadow-lg"
            >
              {loading ? 'Processing...' : 'Test Payment (For Testing)'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;

