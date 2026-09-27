import { User } from './user.model';
import { Doctor } from './doctor.model';

export interface Appointment {
  _id: string;
  patientId: User;
  doctorId: Doctor;
  date: string;
  timeSlot: {
    startTime: string;
    endTime: string;
  };
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  reason: string;
  notes?: string;
  createdAt?: string;
}

export interface AppointmentListResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  appointments: Appointment[];
}
