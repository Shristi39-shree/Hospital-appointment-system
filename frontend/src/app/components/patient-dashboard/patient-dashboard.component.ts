import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorService } from '../../services/doctor.service';
import { AppointmentService } from '../../services/appointment.service';
import { NotificationService } from '../../services/notification.service';
import { Doctor, TimeSlot } from '../../models/doctor.model';
import { Appointment } from '../../models/appointment.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.css']
})
export class PatientDashboardComponent implements OnInit {
  // Doctor Search & List State
  doctors: Doctor[] = [];
  searchTerm: string = '';
  selectedSpecialty: string = 'All';
  specialties: string[] = [
    'All',
    'Cardiology',
    'Dermatology',
    'Neurology',
    'Pediatrics',
    'Orthopedics',
    'General Medicine',
    'Ophthalmology',
    'Psychiatry',
    'ENT'
  ];
  doctorsPage: number = 1;
  doctorsTotalPages: number = 1;
  doctorsTotal: number = 0;
  isDoctorsLoading: boolean = false;

  // Booking Modal State
  selectedDoctor: Doctor | null = null;
  selectedSlot: TimeSlot | null = null;
  bookingReason: string = 'General Health Consultation';
  isBookingModalOpen: boolean = false;
  isSubmittingBooking: boolean = false;

  // Patient Appointments State
  appointments: Appointment[] = [];
  appointmentStatusFilter: string = 'All';
  appointmentsPage: number = 1;
  appointmentsTotalPages: number = 1;
  appointmentsTotal: number = 0;
  isAppointmentsLoading: boolean = false;

  patientName: string = '';

  constructor(
    private doctorService: DoctorService,
    private appointmentService: AppointmentService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.patientName = user.name;
    }
    this.loadDoctors();
    this.loadAppointments();
  }

  // Helper method for resolving doctor name safely in Angular templates
  getDoctorName(userObj: any): string {
    if (userObj && typeof userObj === 'object' && userObj.name) {
      return userObj.name;
    }
    return 'Dr. Specialist';
  }

  // Load Doctors with Filter & Pagination
  loadDoctors(): void {
    this.isDoctorsLoading = true;
    this.doctorService.getDoctors(this.searchTerm, this.selectedSpecialty, this.doctorsPage, 6)
      .subscribe({
        next: (res) => {
          this.doctors = res.doctors;
          this.doctorsTotalPages = res.pages || 1;
          this.doctorsTotal = res.total || 0;
          this.isDoctorsLoading = false;
        },
        error: (err) => {
          this.isDoctorsLoading = false;
          this.notificationService.showError('Failed to load doctors list.');
        }
      });
  }

  onSearchChange(): void {
    this.doctorsPage = 1;
    this.loadDoctors();
  }

  onSpecialtyChange(): void {
    this.doctorsPage = 1;
    this.loadDoctors();
  }

  changeDoctorPage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.doctorsTotalPages) {
      this.doctorsPage = newPage;
      this.loadDoctors();
    }
  }

  // Open Booking Modal for selected Doctor
  openBookingModal(doctor: Doctor): void {
    this.selectedDoctor = doctor;
    this.selectedSlot = null;
    this.bookingReason = 'General Health Consultation';
    this.isBookingModalOpen = true;
  }

  closeBookingModal(): void {
    this.isBookingModalOpen = false;
    this.selectedDoctor = null;
    this.selectedSlot = null;
  }

  selectSlot(slot: TimeSlot): void {
    if (slot.isBooked) {
      this.notificationService.showError('This slot is already booked.');
      return;
    }
    this.selectedSlot = slot;
  }

  confirmBooking(): void {
    if (!this.selectedDoctor || !this.selectedSlot) {
      this.notificationService.showError('Please select an available time slot.');
      return;
    }

    this.isSubmittingBooking = true;

    this.appointmentService.bookAppointment({
      doctorId: this.selectedDoctor._id,
      date: this.selectedSlot.date,
      startTime: this.selectedSlot.startTime,
      endTime: this.selectedSlot.endTime,
      reason: this.bookingReason
    }).subscribe({
      next: (res) => {
        this.isSubmittingBooking = false;
        this.notificationService.showSuccess(res.message || 'Appointment booked successfully!');
        this.closeBookingModal();
        this.loadDoctors(); // Refresh slots
        this.loadAppointments(); // Refresh appointment history
      },
      error: (err) => {
        this.isSubmittingBooking = false;
        const errorMsg = err.error?.message || 'Double booking error: slot no longer available.';
        this.notificationService.showError(errorMsg);
      }
    });
  }

  // Load Patient Appointments History
  loadAppointments(): void {
    this.isAppointmentsLoading = true;
    this.appointmentService.getAppointments(this.appointmentStatusFilter, this.appointmentsPage, 5)
      .subscribe({
        next: (res) => {
          this.appointments = res.appointments;
          this.appointmentsTotalPages = res.pages || 1;
          this.appointmentsTotal = res.total || 0;
          this.isAppointmentsLoading = false;
        },
        error: (err) => {
          this.isAppointmentsLoading = false;
          this.notificationService.showError('Failed to fetch appointment history.');
        }
      });
  }

  onAppointmentFilterChange(): void {
    this.appointmentsPage = 1;
    this.loadAppointments();
  }

  changeAppointmentPage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.appointmentsTotalPages) {
      this.appointmentsPage = newPage;
      this.loadAppointments();
    }
  }

  // Cancel Appointment
  cancelAppointment(appointmentId: string): void {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    this.appointmentService.cancelAppointment(appointmentId).subscribe({
      next: (res) => {
        this.notificationService.showSuccess('Appointment cancelled successfully.');
        this.loadAppointments();
        this.loadDoctors();
      },
      error: (err) => {
        this.notificationService.showError(err.error?.message || 'Failed to cancel appointment.');
      }
    });
  }

  getAvailableSlotsCount(slots: TimeSlot[]): number {
    if (!slots) return 0;
    return slots.filter(s => !s.isBooked).length;
  }
}
