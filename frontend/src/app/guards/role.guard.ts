import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRole = route.data['expectedRole'];
  const userRole = authService.getUserRole();

  if (authService.isLoggedIn() && userRole === expectedRole) {
    return true;
  }

  // Redirect to appropriate dashboard if role mismatch
  if (userRole === 'doctor') {
    router.navigate(['/doctor-dashboard']);
  } else if (userRole === 'patient') {
    router.navigate(['/patient-dashboard']);
  } else {
    router.navigate(['/login']);
  }
  return false;
};
