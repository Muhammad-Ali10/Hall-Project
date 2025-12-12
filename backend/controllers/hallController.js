const Hall = require('../models/Hall');
const { paginate, paginateResponse } = require('../utils/pagination');
const { calculateDistance, getCoordinatesFromAddress } = require('../utils/geolocation');

// Helper function to ensure halls have coordinates
const ensureHallCoordinates = async (query = {}) => {
  try {
    const hallsWithoutCoords = await Hall.find({
      ...query,
      $or: [
        { 'location.coordinates': { $exists: false } },
        { 'location.coordinates': null },
        { 'location.coordinates': { $size: 0 } },
        { 'location.coordinates.0': { $exists: false } },
        { 'location.coordinates.1': { $exists: false } },
        { 'location.coordinates.0': 0 },
        { 'location.coordinates.1': 0 },
      ],
      'address.fullAddress': { $exists: true, $ne: '' },
    }).limit(10); // Process in batches

    for (const hall of hallsWithoutCoords) {
      if (hall.address && hall.address.fullAddress) {
        try {
          const coords = await getCoordinatesFromAddress(hall.address.fullAddress);
          if (coords && coords.lat && coords.lng) {
            hall.location = {
              type: 'Point',
              coordinates: [coords.lng, coords.lat],
            };
            await hall.save();
            console.log(`✅ Geocoded hall: ${hall.name} - ${hall.address.fullAddress} -> [${coords.lng}, ${coords.lat}]`);
          }
        } catch (error) {
          console.error(`❌ Failed to geocode hall ${hall._id} (${hall.name}):`, error.message);
        }
      }
    }
  } catch (error) {
    console.error('Error ensuring hall coordinates:', error);
  }
};

// Get all halls with filters
exports.getAllHalls = async (req, res) => {
  try {
    const {
      city,
      eventType,
      minPrice,
      maxPrice,
      minCapacity,
      maxCapacity,
      lat,
      lng,
      maxDistance,
      amenities,
      search,
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const { skip, limit: limitNum } = paginate(page, limit);
    const query = { isActive: true };

    // Search filter (name, city, description)
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { 'address.city': new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
      ];
    }

    // City filter
    if (city) {
      query['address.city'] = new RegExp(city, 'i');
    }

    // Event type filter
    if (eventType) {
      query.eventTypes = eventType;
    }

    // Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Capacity filter
    if (minCapacity || maxCapacity) {
      query.capacity = {};
      if (minCapacity) query.capacity.$gte = parseInt(minCapacity);
      if (maxCapacity) query.capacity.$lte = parseInt(maxCapacity);
    }

    // Amenities filter
    if (amenities) {
      const amenityList = Array.isArray(amenities) ? amenities : amenities.split(',');
      query.amenities = { $in: amenityList };
    }

    // Ensure halls have valid coordinates - geocode missing ones
    await ensureHallCoordinates(query);

    // Location-based search using MongoDB geospatial query
    let halls;
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const maxDist = maxDistance ? parseFloat(maxDistance) * 1000 : 50000; // Convert km to meters

      // Build base query with location requirement
      const locationQuery = {
        ...query,
        location: {
          $exists: true,
          $ne: null,
        },
        'location.coordinates': {
          $exists: true,
          $ne: null,
          $size: 2,
        },
      };

      // Use MongoDB aggregate for geospatial query with distance calculation
      // First, ensure we have halls with valid coordinates
      const validLocationQuery = {
        ...locationQuery,
        'location.coordinates.0': { $exists: true, $ne: null, $ne: 0 },
        'location.coordinates.1': { $exists: true, $ne: null, $ne: 0 },
      };

      const pipeline = [
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [userLng, userLat],
            },
            distanceField: 'distance',
            maxDistance: maxDist,
            spherical: true,
            query: validLocationQuery,
          },
        },
        { $match: query },
        { $lookup: { from: 'users', localField: 'owner', foreignField: '_id', as: 'owner' } },
        { $unwind: { path: '$owner', preserveNullAndEmptyArrays: true } },
        { $project: { 'owner.password': 0, 'owner.otp': 0 } },
      ];

      // Apply sorting
      if (sortBy === 'distance') {
        pipeline.push({ $sort: { distance: sortOrder === 'desc' ? -1 : 1 } });
      } else {
        pipeline.push({ $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 } });
      }

      // Apply pagination
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limitNum });

      halls = await Hall.aggregate(pipeline);

      // Populate owner field properly
      halls = await Hall.populate(halls, { path: 'owner', select: 'email profile' });
    } else {
      // Regular search without location
      halls = await Hall.find(query)
        .populate('owner', 'email profile')
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limitNum);
    }

    // Calculate total - for location-based search, count from aggregate result
    let total;
    if (lat && lng) {
      // For location-based search, get total from matching query
      total = await Hall.countDocuments({
        ...query,
        location: { $exists: true },
        'location.coordinates': { $exists: true, $size: 2 },
        'location.coordinates.0': { $exists: true, $ne: null, $ne: 0 },
        'location.coordinates.1': { $exists: true, $ne: null, $ne: 0 },
      });
    } else {
      total = await Hall.countDocuments(query);
    }

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

