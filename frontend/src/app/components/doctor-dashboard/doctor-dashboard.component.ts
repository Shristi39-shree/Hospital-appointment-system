import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorService } from '../../services/doctor.service';
import { AppointmentService } from '../../services/appointment.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { Doctor, TimeSlot } from '../../models/doctor.model';
import { Appointment } from '../../models/appointment.model';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.css']
})
export class DoctorDashboardComponent implements OnInit {
  doctorProfile: Doctor | null = null;
  doctorName: string = '';
  isProfileLoading: boolean = false;

  // New Slot Form State
  newSlot = {
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Default tomorrow
    startTime: '09:00',
    endTime: '09:30'
  };
  isAddingSlot: boolean = false;

  // Appointments Management State
  appointments: Appointment[] = [];
  statusFilter: string = 'All';
  appointmentsPage: number = 1;
  appointmentsTotalPages: number = 1;
  appointmentsTotal: number = 0;
  isAppointmentsLoading: boolean = false;

  // Status Update Modal
  selectedAppointment: Appointment | null = null;
  newStatus: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' = 'Confirmed';
  doctorNotes: string = '';
  isStatusModalOpen: boolean = false;
  isUpdatingStatus: boolean = false;

  constructor(
    private doctorService: DoctorService,
    private appointmentService: AppointmentService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.doctorName = user.name;
    }
    this.loadDoctorProfile();
    this.loadAppointments();
  }

  // Template helper functions for patient property resolution
  getPatientName(patientObj: any): string {
    if (patientObj && typeof patientObj === 'object' && patientObj.name) {
      return patientObj.name;
    }
    return 'Patient';
  }

  getPatientEmail(patientObj: any): string {
    if (patientObj && typeof patientObj === 'object' && patientObj.email) {
      return patientObj.email;
    }
    return 'N/A';
  }

  getPatientPhone(patientObj: any): string {
    if (patientObj && typeof patientObj === 'object' && patientObj.phone) {
      return patientObj.phone;
    }
    return '';
  }

  loadDoctorProfile(): void {
    this.isProfileLoading = true;
    this.doctorService.getMyDoctorProfile().subscribe({
      next: (res) => {
        this.doctorProfile = res.doctor;
        this.isProfileLoading = false;
      },
      error: (err) => {
        this.isProfileLoading = false;
        this.notificationService.showError('Failed to load doctor profile schedule.');
      }
    });
  }

  addSlot(): void {
    if (!this.newSlot.date || !this.newSlot.startTime || !this.newSlot.endTime) {
      this.notificationService.showError('Please specify date, start time, and end time.');
      return;
    }

    if (this.newSlot.startTime >= this.newSlot.endTime) {
      this.notificationService.showError('End time must be after start time.');
      return;
    }

    this.isAddingSlot = true;
    this.doctorService.addTimeSlot(this.newSlot).subscribe({
      next: (res) => {
        this.isAddingSlot = false;
        this.notificationService.showSuccess(res.message || 'Time slot added successfully.');
        if (this.doctorProfile) {
          this.doctorProfile.availableSlots = res.availableSlots;
        }
      },
      error: (err) => {
        this.isAddingSlot = false;
        this.notificationService.showError(err.error?.message || 'Failed to add time slot.');
      }
    });
  }

  deleteSlot(slotId: string): void {
    if (!confirm('Are you sure you want to remove this available time slot?')) {
      return;
    }

    this.doctorService.removeTimeSlot(slotId).subscribe({
      next: (res) => {
        this.notificationService.showSuccess(res.message || 'Slot removed.');
        if (this.doctorProfile) {
          this.doctorProfile.availableSlots = res.availableSlots;
        }
      },
      error: (err) => {
        this.notificationService.showError(err.error?.message || 'Cannot delete booked slot.');
      }
    });
  }

  loadAppointments(): void {
    this.isAppointmentsLoading = true;
    this.appointmentService.getAppointments(this.statusFilter, this.appointmentsPage, 6).subscribe({
      next: (res) => {
        this.appointments = res.appointments;
        this.appointmentsTotalPages = res.pages || 1;
        this.appointmentsTotal = res.total || 0;
        this.isAppointmentsLoading = false;
      },
      error: (err) => {
        this.isAppointmentsLoading = false;
        this.notificationService.showError('Failed to load patient appointments.');
      }
    });
  }

  onFilterChange(): void {
    this.appointmentsPage = 1;
    this.loadAppointments();
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.appointmentsTotalPages) {
      this.appointmentsPage = newPage;
      this.loadAppointments();
    }
  }

  openStatusModal(appointment: Appointment): void {
    this.selectedAppointment = appointment;
    this.newStatus = appointment.status;
    this.doctorNotes = appointment.notes || '';
    this.isStatusModalOpen = true;
  }

  closeStatusModal(): void {
    this.isStatusModalOpen = false;
    this.selectedAppointment = null;
  }

  updateAppointmentStatus(): void {
    if (!this.selectedAppointment) return;

    this.isUpdatingStatus = true;
    this.appointmentService.updateStatus(
      this.selectedAppointment._id,
      this.newStatus,
      this.doctorNotes
    ).subscribe({
      next: (res) => {
        this.isUpdatingStatus = false;
        this.notificationService.showSuccess(res.message || 'Appointment updated!');
        this.closeStatusModal();
        this.loadAppointments();
        this.loadDoctorProfile();
      },
      error: (err) => {
        this.isUpdatingStatus = false;
        this.notificationService.showError(err.error?.message || 'Failed to update appointment.');
      }
    });
  }

  getPendingCount(): number {
    return this.appointments.filter(a => a.status === 'Pending').length;
  }
}
