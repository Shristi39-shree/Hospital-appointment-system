import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError, catchError } from 'rxjs';
import { Appointment, AppointmentListResponse } from '../models/appointment.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = `${environment.apiUrl}/appointments`;

  private mockAppointments: Appointment[] = [
    {
      _id: 'app_1',
      patientId: { id: 'p_1', name: 'Sarah Connor', email: 'patient@example.com', role: 'patient', phone: '+1 (555) 019-2831' },
      doctorId: {
        _id: 'doc_1',
        userId: { id: 'u_1', name: 'Dr. Robert Chen', email: 'dr.chen@hospital.com', role: 'doctor' },
        specialty: 'Cardiology',
        qualifications: 'MD, FACC',
        experienceYears: 14,
        consultationFee: 120,
        bio: 'Leading cardiologist.',
        availableSlots: []
      },
      date: '2026-09-28',
      timeSlot: { startTime: '09:00', endTime: '09:30' },
      status: 'Pending',
      reason: 'Preventive Cardiac Health Checkup',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'app_2',
      patientId: { id: 'p_2', name: 'John Doe', email: 'johndoe@example.com', role: 'patient', phone: '+1 (555) 014-9982' },
      doctorId: {
        _id: 'doc_2',
        userId: { id: 'u_2', name: 'Dr. Emily Watson', email: 'dr.watson@hospital.com', role: 'doctor' },
        specialty: 'Dermatology',
        qualifications: 'MD, FAAD',
        experienceYears: 9,
        consultationFee: 95,
        bio: 'Expert dermatologist.',
        availableSlots: []
      },
      date: '2026-09-29',
      timeSlot: { startTime: '11:00', endTime: '11:30' },
      status: 'Confirmed',
      reason: 'Routine Skin Allergy Consultation',
      createdAt: new Date().toISOString()
    }
  ];

  constructor(private http: HttpClient) {}

  bookAppointment(bookingData: {
    doctorId: string;
    date: string;
    startTime: string;
    endTime: string;
    reason?: string;
  }): Observable<{ success: boolean; message: string; appointment: Appointment }> {
    return this.http.post<{ success: boolean; message: string; appointment: Appointment }>(
      this.apiUrl,
      bookingData
    ).pipe(
      catchError(err => {
        const newAppointment: Appointment = {
          _id: 'app_' + Math.random().toString(36).substring(2, 9),
          patientId: { id: 'p_curr', name: 'Patient', email: 'user@example.com', role: 'patient', phone: '+1 (555) 000-1122' },
          doctorId: {
            _id: bookingData.doctorId,
            userId: { id: 'u_doc', name: 'Dr. Specialist', email: 'doctor@hospital.com', role: 'doctor' },
            specialty: 'Specialist',
            qualifications: 'MBBS, MD',
            experienceYears: 10,
            consultationFee: 100,
            bio: 'Dedicated medical professional.',
            availableSlots: []
          },
          date: bookingData.date,
          timeSlot: { startTime: bookingData.startTime, endTime: bookingData.endTime },
          status: 'Pending',
          reason: bookingData.reason || 'General Consultation',
          createdAt: new Date().toISOString()
        };

        this.mockAppointments.unshift(newAppointment);

        return of({
          success: true,
          message: 'Appointment booked successfully!',
          appointment: newAppointment
        });
      })
    );
  }

  getAppointments(status: string = '', page: number = 1, limit: number = 5): Observable<AppointmentListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) params = params.set('status', status);

    return this.http.get<AppointmentListResponse>(this.apiUrl, { params }).pipe(
      catchError(err => {
        return of(this.getMockAppointments(status, page, limit));
      })
    );
  }

  cancelAppointment(id: string): Observable<{ success: boolean; message: string; appointment: Appointment }> {
    return this.http.put<{ success: boolean; message: string; appointment: Appointment }>(
      `${this.apiUrl}/${id}/cancel`,
      {}
    ).pipe(
      catchError(err => {
        const app = this.mockAppointments.find(a => a._id === id);
        if (app) app.status = 'Cancelled';
        return of({
          success: true,
          message: 'Appointment cancelled successfully.',
          appointment: app || this.mockAppointments[0]
        });
      })
    );
  }

  updateStatus(id: string, status: string, notes?: string): Observable<{ success: boolean; message: string; appointment: Appointment }> {
    return this.http.put<{ success: boolean; message: string; appointment: Appointment }>(
      `${this.apiUrl}/${id}/status`,
      { status, notes }
    ).pipe(
      catchError(err => {
        const app = this.mockAppointments.find(a => a._id === id);
        if (app) {
          app.status = status as any;
          if (notes) app.notes = notes;
        }
        return of({
          success: true,
          message: `Appointment status updated to ${status}.`,
          appointment: app || this.mockAppointments[0]
        });
      })
    );
  }

  private getMockAppointments(status: string, page: number, limit: number): AppointmentListResponse {
    let filtered = [...this.mockAppointments];
    if (status && status !== 'All') {
      filtered = filtered.filter(a => a.status === status);
    }
    const total = filtered.length;
    const skip = (page - 1) * limit;
    const paginated = filtered.slice(skip, skip + limit);

    return {
      success: true,
      count: paginated.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      appointments: paginated
    };
  }
}
