const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

/**
 * @desc    Book an appointment (Patient)
 * @route   POST /api/appointments
 * @access  Private (Patient)
 */
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, startTime, endTime, reason } = req.body;

    if (!doctorId || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide doctorId, date, startTime, and endTime.'
      });
    }

    // 1. Verify doctor profile existence
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    // 2. Locate requested slot in doctor's schedule
    const slotIndex = doctor.availableSlots.findIndex(
      slot => slot.date === date && slot.startTime === startTime && slot.endTime === endTime
    );

    if (slotIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'The requested time slot is not offered by this doctor.'
      });
    }

    // 3. Prevent double booking check at slot level
    if (doctor.availableSlots[slotIndex].isBooked) {
      return res.status(400).json({
        success: false,
        message: 'This time slot has already been booked by another patient.'
      });
    }

    // 4. Mark slot as booked in Doctor document
    doctor.availableSlots[slotIndex].isBooked = true;
    await doctor.save();

    // 5. Create Appointment record
    try {
      const appointment = await Appointment.create({
        patientId: req.user._id,
        doctorId: doctor._id,
        date,
        timeSlot: { startTime, endTime },
        reason: reason || 'General Consultation',
        status: 'Pending'
      });

      const populatedAppointment = await Appointment.findById(appointment._id)
        .populate('patientId', 'name email phone')
        .populate({
          path: 'doctorId',
          populate: { path: 'userId', select: 'name email phone' }
        });

      return res.status(201).json({
        success: true,
        message: 'Appointment booked successfully!',
        appointment: populatedAppointment
      });
    } catch (dbError) {
      // Revert slot booking if appointment record creation failed (e.g. duplicate key violation)
      doctor.availableSlots[slotIndex].isBooked = false;
      await doctor.save();

      if (dbError.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Double Booking Conflict: This slot has already been reserved.'
        });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while booking appointment.'
    });
  }
};

/**
 * @desc    Get user appointments (Patient or Doctor) with pagination and status filter
 * @route   GET /api/appointments
 * @access  Private (Patient / Doctor)
 */
exports.getAppointments = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const { status } = req.query;
    let filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (req.user.role === 'patient') {
      filter.patientId = req.user._id;
    } else if (req.user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ userId: req.user._id });
      if (!doctorProfile) {
        return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
      }
      filter.doctorId = doctorProfile._id;
    }

    const total = await Appointment.countDocuments(filter);

    const appointments = await Appointment.find(filter)
      .populate('patientId', 'name email phone')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email phone' }
      })
      .sort({ date: -1, 'timeSlot.startTime': -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: appointments.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      appointments
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch appointments.' });
  }
};

/**
 * @desc    Cancel an appointment (Patient or Doctor)
 * @route   PUT /api/appointments/:id/cancel
 * @access  Private (Patient / Doctor)
 */
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    // Verify ownership
    if (req.user.role === 'patient' && appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this appointment.' });
    }

    if (appointment.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Appointment is already cancelled.' });
    }

    // Update appointment status
    appointment.status = 'Cancelled';
    await appointment.save();

    // Free up time slot on doctor profile
    const doctor = await Doctor.findById(appointment.doctorId);
    if (doctor) {
      const slotIndex = doctor.availableSlots.findIndex(
        slot => slot.date === appointment.date && slot.startTime === appointment.timeSlot.startTime
      );
      if (slotIndex !== -1) {
        doctor.availableSlots[slotIndex].isBooked = false;
        await doctor.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully.',
      appointment
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel appointment.' });
  }
};

/**
 * @desc    Update appointment status (Doctor only: Confirmed, Completed, Cancelled)
 * @route   PUT /api/appointments/:id/status
 * @access  Private (Doctor)
 */
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const allowedStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status provided.' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    // Ensure logged-in doctor owns this appointment
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor || appointment.doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this appointment.' });
    }

    appointment.status = status;
    if (notes !== undefined) {
      appointment.notes = notes;
    }

    await appointment.save();

    // If marked cancelled or completed, release or handle slot
    if (status === 'Cancelled') {
      const slotIndex = doctor.availableSlots.findIndex(
        slot => slot.date === appointment.date && slot.startTime === appointment.timeSlot.startTime
      );
      if (slotIndex !== -1) {
        doctor.availableSlots[slotIndex].isBooked = false;
        await doctor.save();
      }
    }

    res.status(200).json({
      success: true,
      message: `Appointment status updated to ${status}.`,
      appointment
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ success: false, message: 'Failed to update appointment status.' });
  }
};
