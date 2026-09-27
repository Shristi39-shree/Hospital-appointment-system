import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError, tap, catchError } from 'rxjs';
import { User, AuthResponse } from '../models/user.model';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const savedUser = localStorage.getItem('carepulse_user');
    const token = localStorage.getItem('carepulse_token');
    if (savedUser && token) {
      try {
        this.currentUserSubject.next(JSON.parse(savedUser));
      } catch (e) {
        this.logout();
      }
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public getToken(): string | null {
    return localStorage.getItem('carepulse_token');
  }

  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => {
        if (response.success && response.token) {
          this.setSession(response);
        }
      }),
      catchError(err => {
        // Fallback for offline or static hosting environments (status === 0 or HTTP failure)
        if (err.status === 0 || err.status === 404 || !err.status) {
          console.warn('Backend server offline. Proceeding in offline demo session mode.');
          const mockUser: User = {
            id: 'user_' + Math.random().toString(36).substring(2, 9),
            name: userData.name || 'Registered User',
            email: userData.email,
            role: userData.role || 'patient',
            phone: userData.phone || ''
          };
          const mockRes: AuthResponse = {
            success: true,
            token: 'demo_token_' + Date.now(),
            user: mockUser
          };
          this.setSession(mockRes);
          return of(mockRes);
        }
        return throwError(() => err);
      })
    );
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.token) {
          this.setSession(response);
        }
      }),
      catchError(err => {
        // Fallback for offline or static hosting environments
        if (err.status === 0 || err.status === 404 || !err.status) {
          console.warn('Backend server offline. Proceeding in offline demo session mode.');
          const isDoctor = credentials.email.includes('dr') || credentials.email.includes('doctor');
          const mockUser: User = {
            id: 'user_demo_101',
            name: isDoctor ? 'Dr. Robert Chen' : 'Sarah Connor',
            email: credentials.email,
            role: isDoctor ? 'doctor' : 'patient',
            phone: '+1 (555) 019-2831'
          };
          const mockRes: AuthResponse = {
            success: true,
            token: 'demo_token_' + Date.now(),
            user: mockUser
          };
          this.setSession(mockRes);
          return of(mockRes);
        }
        return throwError(() => err);
      })
    );
  }

  private setSession(authResult: AuthResponse): void {
    localStorage.setItem('carepulse_token', authResult.token);
    localStorage.setItem('carepulse_user', JSON.stringify(authResult.user));
    this.currentUserSubject.next(authResult.user);
  }

  logout(): void {
    localStorage.removeItem('carepulse_token');
    localStorage.removeItem('carepulse_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.getToken() && !!this.currentUserValue;
  }

  getUserRole(): 'patient' | 'doctor' | null {
    return this.currentUserValue ? this.currentUserValue.role : null;
  }
}
