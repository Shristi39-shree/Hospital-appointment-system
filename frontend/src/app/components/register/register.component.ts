import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  formData = {
    name: '',
    email: '',
    password: '',
    role: 'patient' as 'patient' | 'doctor',
    phone: '',
    specialty: 'General Medicine',
    qualifications: 'MBBS, MD',
    experienceYears: 5,
    consultationFee: 50,
    bio: ''
  };

  specialties = [
    'Cardiology',
    'Dermatology',
    'Neurology',
    'Pediatrics',
    'Orthopedics',
    'General Medicine',
    'Ophthalmology',
    'Psychiatry',
    'ENT'
  ];

  isLoading = false;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.formData.name || !this.formData.email || !this.formData.password) {
      this.notificationService.showError('Please fill in all required fields.');
      return;
    }

    this.isLoading = true;
    this.authService.register(this.formData).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.notificationService.showSuccess(`Registration successful! Account created.`);
        if (res.user.role === 'doctor') {
          this.router.navigate(['/doctor-dashboard']);
        } else {
          this.router.navigate(['/patient-dashboard']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.error?.message || 'Registration failed. Please check your inputs.';
        this.notificationService.showError(msg);
      }
    });
  }
}
