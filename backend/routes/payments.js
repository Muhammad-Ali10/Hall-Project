const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate, authorize } = require('../middlewares/auth');

// Customer routes
router.use(authenticate);
router.use(authorize('customer'));

router.post('/:bookingId/order', paymentController.createPaymentOrder);
router.post('/:bookingId/verify', paymentController.verifyPayment);
router.post('/:bookingId/test', paymentController.createTestPayment);
router.get('/:bookingId/status', paymentController.getPaymentStatus);

// Webhook (no auth required, uses signature verification)
router.post('/webhook', paymentController.paymentWebhook);

module.exports = router;

