const Booking = require('../models/Booking');
const Hall = require('../models/Hall');
const { paginate, paginateResponse } = require('../utils/pagination');
const { sendBookingConfirmation, sendSMS } = require('../services/emailService');

// Create booking
exports.createBooking = async (req, res) => {
  try {
    const { hall, eventDate, eventType, attendeeDetails } = req.body;
    let attendeeDetailsObj = {};
    
    // Parse attendeeDetails if it's a string
    if (typeof attendeeDetails === 'string') {
      attendeeDetailsObj = JSON.parse(attendeeDetails);
    } else {
      attendeeDetailsObj = attendeeDetails;
    }

    // Check if hall exists and is active
    const hallDoc = await Hall.findById(hall);
    if (!hallDoc || !hallDoc.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Hall not found or not available',
      });
    }

    // Check if date is available
    const eventDateObj = new Date(eventDate);
    const eventDateStr = eventDateObj.toISOString().split('T')[0];
    
    // Check if date is already booked (handle undefined)
    const isBooked = (hallDoc.bookedDates || []).some(
      (bookedDate) => {
        const bookedDateStr = new Date(bookedDate.date).toISOString().split('T')[0];
        return bookedDateStr === eventDateStr;
      }
    );

    if (isBooked) {
      return res.status(400).json({
        success: false,
        message: 'Hall is already booked for this date',
      });
    }

    // Check if date is blocked (handle undefined)
    const isBlocked = (hallDoc.blockedDates || []).some(
      (blockedDate) => {
        const blockedDateStr = new Date(blockedDate.date).toISOString().split('T')[0];
        return blockedDateStr === eventDateStr;
      }
    );

    if (isBlocked) {
      return res.status(400).json({
        success: false,
        message: 'Hall is not available for this date',
      });
    }

    // If hall has explicit available dates, check if this date is in the list
    if (hallDoc.availableDates && hallDoc.availableDates.length > 0) {
      const isAvailable = hallDoc.availableDates.some(
        (availDate) => {
          const availDateStr = new Date(availDate.date).toISOString().split('T')[0];
          return availDateStr === eventDateStr;
        }
      );
      if (!isAvailable) {
        return res.status(400).json({
          success: false,
          message: 'Hall is not available for this date',
        });
      }
    }

    // Handle ID proof file
    let idProofData = null;
    if (req.file) {
      idProofData = {
        url: req.file.url || req.file.cloudinary?.url || req.file.path,
        publicId: req.file.publicId || req.file.cloudinary?.publicId || req.file.filename,
        type: 'other',
      };
    }

    // Create booking
    const booking = new Booking({
      customer: req.user._id,
      hall,
      eventDate: eventDateObj,
      eventType,
      attendeeDetails: attendeeDetailsObj,
      idProof: idProofData,
      payment: {
        amount: hallDoc.price,
        advanceAmount: hallDoc.price * 0.5, // 50% advance
        status: 'pending',
      },
      status: 'pending',
    });

    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create booking',
    });
  }
};

// Get customer bookings
exports.getMyBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const { skip, limit: limitNum } = paginate(page, limit);

    const query = { customer: req.user._id };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('hall', 'name address photos')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      ...paginateResponse(bookings, page, limitNum, total),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch bookings',
    });
  }
};

// Get single booking
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'phone profile')
      .populate('hall', 'name address photos owner phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check authorization
    if (
      req.user.role !== 'admin' &&
      booking.customer._id.toString() !== req.user._id.toString() &&
      (req.user.role !== 'hall' ||
        booking.hall.owner.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch booking',
    });
  }
};

// Hall owner - Get hall bookings
exports.getHallBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, hallApproval } = req.query;
    const { skip, limit: limitNum } = paginate(page, limit);

    const hall = await Hall.findOne({ owner: req.user._id });
    if (!hall) {
      return res.status(404).json({
        success: false,
        message: 'Hall not found',
      });
    }

    const query = { hall: hall._id };
    if (status) query.status = status;
    if (hallApproval) query.hallApproval = hallApproval;

    const bookings = await Booking.find(query)
      .populate('customer', 'phone profile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      ...paginateResponse(bookings, page, limitNum, total),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch bookings',
    });
  }
};

// Hall owner - Approve/Reject booking
exports.updateBookingApproval = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { action, rejectionReason } = req.body; // action: 'approve' or 'reject'

    const booking = await Booking.findById(bookingId).populate('hall');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check if hall belongs to user
    if (booking.hall.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    if (action === 'approve') {
      booking.hallApproval = 'approved';
      booking.status = 'confirmed';

      // Block the date in hall calendar
      const hall = await Hall.findById(booking.hall._id);
      hall.bookedDates.push({
        date: booking.eventDate,
        bookingId: booking._id,
      });
      await hall.save();
    } else if (action === 'reject') {
      booking.hallApproval = 'rejected';
      booking.rejectionReason = rejectionReason;
    }

    await booking.save();

    res.json({
      success: true,
      message: `Booking ${action}d successfully`,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update booking',
    });
  }
};

// Admin - Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const { skip, limit: limitNum } = paginate(page, limit);

    const query = {};
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('customer', 'phone profile')
      .populate('hall', 'name address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      ...paginateResponse(bookings, page, limitNum, total),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch bookings',
    });
  }
};

// Customer - Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { cancellationReason } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking already cancelled',
      });
    }

    booking.status = 'cancelled';
    booking.cancelledBy = 'customer';
    booking.cancellationReason = cancellationReason;

    // Unblock the date
    const hall = await Hall.findById(booking.hall);
    hall.bookedDates = hall.bookedDates.filter(
      (bookedDate) => bookedDate.bookingId.toString() !== bookingId
    );
    await hall.save();

    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel booking',
    });
  }
};

