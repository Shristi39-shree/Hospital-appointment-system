export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor';
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  doctorProfile?: any;
  message?: string;
}
