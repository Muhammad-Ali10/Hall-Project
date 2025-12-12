const express = require('express');
const router = express.Router();
const hallController = require('../controllers/hallController');
const { authenticate, authorize, requireHallApproval } = require('../middlewares/auth');
const { validateHallSearch, validateHallUpdate } = require('../validators/hallValidator');
const { uploadMultipleToCloudinary, uploadSingleToCloudinary } = require('../utils/upload');

// Public routes
router.get('/top', hallController.getTopHalls);
router.get('/', validateHallSearch, hallController.getAllHalls);
router.get('/:id', hallController.getHallById);
router.get('/:id/available-dates', hallController.getHallAvailableDates);

// Hall owner routes
router.use(authenticate);
router.use(authorize('hall'));
router.use(requireHallApproval);

router.get('/my/hall', hallController.getMyHall);
router.put('/my/hall', validateHallUpdate, hallController.updateHall);
router.post('/my/hall/banner', uploadSingleToCloudinary('banner', 'hall-booking/banners'), hallController.uploadBanner);
router.post('/my/hall/photos', uploadMultipleToCloudinary('photos', 10, 'hall-booking/photos'), hallController.uploadPhotos);
router.post('/my/hall/videos', uploadMultipleToCloudinary('videos', 5, 'hall-booking/videos'), hallController.uploadVideos);
router.put('/my/hall/photos/reorder', hallController.reorderPhotos);
router.delete('/my/hall/photos/:photoId', hallController.deletePhoto);
router.delete('/my/hall/videos/:videoId', hallController.deleteVideo);
router.get('/my/hall/analytics', hallController.getHallAnalytics);
router.get('/my/hall/availability', hallController.getHallAvailabilityCalendar);
router.post('/my/hall/availability', hallController.manageHallAvailability);
router.put('/my/hall/available-dates', hallController.setHallAvailableDates);

module.exports = router;

