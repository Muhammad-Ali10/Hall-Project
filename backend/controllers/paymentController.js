const Booking = require('../models/Booking');
const Hall = require('../models/Hall');
const { createOrder, verifyPayment, saveTransaction } = require('../services/paymentService');
const { sendBookingConfirmation, sendSMS } = require('../services/emailService');

// Create payment order
exports.createPaymentOrder = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate('customer', 'phone profile')
      .populate('hall', 'name');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    if (booking.payment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed',
      });
    }

    const order = await createOrder(
      booking.payment.advanceAmount,
      'INR',
      `booking_${bookingId}_${Date.now()}`
    );

    // Update booking with order ID
    booking.payment.razorpayOrderId = order.id;
    await booking.save();

    res.json({
      success: true,
      message: 'Payment order created',
      data: {
        orderId: order.id,
        amount: order.amount / 100,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment order',
    });
  }
};

// Verify payment
exports.verifyPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate('customer', 'phone profile email')
      .populate('hall', 'name owner');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Verify payment signature
    const isValid = verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
      });
    }

    // Update booking payment status
    booking.payment.status = 'completed';
    booking.payment.razorpayPaymentId = razorpayPaymentId;
    booking.payment.razorpaySignature = razorpaySignature;
    booking.status = 'pending'; // Waiting for hall approval

    // Block the date in hall calendar (temporary, until hall approves)
    const hall = await Hall.findById(booking.hall._id);
    hall.bookedDates.push({
      date: booking.eventDate,
      bookingId: booking._id,
    });
    await hall.save();

    await booking.save();

    // Save transaction
    await saveTransaction({
      booking: booking._id,
      customer: booking.customer._id,
      hall: booking.hall._id,
      amount: booking.payment.advanceAmount,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      status: 'completed',
    });

    // Send confirmation email and SMS
    try {
      await sendBookingConfirmation(booking, booking.customer, booking.hall);
      await sendSMS(
        booking.attendeeDetails.phone,
        `Your booking for ${booking.hall.name} on ${new Date(booking.eventDate).toLocaleDateString()} is confirmed. Payment received.`
      );
    } catch (error) {
      console.error('Notification error:', error);
    }

    res.json({
      success: true,
      message: 'Payment verified and booking confirmed',
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify payment',
    });
  }
};

// Payment webhook handler
exports.paymentWebhook = async (req, res) => {
  try {
    const crypto = require('crypto');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest !== signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature',
      });
    }

    const event = req.body.event;
    const payment = req.body.payload.payment.entity;

    if (event === 'payment.captured') {
      const booking = await Booking.findOne({
        'payment.razorpayPaymentId': payment.id,
      });

      if (booking && booking.payment.status !== 'completed') {
        booking.payment.status = 'completed';
        booking.payment.razorpayPaymentId = payment.id;
        await booking.save();
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
    });
  }
};

// Get payment status
exports.getPaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).select('payment status');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    res.json({
      success: true,
      data: {
        status: booking.payment.status,
        amount: booking.payment.amount,
        advanceAmount: booking.payment.advanceAmount,
        orderId: booking.payment.razorpayOrderId,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get payment status',
    });
  }
};

// Test payment (for development/testing)
exports.createTestPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate('customer', 'phone profile email')
      .populate('hall', 'name owner');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    if (booking.payment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed',
      });
    }

    // Simulate payment completion
    booking.payment.status = 'completed';
    booking.payment.razorpayOrderId = `test_order_${Date.now()}`;
    booking.payment.razorpayPaymentId = `test_payment_${Date.now()}`;
    booking.payment.razorpaySignature = 'test_signature';
    booking.status = 'pending'; // Waiting for hall approval

    // Block the date in hall calendar (temporary, until hall approves)
    const hall = await Hall.findById(booking.hall._id);
    hall.bookedDates.push({
      date: booking.eventDate,
      bookingId: booking._id,
    });
    await hall.save();

    await booking.save();

    // Save transaction
    const Transaction = require('../models/Transaction');
    await saveTransaction({
      booking: booking._id,
      customer: booking.customer._id,
      hall: booking.hall._id,
      amount: booking.payment.advanceAmount,
      razorpayOrderId: booking.payment.razorpayOrderId,
      razorpayPaymentId: booking.payment.razorpayPaymentId,
      razorpaySignature: booking.payment.razorpaySignature,
      status: 'completed',
    });

    // Send confirmation email and SMS
    try {
      await sendBookingConfirmation(booking, booking.customer, booking.hall);
      await sendSMS(
        booking.attendeeDetails.phone,
        `Your booking for ${booking.hall.name} on ${new Date(booking.eventDate).toLocaleDateString()} is confirmed. Payment received.`
      );
    } catch (error) {
      console.error('Notification error:', error);
    }

    res.json({
      success: true,
      message: 'Test payment completed successfully',
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process test payment',
    });
  }
};

