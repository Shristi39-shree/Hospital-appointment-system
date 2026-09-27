import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };
  isLoading = false;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.credentials.email || !this.credentials.password) {
      this.notificationService.showError('Please fill in both email and password.');
      return;
    }

    this.isLoading = true;
    this.authService.login(this.credentials).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.notificationService.showSuccess(`Welcome back, ${res.user.name}!`);
        if (res.user.role === 'doctor') {
          this.router.navigate(['/doctor-dashboard']);
        } else {
          this.router.navigate(['/patient-dashboard']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.error?.message || 'Invalid email or password.';
        this.notificationService.showError(msg);
      }
    });
  }

  // Quick helper to fill sample patient credentials
  fillPatientDemo(): void {
    this.credentials.email = 'patient@example.com';
    this.credentials.password = 'password123';
  }

  // Quick helper to fill sample doctor credentials
  fillDoctorDemo(): void {
    this.credentials.email = 'dr.chen@hospital.com';
    this.credentials.password = 'password123';
  }
}