// Get single hall by ID
exports.getHallById = async (req, res) => {
  try {
    const hall = await Hall.findById(req.params.id)
      .populate('owner', 'email profile hallApprovalStatus');

    if (!hall) {
      return res.status(404).json({
        success: false,
        message: 'Hall not found',
      });
    }

    // Set headers to prevent caching
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.json({
      success: true,
      data: hall,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch hall',
    });
  }
};

// Hall owner - Get own hall
exports.getMyHall = async (req, res) => {
  try {
    const hall = await Hall.findOne({ owner: req.user._id })
      .populate('owner', 'email profile hallApprovalStatus');

    if (!hall) {
      return res.status(404).json({
        success: false,
        message: 'Hall not found',
      });
    }

    res.json({
      success: true,
      data: hall,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch hall',
    });
  }
};

// Hall owner - Update hall
exports.updateHall = async (req, res) => {
  try {
    const hall = await Hall.findOne({ owner: req.user._id });
    if (!hall) {
      return res.status(404).json({
        success: false,
        message: 'Hall not found',
      });
    }

    const updateData = { ...req.body };

    // Update coordinates if address changed or if coordinates are missing
    const addressChanged = updateData.address && 
      updateData.address.fullAddress && 
      updateData.address.fullAddress !== hall.address?.fullAddress;
    
    const needsGeocoding = !hall.location?.coordinates || 
      !hall.location.coordinates[0] || 
      !hall.location.coordinates[1] ||
      (hall.location.coordinates[0] === 0 && hall.location.coordinates[1] === 0);

    if (addressChanged || needsGeocoding) {
      const addressToGeocode = updateData.address?.fullAddress || hall.address?.fullAddress;
      if (addressToGeocode) {
        try {
          const coords = await getCoordinatesFromAddress(addressToGeocode);
          updateData.location = {
            type: 'Point',
            coordinates: [coords.lng, coords.lat],
          };
          console.log(`Geocoded hall update: ${hall.name} - ${addressToGeocode}`);
        } catch (error) {
          console.error('Geocoding error:', error);
          // Don't fail the update if geocoding fails
        }
      }
    }

    Object.assign(hall, updateData);
    hall.updatedAt = new Date();
    await hall.save();

    res.json({
      success: true,
      message: 'Hall updated successfully',
      data: hall,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update hall',
    });
  }
};

