const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');

dotenv.config();

/**
 * Seeder Script - Populates MongoDB database with sample Patients, Doctors, and Time Slots.
 */
const seedData = async () => {
  try {
    await connectDB();

    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Appointment.deleteMany({});

    console.log('👤 Creating sample users (Patients & Doctors)...');

    // 1. Create Patient
    const patientUser = await User.create({
      name: 'Sarah Connor',
      email: 'patient@example.com',
      password: 'password123',
      role: 'patient',
      phone: '+1 (555) 019-2831'
    });

    const secondPatient = await User.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'password123',
      role: 'patient',
      phone: '+1 (555) 014-9982'
    });

    // 2. Sample Doctors data definition
    const sampleDoctors = [
      {
        name: 'Dr. Robert Chen',
        email: 'dr.chen@hospital.com',
        password: 'password123',
        phone: '+1 (555) 012-3456',
        specialty: 'Cardiology',
        qualifications: 'MD, FACC (Harvard Medical School)',
        experienceYears: 14,
        consultationFee: 120,
        bio: 'Leading cardiologist specializing in preventive heart health and non-invasive procedures.'
      },
      {
        name: 'Dr. Emily Watson',
        email: 'dr.watson@hospital.com',
        password: 'password123',
        phone: '+1 (555) 013-4567',
        specialty: 'Dermatology',
        qualifications: 'MD, FAAD (Johns Hopkins University)',
        experienceYears: 9,
        consultationFee: 95,
        bio: 'Expert dermatologist focused on cosmetic, surgical, and pediatric skin therapies.'
      },
      {
        name: 'Dr. Michael Vance',
        email: 'dr.vance@hospital.com',
        password: 'password123',
        phone: '+1 (555) 014-5678',
        specialty: 'Pediatrics',
        qualifications: 'MD, FAAP (Stanford Medicine)',
        experienceYears: 11,
        consultationFee: 80,
        bio: 'Compassionate pediatrician dedicated to child development and wellness checkups.'
      },
      {
        name: 'Dr. Priya Sharma',
        email: 'dr.sharma@hospital.com',
        password: 'password123',
        phone: '+1 (555) 015-6789',
        specialty: 'Neurology',
        qualifications: 'MD, DM Neurology (Mayo Clinic)',
        experienceYears: 16,
        consultationFee: 150,
        bio: 'Consultant neurologist with deep expertise in stroke care, migraine management, and epilepsy.'
      }
    ];

    // Generate dynamic dates (today, tomorrow, day after tomorrow)
    const today = new Date();
    const getDateString = (offsetDays) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offsetDays);
      return d.toISOString().split('T')[0]; // YYYY-MM-DD
    };

    const date1 = getDateString(1);
    const date2 = getDateString(2);
    const date3 = getDateString(3);

    for (const docData of sampleDoctors) {
      const user = await User.create({
        name: docData.name,
        email: docData.email,
        password: docData.password,
        role: 'doctor',
        phone: docData.phone
      });

      await Doctor.create({
        userId: user._id,
        specialty: docData.specialty,
        qualifications: docData.qualifications,
        experienceYears: docData.experienceYears,
        consultationFee: docData.consultationFee,
        bio: docData.bio,
        availableSlots: [
          { date: date1, startTime: '09:00', endTime: '09:30', isBooked: false },
          { date: date1, startTime: '10:00', endTime: '10:30', isBooked: false },
          { date: date1, startTime: '11:00', endTime: '11:30', isBooked: false },
          { date: date2, startTime: '14:00', endTime: '14:30', isBooked: false },
          { date: date2, startTime: '15:00', endTime: '15:30', isBooked: false },
          { date: date3, startTime: '16:00', endTime: '16:30', isBooked: false }
        ]
      });
    }

    console.log('✅ Seed successful!');
    console.log('----------------------------------------------------');
    console.log('Sample Patient Credentials:');
    console.log('  Email:    patient@example.com');
    console.log('  Password: password123');
    console.log('Sample Doctor Credentials:');
    console.log('  Email:    dr.chen@hospital.com');
    console.log('  Password: password123');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
