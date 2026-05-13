/**
 * MyBookingsComponent: Displays user profile and flight booking history
 * Allows users to view, edit profile information, and manage saved passport photos
 * Fetches bookings by matching passport numbers stored in localStorage against API data
 * Supports both local JWT users and Auth0 social login users with isolated storage per user
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AuthService, AuthUser } from '../../services/auth.service';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { FlightsService } from '../../services/flights.service';
import { PassengersService } from '../../services/passengers.service';
import { Flight } from '../../models/flight.model';
import { Passenger } from '../../models/passenger.model';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
 
interface BookingRow { flight: Flight; passenger: Passenger; }
 
/**
 * MyBookingsComponent class implements the logic for displaying user profile and bookings
 * It manages state for profile information, bookings list, loading status, and API connectivity 
 */
@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule],
  template: `
    <!-- Toast -->
    <div class="position-fixed top-0 end-0 p-3" style="z-index:9999">
      <div class="toast show align-items-center text-white border-0 bg-success"
           *ngIf="toast.visible" style="min-width:280px">
        <div class="d-flex">
          <div class="toast-body fw-semibold">
            <i class="bi bi-check-circle-fill me-2"></i>{{ toast.message }}
          </div>
          <button class="btn-close btn-close-white me-2 m-auto"
                  (click)="toast.visible=false"></button>
        </div>
      </div>
    </div>
 
    <div class="bg-primary text-white py-4 mb-4">
      <div class="container">
        <h2 class="fw-bold mb-0">
          <i class="bi bi-person-circle me-2"></i>My Profile & Bookings
        </h2>
        <p class="mb-0 text-white-50">Welcome, {{ displayName }}</p>
      </div>
    </div>
 
    <div class="container pb-5">
      <div class="row g-4">
 
        <!-- Profile Panel -->
        <div class="col-lg-4">
          <div class="card border-0 shadow-sm rounded-4 sticky-top" style="top:20px">
            <div class="card-body text-center p-4">
 
              <!-- Avatar -->
              <div class="position-relative d-inline-block mb-3">
                <img *ngIf="profilePicture" [src]="profilePicture"
                     class="rounded-circle border border-3 border-primary"
                     width="90" height="90" style="object-fit:cover">
                <div *ngIf="!profilePicture"
                     class="rounded-circle bg-primary d-flex align-items-center justify-content-center mx-auto"
                     style="width:90px;height:90px">
                  <span class="text-white fw-bold fs-2">{{ initials }}</span>
                </div>
                <label class="position-absolute bottom-0 end-0 btn btn-sm btn-primary rounded-circle p-1"
                       style="width:28px;height:28px;cursor:pointer" title="Change photo">
                  <i class="bi bi-camera-fill" style="font-size:0.7rem"></i>
                  <input type="file" accept="image/*" class="d-none" (change)="onPhotoChange($event)">
                </label>
              </div>
 
              <h5 class="fw-bold mb-0">{{ displayName }}</h5>
              <p class="text-muted small mb-1">{{ displayEmail }}</p>
              <span class="badge mb-3"
                    [class.bg-primary]="!isAuth0User"
                    [class.bg-success]="isAuth0User">
                {{ isAuth0User ? '🔐 Social Account' : '✈ SkyBook Account' }}
              </span>
 
              <!-- Edit toggle -->
              <button class="btn btn-outline-primary btn-sm w-100 mb-2"
                      (click)="editingProfile = !editingProfile">
                <i class="bi" [class.bi-pencil]="!editingProfile"
                              [class.bi-x-lg]="editingProfile" class="me-1"></i>
                {{ editingProfile ? 'Cancel' : 'Edit Profile' }}
              </button>
 
              <!-- Edit form -->
              <div *ngIf="editingProfile" class="text-start mt-3 border-top pt-3">
                <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
                  <div class="mb-2">
                    <label class="form-label small fw-semibold">Full Name</label>
                    <input type="text" class="form-control form-control-sm"
                           formControlName="fullName" placeholder="Your full name">
                  </div>
                  <div class="mb-2">
                    <label class="form-label small fw-semibold">Mobile Number</label>
                    <input type="tel" class="form-control form-control-sm"
                           formControlName="mobile" placeholder="+44 7000 000000">
                  </div>
                  <div class="mb-2">
                    <label class="form-label small fw-semibold">Nationality</label>
                    <input type="text" class="form-control form-control-sm"
                           formControlName="nationality" placeholder="e.g. British">
                  </div>
                  <div class="mb-2">
                    <label class="form-label small fw-semibold">About</label>
                    <textarea class="form-control form-control-sm" rows="2"
                              formControlName="about" placeholder="Short bio..."></textarea>
                  </div>
                  <div class="mb-3">
                    <label class="form-label small fw-semibold">Passport Photo</label>
                    <input type="file" class="form-control form-control-sm"
                           accept="image/*" (change)="onPassportPhotoChange($event)">
                    <div class="form-text text-danger small">
                      ⚠ Passport number cannot be changed after booking.
                    </div>
                  </div>
                  <button type="submit" class="btn btn-primary btn-sm w-100">
                    <i class="bi bi-check me-1"></i>Save Changes
                  </button>
                </form>
              </div>
 
              <!-- Profile summary -->
              <div class="text-start mt-2 border-top pt-2 small" *ngIf="!editingProfile">
                <div class="text-muted mb-1 fw-semibold small">PROFILE INFO</div>
                <div class="mb-1" *ngIf="profile.mobile">
                  <i class="bi bi-phone text-muted me-2"></i>{{ profile.mobile }}
                </div>
                <div class="mb-1" *ngIf="profile.nationality">
                  <i class="bi bi-flag text-muted me-2"></i>{{ profile.nationality }}
                </div>
                <div class="mb-1" *ngIf="profile.about">
                  <i class="bi bi-info-circle text-muted me-2"></i>{{ profile.about }}
                </div>
                <div class="text-muted small" *ngIf="!profile.mobile && !profile.nationality && !profile.about">
                  Click "Edit Profile" to add your details.
                </div>
                <div *ngIf="passportPhotoUrl" class="mt-2">
                  <div class="text-muted mb-1 fw-semibold small">PASSPORT PHOTO</div>
                  <img [src]="passportPhotoUrl" class="img-thumbnail rounded" style="max-height:80px">
                </div>
              </div>
 
            </div>
          </div>
        </div>
 
        <!-- Bookings Panel -->
        <div class="col-lg-8">
 
          <ul class="nav nav-pills mb-4">
            <li class="nav-item">
              <button class="nav-link" [class.active]="activeTab==='bookings'"
                      (click)="activeTab='bookings'">
                <i class="bi bi-ticket-perforated me-1"></i>My Bookings
                <span class="badge bg-white text-primary ms-1" *ngIf="myBookings.length>0">
                  {{ myBookings.length }}
                </span>
              </button>
            </li>
            <li class="nav-item">
              <button class="nav-link" [class.active]="activeTab==='saved'"
                      (click)="activeTab='saved'">
                <i class="bi bi-bookmark me-1"></i>Saved Flights
              </button>
            </li>
          </ul>
 
          <!-- Bookings Tab -->
          <div *ngIf="activeTab==='bookings'">
 
            <!-- Loading -->
            <div class="text-center py-4" *ngIf="bookingsLoading">
              <div class="spinner-border text-primary"></div>
              <p class="mt-2 text-muted small">Loading your bookings...</p>
            </div>
 
            <!-- API not running -->
            <div class="alert alert-warning rounded-4" *ngIf="!bookingsLoading && !apiConnected">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              <strong>Flask API not running.</strong>
              Start it with: <code>python app.py</code>
            </div>
 
            <!-- No bookings -->
            <div class="text-center py-5"
                 *ngIf="!bookingsLoading && apiConnected && myBookings.length===0">
              <i class="bi bi-ticket text-muted" style="font-size:3.5rem"></i>
              <h5 class="mt-3 fw-semibold">No bookings yet</h5>
              <p class="text-muted small">Book a flight to see it here</p>
              <a routerLink="/flights" class="btn btn-primary btn-sm px-4">
                <i class="bi bi-search me-1"></i>Browse Flights
              </a>
            </div>
 
            <!-- Bookings list -->
            <div *ngFor="let b of myBookings"
                 class="card border-0 shadow-sm rounded-4 mb-3 booking-card">
              <div class="card-header d-flex justify-content-between align-items-center py-2 px-3"
                   [ngClass]="flightHeaderClass(b.flight.status)">
                <div>
                  <span class="badge bg-primary me-2">{{ b.flight.flight_number }}</span>
                  <span class="fw-semibold">{{ b.flight.airline }}</span>
                </div>
                <span class="badge" [ngClass]="flightStatusBadge(b.flight.status)">
                  {{ b.flight.status | titlecase }}
                </span>
              </div>
              <div class="card-body p-3">
                <div class="row align-items-center g-3">
                  <div class="col-md-7">
                    <div class="d-flex align-items-center gap-3">
                      <div class="text-center">
                        <div class="fs-5 fw-bold text-primary">{{ b.flight.origin.code }}</div>
                        <div class="small text-muted">{{ b.flight.origin.city }}</div>
                        <div class="small fw-semibold">{{ b.flight.departure_time | date:'dd MMM, HH:mm' }}</div>
                      </div>
                      <div class="flex-grow-1 text-center">
                        <i class="bi bi-airplane-fill text-primary"></i>
                        <div class="small text-muted">{{ b.flight.aircraft_type }}</div>
                      </div>
                      <div class="text-center">
                        <div class="fs-5 fw-bold text-primary">{{ b.flight.destination.code }}</div>
                        <div class="small text-muted">{{ b.flight.destination.city }}</div>
                        <div class="small fw-semibold">{{ b.flight.arrival_time | date:'dd MMM, HH:mm' }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-5">
                    <div class="d-flex flex-column gap-1">
                      <span class="badge bg-light text-dark border text-start px-2 py-1">
                        <i class="bi bi-person me-1"></i>{{ b.passenger.full_name }}
                      </span>
                      <span class="badge bg-light text-dark border text-start px-2 py-1">
                        <i class="bi bi-credit-card me-1"></i>{{ b.passenger.passport_number }}
                      </span>
                      <div class="d-flex gap-1">
                        <span class="badge bg-secondary">Seat {{ b.passenger.seat_number }}</span>
                        <span class="badge bg-info text-dark">{{ b.passenger.seat_class | titlecase }}</span>
                        <span class="badge" [ngClass]="bookingStatusBadge(b.passenger.booking_status)">
                          {{ b.passenger.booking_status | titlecase }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
 
          </div>
 
          <!-- Saved Tab -->
          <div *ngIf="activeTab==='saved'">
            <div class="text-center py-5">
              <i class="bi bi-bookmark text-muted" style="font-size:3rem"></i>
              <p class="mt-2 text-muted">No saved flights yet</p>
              <a routerLink="/flights" class="btn btn-outline-primary btn-sm">Browse Flights</a>
            </div>
          </div>
 
        </div>
      </div>
    </div>
  `,
  styles: [`
    .booking-card { transition: box-shadow 0.2s; }
    .booking-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,.1) !important; }
  `]
})

