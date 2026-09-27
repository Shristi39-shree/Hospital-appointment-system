const express = require('express');
const router = express.Router();
const {
  getAllDoctors,
  getDoctorById,
  getMyProfile,
  addTimeSlot,
  removeTimeSlot
} = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public doctor discovery routes
router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);

// Protected doctor management routes
router.get('/profile/me', protect, authorize('doctor'), getMyProfile);
router.post('/slots', protect, authorize('doctor'), addTimeSlot);
router.delete('/slots/:slotId', protect, authorize('doctor'), removeTimeSlot);

module.exports = router;
