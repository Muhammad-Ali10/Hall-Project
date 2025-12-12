const User = require('../models/User');
const Hall = require('../models/Hall');
const Booking = require('../models/Booking');
const ServiceProvider = require('../models/ServiceProvider');
const Transaction = require('../models/Transaction');
const { paginate, paginateResponse } = require('../utils/pagination');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

// Get detailed hall information for admin review
exports.getHallDetailsForReview = async (req, res) => {
  try {
    const { hallId } = req.params;
    
    const hall = await Hall.findById(hallId)
      .populate('owner', 'email profile.name hallApprovalStatus createdAt');
    
    if (!hall) {
      return errorResponse(res, 'Hall not found', 404);
    }

    return successResponse(res, hall, 'Hall details retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to fetch hall details', 500);
  }
};

// Approve/Reject/Block hall owner
exports.updateHallApproval = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action, rejectionReason, adminNote } = req.body; // action: 'approve', 'reject', or 'block'

    const user = await User.findById(userId);
    if (!user || user.role !== 'hall') {
      return errorResponse(res, 'Hall owner not found', 404);
    }

    const hall = await Hall.findOne({ owner: user._id });
    if (!hall) {
      return errorResponse(res, 'Hall not found for this owner', 404);
    }

    if (action === 'approve') {
      user.hallApprovalStatus = 'approved';
      user.rejectionReason = undefined;
      hall.isActive = true;
      await hall.save();
    } else if (action === 'reject') {
      user.hallApprovalStatus = 'rejected';
      user.rejectionReason = rejectionReason || 'Rejected by admin';
      hall.isActive = false;
      await hall.save();
    } else if (action === 'block') {
      user.hallApprovalStatus = 'approved'; // Keep approved status but block
      hall.isActive = false;
      await hall.save();
    } else if (action === 'unblock') {
      hall.isActive = true;
      await hall.save();
    }

    // Store admin action log (you can create a separate AdminLog model if needed)
    if (adminNote) {
      hall.adminNotes = hall.adminNotes || [];
      hall.adminNotes.push({
        note: adminNote,
        action,
        adminId: req.user._id,
        timestamp: new Date(),
      });
      await hall.save();
    }

    await user.save();

    return successResponse(res, { user, hall }, `Hall owner ${action}d successfully`);
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to update approval', 500);
  }
};

// Get all hall owners (pending/approved/rejected) with hall details
exports.getHallOwners = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const { skip, limit: limitNum } = paginate(page, limit);

    const query = { role: 'hall' };
    if (status) {
      query.hallApprovalStatus = status;
    }

    const users = await User.find(query)
      .select('-password -otp')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Populate hall details for each owner
    const usersWithHalls = await Promise.all(
      users.map(async (user) => {
        const hall = await Hall.findOne({ owner: user._id })
          .select('name address location photos videos price capacity eventTypes amenities isActive createdAt');
        return {
          ...user.toObject(),
          hall: hall || null,
        };
      })
    );

    const total = await User.countDocuments(query);

    return paginatedResponse(res, usersWithHalls, paginateResponse(usersWithHalls, page, limitNum, total).pagination, 'Hall owners retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to fetch hall owners', 500);
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    const { skip, limit: limitNum } = paginate(page, limit);

    const query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      ...paginateResponse(users, page, limitNum, total),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch users',
    });
  }
};

// Get all halls
exports.getAllHalls = async (req, res) => {
  try {
    const { isActive, page = 1, limit = 10 } = req.query;
    const { skip, limit: limitNum } = paginate(page, limit);

    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const halls = await Hall.find(query)
      .populate('owner', 'email profile hallApprovalStatus')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Hall.countDocuments(query);

    res.json({
      success: true,
      ...paginateResponse(halls, page, limitNum, total),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch halls',
    });
  }
};

// Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
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

// Get platform analytics
exports.getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalHalls = await Hall.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalServiceProviders = await ServiceProvider.countDocuments();

    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });

    const totalRevenue = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const revenueByMonth = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          customers: totalCustomers,
          halls: await User.countDocuments({ role: 'hall' }),
          serviceProviders: totalServiceProviders,
        },
        halls: {
          total: totalHalls,
          active: await Hall.countDocuments({ isActive: true }),
        },
        bookings: {
          total: totalBookings,
          confirmed: confirmedBookings,
          pending: pendingBookings,
        },
        revenue: {
          total: totalRevenue[0]?.total || 0,
          byMonth: revenueByMonth,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch analytics',
    });
  }
};

// Service Provider Approval System
exports.getServiceProviderDetailsForReview = async (req, res) => {
  try {
    const { serviceProviderId } = req.params;
    
    const serviceProvider = await ServiceProvider.findById(serviceProviderId)
      .populate('user', 'email profile.name createdAt');
    
    if (!serviceProvider) {
      return errorResponse(res, 'Service provider not found', 404);
    }

    return successResponse(res, serviceProvider, 'Service provider details retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to fetch service provider details', 500);
  }
};

exports.updateServiceProviderApproval = async (req, res) => {
  try {
    const { serviceProviderId } = req.params;
    const { action, rejectionReason, adminNote } = req.body;

    const serviceProvider = await ServiceProvider.findById(serviceProviderId)
      .populate('user');
    
    if (!serviceProvider) {
      return errorResponse(res, 'Service provider not found', 404);
    }

    const user = serviceProvider.user;
    if (!user) {
      return errorResponse(res, 'User not found for this service provider', 404);
    }

    // Add approval status to User model if not exists (you may need to add this field)
    if (action === 'approve') {
      serviceProvider.isActive = true;
      // You can add serviceProviderApprovalStatus to User model similar to hallApprovalStatus
    } else if (action === 'reject') {
      serviceProvider.isActive = false;
    } else if (action === 'block') {
      serviceProvider.isActive = false;
    } else if (action === 'unblock') {
      serviceProvider.isActive = true;
    }

    // Store admin notes
    if (adminNote) {
      serviceProvider.adminNotes = serviceProvider.adminNotes || [];
      serviceProvider.adminNotes.push({
        note: adminNote,
        action,
        adminId: req.user._id,
        timestamp: new Date(),
      });
    }

    await serviceProvider.save();

    return successResponse(res, serviceProvider, `Service provider ${action}d successfully`);
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to update service provider approval', 500);
  }
};

exports.getServiceProviders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const { skip, limit: limitNum } = paginate(page, limit);

    const query = {};
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const serviceProviders = await ServiceProvider.find(query)
      .populate('user', 'email profile.name createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await ServiceProvider.countDocuments(query);

    return paginatedResponse(res, serviceProviders, paginateResponse(serviceProviders, page, limitNum, total).pagination, 'Service providers retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to fetch service providers', 500);
  }
};

// Block/Unblock hall
exports.blockHall = async (req, res) => {
  try {
    const { hallId } = req.params;
    const { action } = req.body; // 'block' or 'unblock'

    const hall = await Hall.findById(hallId);
    if (!hall) {
      return errorResponse(res, 'Hall not found', 404);
    }

    hall.isActive = action === 'unblock';
    await hall.save();

    return successResponse(res, hall, `Hall ${action}ed successfully`);
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to update hall status', 500);
  }
};

// Block/Unblock user
exports.blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action } = req.body; // 'block' or 'unblock'

    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    user.isBlocked = action === 'block';
    await user.save();

    return successResponse(res, user, `User ${action}ed successfully`);
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to update user status', 500);
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);
    return successResponse(res, null, 'User deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to delete user', 500);
  }
};

