const Doctor = require('../models/Doctor');
const User = require('../models/User');

/**
 * @desc    Get all doctors with search, specialty filtering, and pagination
 * @route   GET /api/doctors
 * @access  Public
 */
exports.getAllDoctors = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const { search, specialty } = req.query;

    let query = {};
    if (specialty && specialty !== 'All') {
      query.specialty = specialty;
    }

    // Populate user name/email for text search or response building
    let doctors = await Doctor.find(query)
      .populate('userId', 'name email phone')
      .lean();

    // Filter by doctor name if search query is provided
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      doctors = doctors.filter(doc => 
        doc.userId && (searchRegex.test(doc.userId.name) || searchRegex.test(doc.specialty))
      );
    }

    const total = doctors.length;
    const paginatedDoctors = doctors.slice(skip, skip + limit);

    res.status(200).json({
      success: true,
      count: paginatedDoctors.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      doctors: paginatedDoctors
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch doctors list.' });
  }
};

/**
 * @desc    Get single doctor profile by ID
 * @route   GET /api/doctors/:id
 * @access  Public
 */
exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('userId', 'name email phone');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }
    res.status(200).json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving doctor details.' });
  }
};

/**
 * @desc    Get doctor profile for currently logged-in doctor user
 * @route   GET /api/doctors/profile/me
 * @access  Private (Doctor)
 */
exports.getMyProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id }).populate('userId', 'name email phone');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found for this account.' });
    }
    res.status(200).json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving doctor profile.' });
  }
};

/**
 * @desc    Add available time slot(s) for a doctor
 * @route   POST /api/doctors/slots
 * @access  Private (Doctor)
 */
exports.addTimeSlot = async (req, res) => {
  try {
    const { date, startTime, endTime } = req.body;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Please provide date, startTime, and endTime.' });
    }

    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    // Check for duplicate slot on the same date and start time
    const duplicate = doctor.availableSlots.find(
      slot => slot.date === date && slot.startTime === startTime
    );

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: `Time slot starting at ${startTime} on ${date} already exists.`
      });
    }

    doctor.availableSlots.push({
      date,
      startTime,
      endTime,
      isBooked: false
    });

    // Sort slots by date and startTime
    doctor.availableSlots.sort((a, b) => {
      if (a.date === b.date) {
        return a.startTime.localeCompare(b.startTime);
      }
      return a.date.localeCompare(b.date);
    });

    await doctor.save();

    res.status(201).json({
      success: true,
      message: 'Time slot added successfully.',
      availableSlots: doctor.availableSlots
    });
  } catch (error) {
    console.error('Error adding slot:', error);
    res.status(500).json({ success: false, message: 'Failed to add time slot.' });
  }
};

/**
 * @desc    Remove an unbooked time slot
 * @route   DELETE /api/doctors/slots/:slotId
 * @access  Private (Doctor)
 */
exports.removeTimeSlot = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    const slot = doctor.availableSlots.id(req.params.slotId);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Time slot not found.' });
    }

    if (slot.isBooked) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a slot that is currently booked by a patient. Please cancel the appointment first.'
      });
    }

    doctor.availableSlots.pull(req.params.slotId);
    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Time slot removed successfully.',
      availableSlots: doctor.availableSlots
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete time slot.' });
  }
};
