const ServiceProvider = require('../models/ServiceProvider');
const { paginate, paginateResponse } = require('../utils/pagination');

// Get all service providers by category
exports.getServiceProviders = async (req, res) => {
  try {
    const { category, city, page = 1, limit = 10 } = req.query;
    const { skip, limit: limitNum } = paginate(page, limit);

    const query = { isActive: true };
    if (category) query.category = category;
    if (city) query.city = new RegExp(city, 'i');

    const serviceProviders = await ServiceProvider.find(query)
      .populate('user', 'email profile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await ServiceProvider.countDocuments(query);

    res.json({
      success: true,
      ...paginateResponse(serviceProviders, page, limitNum, total),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch service providers',
    });
  }
};

// Get service providers by category (for recommendations after booking)
exports.getServiceProvidersByCategory = async (req, res) => {
  try {
    const { categories } = req.query; // comma-separated categories
    const categoryList = categories ? categories.split(',') : [];

    const query = { isActive: true };
    if (categoryList.length > 0) {
      query.category = { $in: categoryList };
    }

    const serviceProviders = await ServiceProvider.find(query)
      .populate('user', 'email profile')
      .limit(20);

    res.json({
      success: true,
      data: serviceProviders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch service providers',
    });
  }
};

// Get single service provider
exports.getServiceProviderById = async (req, res) => {
  try {
    const serviceProvider = await ServiceProvider.findById(req.params.id)
      .populate('user', 'email profile');

    if (!serviceProvider) {
      return res.status(404).json({
        success: false,
        message: 'Service provider not found',
      });
    }

    res.json({
      success: true,
      data: serviceProvider,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch service provider',
    });
  }
};

// Service provider - Get own profile
exports.getMyProfile = async (req, res) => {
  try {
    const serviceProvider = await ServiceProvider.findOne({ user: req.user._id })
      .populate('user', 'email profile');

    if (!serviceProvider) {
      return res.status(404).json({
        success: false,
        message: 'Service provider profile not found',
      });
    }

    res.json({
      success: true,
      data: serviceProvider,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch profile',
    });
  }
};

// Service provider - Update profile
exports.updateProfile = async (req, res) => {
  try {
    const serviceProvider = await ServiceProvider.findOne({ user: req.user._id });
    if (!serviceProvider) {
      return res.status(404).json({
        success: false,
        message: 'Service provider profile not found',
      });
    }

    Object.assign(serviceProvider, req.body);
    serviceProvider.updatedAt = new Date();
    await serviceProvider.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: serviceProvider,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile',
    });
  }
};

// Service provider - Upload portfolio
exports.uploadPortfolio = async (req, res) => {
  try {
    const serviceProvider = await ServiceProvider.findOne({ user: req.user._id });
    if (!serviceProvider) {
      return res.status(404).json({
        success: false,
        message: 'Service provider profile not found',
      });
    }

    const files = req.files || [];
    const newPortfolio = files.map((file) => ({
      url: file.url || file.cloudinary?.url || file.path,
      publicId: file.publicId || file.cloudinary?.publicId || file.filename,
      type: file.mimetype?.startsWith('video') ? 'video' : 'image',
    }));

    serviceProvider.portfolio = [...serviceProvider.portfolio, ...newPortfolio];
    await serviceProvider.save();

    res.json({
      success: true,
      message: 'Portfolio uploaded successfully',
      data: serviceProvider.portfolio,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload portfolio',
    });
  }
};