/**
 * MyBookingsComponent class implements the logic for displaying user profile and bookings
 * It manages state for profile information, bookings list, loading status, and API connectivity 
 */

export class MyBookingsComponent implements OnInit {
  activeTab = 'bookings';
  editingProfile = false;
  profilePicture: string | null = null;
  passportPhotoUrl: string | null = null;
  profileForm: FormGroup;
  profile: any = { mobile: '', nationality: '', about: '' };
 
  displayName = 'User';
  displayEmail = '';
  initials = 'U';
  isAuth0User = false;
 
  myBookings: BookingRow[] = [];
  bookingsLoading = false;
  apiConnected = false;
 
  toast = { visible: false, message: '' };
  /** 
   * CRITICAL: unique key per user — prevents data leaking between users
   * User-specific storage key for isolated data per user
   * Format: skybook_{username} for local users
   * Format: skybook_auth0_{email_with_underscores} for Auth0 users
   * Prevents data leaking between different users
   */

  private userKey = '';
  private currentUsername = '';
 
  constructor(
    private authService: AuthService,
    private auth0: Auth0Service,
    private flightsService: FlightsService,
    private passengersService: PassengersService,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      fullName:    [''],
      mobile:      [''],
      nationality: [''],
      about:       ['']
    });
  }
 
  /** 
   * Lifecycle hook that runs after component initialization
   * Subscribes to both local JWT user and Auth0 user streams
   * Sets up user data, loads profile from storage, and fetches bookings
   * Handles user switching by checking username change
   */

  ngOnInit(): void {
    // Subscribe to local JWT user stream
    this.authService.currentUser$.subscribe(user => {
      if (user && user.username !== this.currentUsername) {
        this.currentUsername = user.username;
        this.displayName = user.username;
        this.initials = user.username.charAt(0).toUpperCase();
        this.isAuth0User = user.isAuth0 ?? false;
        if (!this.isAuth0User && user.picture) {
          this.profilePicture = user.picture;
        }
        // Each user gets their own isolated storage key
        this.userKey = `skybook_${user.username}`;
        this.loadProfileFromStorage();
        this.loadMyBookings();
      }
    });
 
    /**
     * Subscribe to Auth0 user stream
     */ 
    this.auth0.user$.subscribe(u => {
      if (u) {
        this.displayName = u.name ?? u.email ?? 'User';
        this.displayEmail = u.email ?? '';
        this.profilePicture = u.picture ?? null;
        this.initials = (u.name ?? 'U').charAt(0).toUpperCase();
        this.isAuth0User = true;
        const emailKey = (u.email ?? 'auth0user').replace(/[@.]/g, '_');
        this.userKey = `skybook_auth0_${emailKey}`;
        this.loadProfileFromStorage();
        this.loadMyBookings();
      }
    });
  }
 
  /** 
   * Loads user profile data from localStorage
   * Retrieves saved mobile, nationality, about, fullName, and passport photo
   * Patches form values and restores profile picture for local users
   */

  loadProfileFromStorage(): void {
    if (!this.userKey) return;
    const saved = localStorage.getItem(this.userKey);
    if (saved) {
      try {
        const p = JSON.parse(saved);
        this.profile = { mobile: p.mobile||'', nationality: p.nationality||'', about: p.about||'' };
        this.profileForm.patchValue({ fullName: p.fullName||this.displayName, ...this.profile });
        if (!this.isAuth0User) this.profilePicture = p.picture ?? this.profilePicture;
        this.passportPhotoUrl = p.passportPhoto ?? null;
      } catch {}
    }
  }
 
  /** 
   * Loads user's flight bookings by fetching all flights and their passengers
   * Matches passengers against saved passport numbers in localStorage
   * Only bookings with matching passport numbers are added to myBookings list
   * Handles API connectivity status and loading state for better UX
   */
  loadMyBookings(): void {
    this.bookingsLoading = true;
    this.myBookings = [];
 
    this.flightsService.getFlights(1, 200).subscribe({
      next: (res) => {
        this.apiConnected = true;
        const flights: Flight[] = res.flights ?? (res as any);
 
        /**
         * Get saved passports for this user
         */
        const passportKey = `${this.userKey}_passports`;
        const myPassports: string[] = JSON.parse(localStorage.getItem(passportKey) ?? '[]');
 
        const requests = flights.map(f =>
          this.passengersService.getPassengers(f._id).pipe(catchError(() => of([])))
        );
 
        forkJoin(requests).subscribe({
          next: (allPassengers) => {
            flights.forEach((flight, idx) => {
              const passengers: Passenger[] = allPassengers[idx] as Passenger[];
              passengers.forEach(p => {
                /**
                 * Only show if passport number matches what this user booked
                 */
                if (myPassports.includes(p.passport_number)) {
                  this.myBookings.push({ flight, passenger: p });
                }
              });
            });
            this.bookingsLoading = false;
          },
          error: () => { this.bookingsLoading = false; }
        });
      },
      error: () => {
        this.apiConnected = false;
        this.bookingsLoading = false;
      }
    });
  }
 
  /**   
   * Handles profile picture upload from file input
   * Reads file as data URL and stores in component state
   * Saves to localStorage immediately
   */

  onPhotoChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.profilePicture = e.target?.result as string;
      this.saveToStorage();
    };
    reader.readAsDataURL(file);
  }
 
  /** 
   * Handles passport photo upload from file input
   * Reads file as data URL and stores in component state
   * Does NOT auto-save; will be saved when profile is saved
   */

  onPassportPhotoChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => { this.passportPhotoUrl = e.target?.result as string; };
    reader.readAsDataURL(file);
  }
 
  saveProfile(): void {
    const val = this.profileForm.value;
    this.profile = { mobile: val.mobile, nationality: val.nationality, about: val.about };
    this.saveToStorage();
    this.editingProfile = false;
    this.toast = { visible: true, message: 'Profile saved successfully!' };
    setTimeout(() => this.toast.visible = false, 3000);
  }
 
  saveToStorage(): void {
    if (!this.userKey) return;
    localStorage.setItem(this.userKey, JSON.stringify({
      fullName: this.profileForm.value.fullName,
      ...this.profile,
      picture: this.isAuth0User ? null : this.profilePicture,
      passportPhoto: this.passportPhotoUrl
    }));
  }
 
  /** Utility methods to determine CSS classes based on flight and booking status
   * These methods return appropriate Bootstrap classes for badges and headers
   * based on the status of flights and bookings to visually differentiate them
   */

  flightStatusBadge(status: string): string {
    const m: Record<string,string> = {
      scheduled:'bg-secondary', boarding:'bg-success',
      departed:'bg-info text-dark', arrived:'bg-dark',
      delayed:'bg-warning text-dark', cancelled:'bg-danger'
    };
    return m[status] ?? 'bg-secondary';
  }
 
  /** Flight header classes based on status for better visual cues
   * Uses lighter background colors for headers to differentiate from badges
   * Provides quick visual indication of flight status in the booking cards
   */

  flightHeaderClass(status: string): string {
    const m: Record<string,string> = {
      scheduled:'bg-light text-dark', boarding:'bg-success bg-opacity-10',
      departed:'bg-info bg-opacity-10', arrived:'bg-dark bg-opacity-10',
      delayed:'bg-warning bg-opacity-10', cancelled:'bg-danger bg-opacity-10'
    };
    return m[status] ?? 'bg-light text-dark';
  }
 
  /** Booking status badge classes for visual differentiation of booking states
   * Uses distinct colors for different booking statuses like confirmed, cancelled, checked-in, etc.
   * Provides immediate visual feedback on the status of each booking in the user's list
   */
  
  bookingStatusBadge(status: string): string {
    const m: Record<string,string> = {
      confirmed:'bg-success', cancelled:'bg-danger',
      checked_in:'bg-info text-dark', booked:'bg-primary'
    };
    return m[status] ?? 'bg-secondary';
  }
}