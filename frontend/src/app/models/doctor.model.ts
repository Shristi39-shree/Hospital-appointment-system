import { User } from './user.model';

export interface TimeSlot {
  _id?: string;
  date: string;       // YYYY-MM-DD
  startTime: string;  // HH:mm
  endTime: string;    // HH:mm
  isBooked?: boolean;
}

export interface Doctor {
  _id: string;
  userId: User | string;
  specialty: string;
  qualifications: string;
  experienceYears: number;
  consultationFee: number;
  bio: string;
  availableSlots: TimeSlot[];
  createdAt?: string;
}

export interface DoctorListResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  doctors: Doctor[];
}
