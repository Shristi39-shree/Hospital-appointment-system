const mongoose = require('mongoose');

/**
 * Time Slot Subschema - Represents an available appointment slot.
 */
const TimeSlotSchema = new mongoose.Schema({
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  startTime: {
    type: String, // Format: HH:mm (24h)
    required: true
  },
  endTime: {
    type: String, // Format: HH:mm (24h)
    required: true
  },
  isBooked: {
    type: Boolean,
    default: false
  }
});

/**
 * Doctor Schema - Extended profile for users registered as Doctors.
 */
const DoctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  specialty: {
    type: String,
    required: [true, 'Please specify doctor specialty'],
    enum: [
      'Cardiology',
      'Dermatology',
      'Neurology',
      'Pediatrics',
      'Orthopedics',
      'General Medicine',
      'Ophthalmology',
      'Psychiatry',
      'ENT'
    ]
  },
  qualifications: {
    type: String,
    required: true,
    default: 'MBBS, MD'
  },
  experienceYears: {
    type: Number,
    required: true,
    default: 5
  },
  consultationFee: {
    type: Number,
    required: true,
    default: 50
  },
  bio: {
    type: String,
    default: 'Dedicated medical specialist with extensive experience in patient care.'
  },
  availableSlots: [TimeSlotSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Doctor', DoctorSchema);
