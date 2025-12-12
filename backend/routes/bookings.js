const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validateBookingCreate } = require('../validators/bookingValidator');
const { uploadSingleToCloudinary } = require('../utils/upload');

// Customer routes
router.use(authenticate);

router.post('/', authorize('customer'), uploadSingleToCloudinary('idProof', 'hall-booking/id-proofs'), validateBookingCreate, bookingController.createBooking);
router.get('/my', authorize('customer'), bookingController.getMyBookings);
router.get('/my/:id', authorize('customer'), bookingController.getBookingById);
router.put('/my/:bookingId/cancel', authorize('customer'), bookingController.cancelBooking);

// Hall owner routes
router.get('/hall/my', authorize('hall'), bookingController.getHallBookings);
router.get('/hall/:id', authorize('hall'), bookingController.getBookingById);
router.put('/hall/:bookingId/approval', authorize('hall'), bookingController.updateBookingApproval);

// Admin routes
router.get('/all', authorize('admin'), bookingController.getAllBookings);

module.exports = router;

