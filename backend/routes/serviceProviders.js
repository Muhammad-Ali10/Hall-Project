const express = require('express');
const router = express.Router();
const serviceProviderController = require('../controllers/serviceProviderController');
const { authenticate, authorize } = require('../middlewares/auth');
const { uploadMultipleToCloudinary } = require('../utils/upload');

// Public routes
router.get('/', serviceProviderController.getServiceProviders);
router.get('/by-category', serviceProviderController.getServiceProvidersByCategory);
router.get('/:id', serviceProviderController.getServiceProviderById);

// Service provider routes
router.use(authenticate);
router.use(authorize('serviceProvider'));

router.get('/my/profile', serviceProviderController.getMyProfile);
router.put('/my/profile', serviceProviderController.updateProfile);
router.post('/my/portfolio', uploadMultipleToCloudinary('portfolio', 20, 'service-providers/portfolio'), serviceProviderController.uploadPortfolio);

module.exports = router;

