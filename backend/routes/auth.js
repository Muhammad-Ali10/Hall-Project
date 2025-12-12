const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const {
  validateCustomerOTPLogin,
  validateOTPVerification,
  validateHallRegistration,
  validateHallLogin,
  validateServiceProviderRegistration,
} = require('../validators/authValidator');

// Customer OTP Login
router.post('/customer/send-otp', validateCustomerOTPLogin, authController.sendCustomerOTP);
router.post('/customer/verify-otp', validateOTPVerification, authController.verifyCustomerOTP);

// Hall Owner Auth
const { uploadMultipleToCloudinary } = require('../utils/upload');
router.post('/hall/register', uploadMultipleToCloudinary('photos', 10, 'hall-booking/photos'), validateHallRegistration, authController.registerHall);
router.post('/hall/login', validateHallLogin, authController.loginHall);

// Service Provider Auth
const { uploadSingleToCloudinary } = require('../utils/upload');
router.post('/service-provider/register', uploadSingleToCloudinary('idProof', 'service-providers/id-proofs'), validateServiceProviderRegistration, authController.registerServiceProvider);
router.post('/service-provider/login', validateHallLogin, authController.loginServiceProvider);

// Admin Auth
router.post('/admin/login', validateHallLogin, authController.loginAdmin);

// Password Reset (Universal - works for all roles)
router.post('/password/reset/request', authController.requestPasswordReset);
router.post('/password/reset/verify', authController.resetPassword);

// Get current user
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router;

