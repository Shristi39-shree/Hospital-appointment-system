const mongoose = require('mongoose');

/**
 * Appointment Schema - Stores booked appointments between Patients and Doctors.
 */
const AppointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: [true, 'Appointment date is required']
  },
  timeSlot: {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  reason: {
    type: String,
    default: 'General Consultation'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

/**
 * Compound unique index to prevent double booking the exact same doctor slot on the same date.
 * Excludes cancelled appointments so that cancelled slots can be re-booked.
 */
AppointmentSchema.index(
  { doctorId: 1, date: 1, 'timeSlot.startTime': 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $ne: 'Cancelled' } }
  }
);

module.exports = mongoose.model('Appointment', AppointmentSchema);
