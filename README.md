# Hospital Appointment Management System (MEAN Stack)

A complete, full-stack Hospital Appointment Management System built using the **MEAN stack** (**M**ongoDB, **E**xpress.js, **A**ngular, **N**ode.js).

## 🚀 Features

### 1. Dual Role-Based Authentication & Authorization (JWT)
- **Role-based Workflows**: Patients and Doctors have distinct dashboard views, capabilities, and navigation options.
- **Bcrypt Password Hashing**: Passwords stored securely in Mongoose User schema.
- **Route Guards & JWT Interceptor**: Frontend `authGuard` and `roleGuard` protect access, while `jwtInterceptor` automatically injects `Authorization: Bearer <token>` into HTTP calls.

### 2. Patient Dashboard
- **Medical Specialist Catalog**: Lists doctors with specialty, experience, fee, qualifications, and live slot counter.
- **Search & Specialty Filter**: Instant filtering by doctor name or medical domain.
- **Dynamic Slot Booking**: Interactive modal dialog showing date/time chips; prevents selecting reserved slots.
- **Appointment Tracking & Cancellation**: Paginated history table with color-coded status badges (`Pending`, `Confirmed`, `Completed`, `Cancelled`) and cancellation capability.

### 3. Doctor Dashboard
- **Availability Schedule Manager**: Add/remove custom time slots for specified dates with validation against overlapping start/end times.
- **Patient Consultations Board**: View patient contact information, visit reasons, and schedule.
- **Status Updates & Clinical Notes**: Transition appointment status (`Pending` -> `Confirmed` -> `Completed` / `Cancelled`) with doctor notes.

### 4. Concurrency Control & Double-Booking Prevention
- **Frontend level**: Slot state tracking and disabled UI chips.
- **Backend controller level**: Atomic check-and-update on `Doctor` document.
- **Database schema level**: Partial unique compound index on `(doctorId, date, "timeSlot.startTime")` excluding cancelled appointments.

---

## 📁 Repository Structure

```
hospital-appointment-system/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection wrapper with MongoMemoryServer fallback
│   ├── controllers/
│   │   ├── authController.js     # Signup/Login logic & JWT generation
│   │   ├── doctorController.js   # Doctor catalog search, profile, & slot management
│   │   └── appointmentController.js # Booking, cancellation, status updates & pagination
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT Bearer token validator
│   │   └── roleMiddleware.js     # Role access restriction ('patient', 'doctor')
│   ├── models/
│   │   ├── User.js               # Base User Mongoose schema
│   │   ├── Doctor.js             # Doctor profile & embedded time slot schema
│   │   └── Appointment.js        # Appointment schema with unique indexing
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth routes
│   │   ├── doctorRoutes.js       # /api/doctors routes
│   │   └── appointmentRoutes.js  # /api/appointments routes
│   ├── seed.js                   # Pre-populates sample doctors, patients, and slots
│   ├── server.js                 # Express server entry point
│   ├── .env.example              # Environment variables template
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── components/
    │   │   │   ├── navbar/               # Dynamic navigation header
    │   │   │   ├── login/                # Sign-in form with demo account shortcuts
    │   │   │   ├── register/             # Account registration with role toggling
    │   │   │   ├── patient-dashboard/    # Doctor discovery, booking modal & appointment history
    │   │   │   ├── doctor-dashboard/     # Time slot creator & consultation schedule
    │   │   │   ├── notification-toast/   # Toast alerts (success, error, info)
    │   │   │   └── footer/               # Footer component
    │   │   ├── guards/
    │   │   │   ├── auth.guard.ts
    │   │   │   └── role.guard.ts
    │   │   ├── interceptors/
    │   │   │   └── jwt.interceptor.ts
    │   │   ├── models/
    │   │   │   ├── user.model.ts
    │   │   │   ├── doctor.model.ts
    │   │   │   └── appointment.model.ts
    │   │   ├── services/
    │   │   │   ├── auth.service.ts
    │   │   │   ├── doctor.service.ts
    │   │   │   ├── appointment.service.ts
    │   │   │   └── notification.service.ts
    │   │   ├── app.component.ts
    │   │   ├── app.routes.ts
    │   │   └── app.config.ts
    │   ├── styles.css                    # Glassmorphism & modern design system
    │   └── index.html
    ├── angular.json
    └── package.json
```

---

## 📡 REST API Endpoint Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new Patient or Doctor |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | Protected | Fetch currently logged-in user profile |
| `GET` | `/api/doctors` | Public | List doctors with search, specialty filter, & pagination |
| `GET` | `/api/doctors/:id` | Public | Get doctor profile by ID |
| `GET` | `/api/doctors/profile/me` | Doctor | Get doctor's own profile and availability schedule |
| `POST` | `/api/doctors/slots` | Doctor | Add available time slot(s) for a given date |
| `DELETE` | `/api/doctors/slots/:slotId` | Doctor | Remove unbooked time slot |
| `POST` | `/api/appointments` | Patient | Book appointment slot for doctor |
| `GET` | `/api/appointments` | Protected | Get user's appointments (Paginated, status filtered) |
| `PUT` | `/api/appointments/:id/cancel` | Protected | Cancel an active appointment |
| `PUT` | `/api/appointments/:id/status` | Doctor | Update appointment status (`Confirmed`, `Completed`, `Cancelled`) |

---

## 💻 Quick Start Instructions

### Prerequisites
- Node.js (v18 or higher) and npm.

### Step 1: Backend Setup
```bash
cd backend
npm install
npm run seed  # Pre-populates test doctors, patients & slots
npm start
```

### Step 2: Frontend Setup
```bash
cd frontend
npm install
npm start
```
Navigate to `http://localhost:4200` in your web browser.

---

## 🔑 Test Demo Credentials

- **Patient Account**: `patient@example.com` / `password123`
- **Doctor Account**: `dr.chen@hospital.com` / `password123`
