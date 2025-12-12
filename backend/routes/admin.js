const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middlewares/auth');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Hall owner management
router.get('/hall-owners', adminController.getHallOwners);
router.get('/halls/:hallId/review', adminController.getHallDetailsForReview);
router.put('/hall-owners/:userId/approval', adminController.updateHallApproval);

// Hall management
router.get('/halls', adminController.getAllHalls);
router.put('/halls/:hallId/block', adminController.blockHall);

// Service Provider management
router.get('/service-providers', adminController.getServiceProviders);
router.get('/service-providers/:serviceProviderId/review', adminController.getServiceProviderDetailsForReview);
router.put('/service-providers/:serviceProviderId/approval', adminController.updateServiceProviderApproval);

// User management
router.get('/users', adminController.getAllUsers);
router.put('/users/:userId/block', adminController.blockUser);
router.delete('/users/:userId', adminController.deleteUser);

// Booking management
router.get('/bookings', adminController.getAllBookings);

// Analytics
router.get('/analytics', adminController.getAnalytics);

module.exports = router;