// Hall owner - Upload photos
exports.uploadPhotos = async (req, res) => {
  try {
    const hall = await Hall.findOne({ owner: req.user._id });
    if (!hall) {
      return res.status(404).json({
        success: false,
        message: 'Hall not found',
      });
    }

    const files = req.files || [];
    const newPhotos = files.map((file) => ({
      url: file.url || file.cloudinary?.url || file.path,
      publicId: file.publicId || file.cloudinary?.publicId || file.filename,
    }));

    hall.photos = [...hall.photos, ...newPhotos];
    await hall.save();

    res.json({
      success: true,
      message: 'Photos uploaded successfully',
      data: hall.photos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload photos',
    });
  }
};

// Hall owner - Upload videos
exports.uploadVideos = async (req, res) => {
  try {
    const hall = await Hall.findOne({ owner: req.user._id });
    if (!hall) {
      return res.status(404).json({
        success: false,
        message: 'Hall not found',
      });
    }

    const files = req.files || [];
    const newVideos = files.map((file) => ({
      url: file.url || file.cloudinary?.url || file.path,
      publicId: file.publicId || file.cloudinary?.publicId || file.filename,
    }));

    hall.videos = [...hall.videos, ...newVideos];
    await hall.save();

    res.json({
      success: true,
      message: 'Videos uploaded successfully',
      data: hall.videos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload videos',
    });
  }
};

// Hall owner - Delete photo
exports.deletePhoto = async (req, res) => {
  try {
    const { photoId } = req.params;
    const hall = await Hall.findOne({ owner: req.user._id });
    if (!hall) {
      return res.status(404).json({
        success: false,
        message: 'Hall not found',
      });
    }

    hall.photos = hall.photos.filter((photo) => photo._id.toString() !== photoId);
    await hall.save();

    res.json({
      success: true,
      message: 'Photo deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete photo',
    });
  }
};

// Hall owner - Delete video
exports.deleteVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const hall = await Hall.findOne({ owner: req.user._id });
    if (!hall) {
      return res.status(404).json({
        success: false,
        message: 'Hall not found',
      });
    }

    hall.videos = hall.videos.filter((video) => video._id.toString() !== videoId);
    await hall.save();

    res.json({
      success: true,
      message: 'Video deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete video',
    });
  }
};

// Get top/latest halls for homepage
exports.getTopHalls = async (req, res) => {
  try {
    const { limit = 6, lat, lng } = req.query;

    let query = { isActive: true };
    
    // Ensure halls have coordinates
    await ensureHallCoordinates(query);
    
    let halls;

    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);

      // Use aggregate for geospatial query with distance
      const pipeline = [
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [userLng, userLat],
            },
            distanceField: 'distance',
            maxDistance: 50000, // 50km
            spherical: true,
            query: {
              ...query,
              location: { $exists: true },
              'location.coordinates': { $exists: true, $size: 2 },
            },
          },
        },
        { $lookup: { from: 'users', localField: 'owner', foreignField: '_id', as: 'owner' } },
        { $unwind: { path: '$owner', preserveNullAndEmptyArrays: true } },
        { $project: { 'owner.password': 0, 'owner.otp': 0 } },
        { $sort: { rating: -1, createdAt: -1, distance: 1 } },
        { $limit: parseInt(limit) },
      ];

      halls = await Hall.aggregate(pipeline);
      halls = await Hall.populate(halls, { path: 'owner', select: 'email profile' });
    } else {
      halls = await Hall.find(query)
        .populate('owner', 'email profile')
        .sort({ rating: -1, createdAt: -1 })
        .limit(parseInt(limit));
    }

    res.json({
      success: true,
      data: halls,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch top halls',
    });
  }
};

// Hall owner - Upload banner
exports.uploadBanner = async (req, res) => {
  try {
    const hall = await Hall.findOne({ owner: req.user._id });
    if (!hall) {
      return res.status(404).json({
        success: false,
        message: 'Hall not found',
      });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Banner image is required',
      });
    }

    hall.banner = {
      url: file.url || file.cloudinary?.url || file.path,
      publicId: file.publicId || file.cloudinary?.publicId || file.filename,
    };
    await hall.save();

    res.json({
      success: true,
      message: 'Banner uploaded successfully',
      data: hall.banner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload banner',
    });
  }
};

