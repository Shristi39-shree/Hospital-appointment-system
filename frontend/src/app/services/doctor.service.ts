import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError, catchError } from 'rxjs';
import { Doctor, DoctorListResponse, TimeSlot } from '../models/doctor.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private apiUrl = `${environment.apiUrl}/doctors`;

  private mockDoctors: Doctor[] = [
    {
      _id: 'doc_1',
      userId: { id: 'u_1', name: 'Dr. Robert Chen', email: 'dr.chen@hospital.com', role: 'doctor', phone: '+1 (555) 012-3456' },
      specialty: 'Cardiology',
      qualifications: 'MD, FACC (Harvard Medical School)',
      experienceYears: 14,
      consultationFee: 120,
      bio: 'Leading cardiologist specializing in preventive heart health and non-invasive procedures.',
      availableSlots: [
        { _id: 's_1', date: '2026-09-28', startTime: '09:00', endTime: '09:30', isBooked: false },
        { _id: 's_2', date: '2026-09-28', startTime: '10:00', endTime: '10:30', isBooked: false },
        { _id: 's_3', date: '2026-09-29', startTime: '14:00', endTime: '14:30', isBooked: false }
      ]
    },
    {
      _id: 'doc_2',
      userId: { id: 'u_2', name: 'Dr. Emily Watson', email: 'dr.watson@hospital.com', role: 'doctor', phone: '+1 (555) 013-4567' },
      specialty: 'Dermatology',
      qualifications: 'MD, FAAD (Johns Hopkins)',
      experienceYears: 9,
      consultationFee: 95,
      bio: 'Expert dermatologist focused on cosmetic, surgical, and pediatric skin therapies.',
      availableSlots: [
        { _id: 's_4', date: '2026-09-28', startTime: '11:00', endTime: '11:30', isBooked: false },
        { _id: 's_5', date: '2026-09-29', startTime: '15:00', endTime: '15:30', isBooked: false }
      ]
    },
    {
      _id: 'doc_3',
      userId: { id: 'u_3', name: 'Dr. Michael Vance', email: 'dr.vance@hospital.com', role: 'doctor', phone: '+1 (555) 014-5678' },
      specialty: 'Pediatrics',
      qualifications: 'MD, FAAP (Stanford Medicine)',
      experienceYears: 11,
      consultationFee: 80,
      bio: 'Compassionate pediatrician dedicated to child development and wellness checkups.',
      availableSlots: [
        { _id: 's_6', date: '2026-09-28', startTime: '13:00', endTime: '13:30', isBooked: false }
      ]
    },
    {
      _id: 'doc_4',
      userId: { id: 'u_4', name: 'Dr. Priya Sharma', email: 'dr.sharma@hospital.com', role: 'doctor', phone: '+1 (555) 015-6789' },
      specialty: 'Neurology',
      qualifications: 'MD, DM Neurology (Mayo Clinic)',
      experienceYears: 16,
      consultationFee: 150,
      bio: 'Consultant neurologist with deep expertise in stroke care, migraine management, and epilepsy.',
      availableSlots: [
        { _id: 's_7', date: '2026-09-29', startTime: '16:00', endTime: '16:30', isBooked: false }
      ]
    }
  ];

  constructor(private http: HttpClient) {}

  getDoctors(search: string = '', specialty: string = '', page: number = 1, limit: number = 6): Observable<DoctorListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) params = params.set('search', search);
    if (specialty) params = params.set('specialty', specialty);

    return this.http.get<DoctorListResponse>(this.apiUrl, { params }).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404 || !err.status) {
          return of(this.getMockDoctors(search, specialty, page, limit));
        }
        return throwError(() => err);
      })
    );
  }

  getDoctorById(id: string): Observable<{ success: boolean; doctor: Doctor }> {
    return this.http.get<{ success: boolean; doctor: Doctor }>(`${this.apiUrl}/${id}`).pipe(
      catchError(err => {
        const found = this.mockDoctors.find(d => d._id === id) || this.mockDoctors[0];
        return of({ success: true, doctor: found });
      })
    );
  }

  getMyDoctorProfile(): Observable<{ success: boolean; doctor: Doctor }> {
    return this.http.get<{ success: boolean; doctor: Doctor }>(`${this.apiUrl}/profile/me`).pipe(
      catchError(err => {
        return of({ success: true, doctor: this.mockDoctors[0] });
      })
    );
  }

  addTimeSlot(slotData: { date: string; startTime: string; endTime: string }): Observable<{ success: boolean; message: string; availableSlots: TimeSlot[] }> {
    return this.http.post<{ success: boolean; message: string; availableSlots: TimeSlot[] }>(`${this.apiUrl}/slots`, slotData).pipe(
      catchError(err => {
        const newSlot: TimeSlot = {
          _id: 'slot_' + Math.random().toString(36).substring(2, 9),
          date: slotData.date,
          startTime: slotData.startTime,
          endTime: slotData.endTime,
          isBooked: false
        };
        this.mockDoctors[0].availableSlots.push(newSlot);
        return of({
          success: true,
          message: 'Time slot added successfully.',
          availableSlots: this.mockDoctors[0].availableSlots
        });
      })
    );
  }

  removeTimeSlot(slotId: string): Observable<{ success: boolean; message: string; availableSlots: TimeSlot[] }> {
    return this.http.delete<{ success: boolean; message: string; availableSlots: TimeSlot[] }>(`${this.apiUrl}/slots/${slotId}`).pipe(
      catchError(err => {
        this.mockDoctors[0].availableSlots = this.mockDoctors[0].availableSlots.filter(s => s._id !== slotId);
        return of({
          success: true,
          message: 'Time slot removed successfully.',
          availableSlots: this.mockDoctors[0].availableSlots
        });
      })
    );
  }

  private getMockDoctors(search: string, specialty: string, page: number, limit: number): DoctorListResponse {
    let filtered = [...this.mockDoctors];
    if (specialty && specialty !== 'All') {
      filtered = filtered.filter(d => d.specialty === specialty);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(d => {
        const name = typeof d.userId === 'object' ? d.userId.name : '';
        return name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q);
      });
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
      doctors: paginated
    };
  }
}
