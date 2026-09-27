import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment, AppointmentListResponse } from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = 'http://localhost:5000/api/appointments';

  constructor(private http: HttpClient) {}

  /**
   * Book a new appointment (Patient)
   */
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
    );
  }

  /**
   * Fetch appointments with optional status filter and pagination
   */
  getAppointments(status: string = '', page: number = 1, limit: number = 5): Observable<AppointmentListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<AppointmentListResponse>(this.apiUrl, { params });
  }

  /**
   * Cancel an appointment
   */
  cancelAppointment(id: string): Observable<{ success: boolean; message: string; appointment: Appointment }> {
    return this.http.put<{ success: boolean; message: string; appointment: Appointment }>(
      `${this.apiUrl}/${id}/cancel`,
      {}
    );
  }

  /**
   * Update appointment status (Doctor only)
   */
  updateStatus(id: string, status: string, notes?: string): Observable<{ success: boolean; message: string; appointment: Appointment }> {
    return this.http.put<{ success: boolean; message: string; appointment: Appointment }>(
      `${this.apiUrl}/${id}/status`,
      { status, notes }
    );
  }
}
