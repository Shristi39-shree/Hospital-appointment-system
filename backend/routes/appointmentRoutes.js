const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getAppointments,
  cancelAppointment,
  updateAppointmentStatus
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect); // All appointment routes require authentication

router.post('/', authorize('patient'), bookAppointment);
router.get('/', getAppointments);
router.put('/:id/cancel', cancelAppointment);
router.put('/:id/status', authorize('doctor'), updateAppointmentStatus);

module.exports = router;
