/**
 * app.routes.ts defines the routing configuration for the Angular application.
 * It sets up routes for public pages (home, login, register, flights), authenticated pages (booking, my bookings), and admin pages (admin dashboard).
 */

import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  // ─── Default ──────────────────────────────────────────────────────────────
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },

  // ─── Public ───────────────────────────────────────────────────────────────
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'flights',
    loadComponent: () =>
      import('./pages/flights/flights.component').then(m => m.FlightsComponent)
  },
  {
    path: 'flights/:id',
    loadComponent: () =>
      import('./pages/flight-detail/flight-detail.component').then(m => m.FlightDetailComponent)
  },

  // ─── Authenticated ────────────────────────────────────────────────────────
  {
    path: 'booking/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/booking/booking.component').then(m => m.BookingComponent)
  },
  {
    path: 'my-bookings',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/my-bookings/my-bookings.component').then(m => m.MyBookingsComponent)
  },

  // ─── Admin ────────────────────────────────────────────────────────────────
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./pages/admin/admin.component').then(m => m.AdminComponent)
  },

  // ─── Fallback ─────────────────────────────────────────────────────────────
  {
    path: '**',
    redirectTo: 'home'
  }
];