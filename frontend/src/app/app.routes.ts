import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { PatientDashboardComponent } from './components/patient-dashboard/patient-dashboard.component';
import { DoctorDashboardComponent } from './components/doctor-dashboard/doctor-dashboard.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'patient-dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'patient-dashboard', 
    component: PatientDashboardComponent, 
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: 'patient' }
  },
  { 
    path: 'doctor-dashboard', 
    component: DoctorDashboardComponent, 
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: 'doctor' }
  },
  { path: '**', redirectTo: 'patient-dashboard' }
];