// Hall owner - Reorder gallery photos
exports.reorderPhotos = async (req, res) => {
  try {
    const { photoIds } = req.body; // Array of photo IDs in new order
    const hall = await Hall.findOne({ owner: req.user._id });
    if (!hall) {
      return res.status(404).json({
        success: false,
        message: 'Hall not found',
      });
    }

    if (!Array.isArray(photoIds)) {
      return res.status(400).json({
        success: false,
        message: 'photoIds must be an array',
      });
    }

    // Reorder photos based on provided IDs
    const reorderedPhotos = photoIds
      .map(id => hall.photos.find(p => p._id.toString() === id))
      .filter(Boolean);

    // Add any photos not in the reorder list at the end
    const remainingPhotos = hall.photos.filter(
      p => !photoIds.includes(p._id.toString())
    );
    hall.photos = [...reorderedPhotos, ...remainingPhotos];
    await hall.save();

    res.json({
      success: true,
      message: 'Photos reordered successfully',
      data: hall.photos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reorder photos',
    });
  }
};

// Hall owner - Get analytics
exports.getHallAnalytics = async (req, res) => {
  try {
    const hall = await Hall.findOne({ owner: req.user._id });
    if (!hall) {
      return res.status(404).json({
        success: false,
        message: 'Hall not found',
      });
    }

    const Booking = require('../models/Booking');
    const Transaction = require('../models/Transaction');

    // Get booking statistics
    const totalBookings = await Booking.countDocuments({ hall: hall._id });
    const confirmedBookings = await Booking.countDocuments({ 
      hall: hall._id, 
      status: 'confirmed' 
    });
    const pendingBookings = await Booking.countDocuments({ 
      hall: hall._id, 
      status: 'pending' 
    });

    // Get revenue
    const bookings = await Booking.find({ 
      hall: hall._id, 
      status: 'confirmed' 
    }).populate('payment');
    
    const totalRevenue = bookings.reduce((sum, booking) => {
      return sum + (booking.totalAmount || 0);
    }, 0);

    // Get monthly bookings
    const monthlyBookings = await Booking.aggregate([
      { $match: { hall: hall._id } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get popular dates
    const popularDates = await Booking.aggregate([
      { $match: { hall: hall._id, status: 'confirmed' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$eventDate' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      data: {
        bookings: {
          total: totalBookings,
          confirmed: confirmedBookings,
          pending: pendingBookings,
        },
        revenue: {
          total: totalRevenue,
          byMonth: monthlyBookings,
        },
        popularDates,
        rating: hall.rating,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch analytics',
    });
  }
};

// Get available dates for a hall (public)
exports.getHallAvailableDates = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const hall = await Hall.findById(id);
    if (!hall || !hall.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Hall not found',
      });
    }

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days from now

    // Get all booked dates (handle undefined)
    const bookedDates = (hall.bookedDates || []).map(bd => {
      const date = new Date(bd.date);
      return date.toISOString().split('T')[0];
    });

    // Get all blocked dates (handle undefined)
    const blockedDates = (hall.blockedDates || []).map(bd => {
      const date = new Date(bd.date);
      return date.toISOString().split('T')[0];
    });

    // Get all available dates (if explicitly set, handle undefined)
    const availableDates = (hall.availableDates || []).map(ad => {
      const date = new Date(ad.date);
      return date.toISOString().split('T')[0];
    });

    // Generate date range
    const dates = [];
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const isBooked = bookedDates.includes(dateStr);
      const isBlocked = blockedDates.includes(dateStr);
      const isAvailable = availableDates.includes(dateStr);

      // If hall has explicit available dates, only those are available
      // Otherwise, all dates except booked/blocked are available
      let available = false;
      if (availableDates.length > 0) {
        available = isAvailable && !isBooked && !isBlocked;
      } else {
        available = !isBooked && !isBlocked;
      }

      dates.push({
        date: dateStr,
        available,
        booked: isBooked,
        blocked: isBlocked,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Set headers to prevent caching
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.json({
      success: true,
      data: dates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch available dates',
    });
  }
};

// Hall owner - Manage availability (block/unblock dates)
exports.manageHallAvailability = async (req, res) => {
  try {
    const { action, dates, reason } = req.body; // action: 'block' or 'unblock'

    const hall = await Hall.findOne({ owner: req.user._id });
    if (!hall) {
      return res.status(404).json({
        success: false,
        message: 'Hall not found',
      });
    }

    if (!Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Dates array is required',
      });
    }

    // Ensure blockedDates array exists
    if (!hall.blockedDates) {
      hall.blockedDates = [];
    }

    if (action === 'block') {
      // Add dates to blockedDates
      dates.forEach(dateStr => {
        const date = new Date(dateStr);
        // Check if already blocked
        const exists = (hall.blockedDates || []).some(
          bd => new Date(bd.date).toISOString().split('T')[0] === dateStr
        );
        if (!exists) {
          hall.blockedDates.push({
            date,
            reason: reason || 'Blocked by owner',
            blockedBy: 'owner',
          });
        }
      });
    } else if (action === 'unblock') {
      // Remove dates from blockedDates
      hall.blockedDates = (hall.blockedDates || []).filter(
        bd => !dates.includes(new Date(bd.date).toISOString().split('T')[0])
      );
    } else if (action === 'mark-booked') {
      // Mark dates as booked (manually by owner)
      // Ensure bookedDates array exists
      if (!hall.bookedDates) {
        hall.bookedDates = [];
      }
      dates.forEach(dateStr => {
        const date = new Date(dateStr);
        // Check if already booked
        const exists = (hall.bookedDates || []).some(
          bd => new Date(bd.date).toISOString().split('T')[0] === dateStr
        );
        if (!exists) {
          hall.bookedDates.push({
            date,
            bookingId: null, // Manual booking, no booking ID
          });
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Use "block", "unblock", or "mark-booked"',
      });
    }

    await hall.save();

    res.json({
      success: true,
      message: `Dates ${action}ed successfully`,
      data: {
        blockedDates: hall.blockedDates,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to manage availability',
    });
  }
};

// Hall owner - Set available dates
exports.setHallAvailableDates = async (req, res) => {
  try {
    const { dates } = req.body; // Array of { date: 'YYYY-MM-DD', slots: [{ startTime, endTime, price }] }

    const hall = await Hall.findOne({ owner: req.user._id });
    if (!hall) {
      return res.status(404).json({
        success: false,
        message: 'Hall not found',
      });
    }

    if (!Array.isArray(dates)) {
      return res.status(400).json({
        success: false,
        message: 'Dates array is required',
      });
    }

    // Ensure availableDates array exists
    if (!hall.availableDates) {
      hall.availableDates = [];
    }

    // Clear existing available dates and set new ones
    hall.availableDates = dates.map(item => ({
      date: new Date(item.date),
      slots: item.slots || [],
    }));

    await hall.save();

    res.json({
      success: true,
      message: 'Available dates updated successfully',
      data: {
        availableDates: hall.availableDates,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to set available dates',
    });
  }
};

// Hall owner - Get availability calendar
exports.getHallAvailabilityCalendar = async (req, res) => {
  try {
    const hall = await Hall.findOne({ owner: req.user._id });
    if (!hall) {
      return res.status(404).json({
        success: false,
        message: 'Hall not found',
      });
    }

    // Set headers to prevent caching
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.json({
      success: true,
      data: {
        bookedDates: hall.bookedDates || [],
        blockedDates: hall.blockedDates || [],
        availableDates: hall.availableDates || [],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch availability calendar',
    });
  }
};

