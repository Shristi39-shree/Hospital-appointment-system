import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Doctor, DoctorListResponse, TimeSlot } from '../models/doctor.model';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private apiUrl = 'http://localhost:5000/api/doctors';

  constructor(private http: HttpClient) {}

  /**
   * Fetch list of doctors with optional search term, specialty filter, and pagination.
   */
  getDoctors(search: string = '', specialty: string = '', page: number = 1, limit: number = 6): Observable<DoctorListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }
    if (specialty) {
      params = params.set('specialty', specialty);
    }

    return this.http.get<DoctorListResponse>(this.apiUrl, { params });
  }

  /**
   * Get single doctor by ID.
   */
  getDoctorById(id: string): Observable<{ success: boolean; doctor: Doctor }> {
    return this.http.get<{ success: boolean; doctor: Doctor }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get logged-in doctor profile.
   */
  getMyDoctorProfile(): Observable<{ success: boolean; doctor: Doctor }> {
    return this.http.get<{ success: boolean; doctor: Doctor }>(`${this.apiUrl}/profile/me`);
  }

  /**
   * Add a new time slot for the logged-in doctor.
   */
  addTimeSlot(slotData: { date: string; startTime: string; endTime: string }): Observable<{ success: boolean; message: string; availableSlots: TimeSlot[] }> {
    return this.http.post<{ success: boolean; message: string; availableSlots: TimeSlot[] }>(`${this.apiUrl}/slots`, slotData);
  }

  /**
   * Delete an unbooked time slot.
   */
  removeTimeSlot(slotId: string): Observable<{ success: boolean; message: string; availableSlots: TimeSlot[] }> {
    return this.http.delete<{ success: boolean; message: string; availableSlots: TimeSlot[] }>(`${this.apiUrl}/slots/${slotId}`);
  }
}
