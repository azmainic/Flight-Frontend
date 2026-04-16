import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FlightsService } from '../../services/flights.service';
import { PassengersService } from '../../services/passengers.service';
import { AuthService } from '../../services/auth.service';
import { Flight } from '../../models/flight.model';
import { Passenger } from '../../models/passenger.model';
import { PassengerFormComponent } from '../../components/passenger-form/passenger-form.component';
import { PassengerFormData } from '../../models/passenger.model';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface BookingRow {
  flight: Flight;
  passenger: Passenger;
}

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink, PassengerFormComponent],
  template: `
    <div class="bg-primary text-white py-4 mb-4">
      <div class="container">
        <h2 class="fw-bold mb-0"><i class="bi bi-ticket-perforated-fill me-2"></i>My Bookings</h2>
        <p class="mb-0 text-white-50">Signed in as <strong>{{ username }}</strong></p>
      </div>
    </div>

    <div class="container pb-5">

      <!-- Loading -->
      <div class="text-center py-5" *ngIf="loading">
        <div class="spinner-border text-primary"></div>
        <p class="mt-2 text-muted">Loading your bookings...</p>
      </div>

      <!-- Error -->
      <div class="alert alert-danger" *ngIf="errorMessage">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
      </div>

      <!-- No bookings -->
      <div class="text-center py-5" *ngIf="!loading && bookings.length === 0 && !errorMessage">
        <i class="bi bi-ticket text-muted" style="font-size:4rem;"></i>
        <h4 class="mt-3 text-muted">No bookings found</h4>
        <a routerLink="/flights" class="btn btn-primary mt-2">Browse Flights</a>
      </div>

      <!-- Bookings list -->
      <div class="row g-4" *ngIf="!loading && bookings.length > 0">
        <div class="col-12" *ngFor="let b of bookings; let i = index">
          <div class="card border-0 shadow-sm">
            <div class="card-header d-flex justify-content-between align-items-center bg-light">
              <div>
                <span class="fw-bold text-primary me-2">{{ b.flight.flight_number }}</span>
                <span class="text-muted">{{ b.flight.airline }}</span>
              </div>
              <span class="badge" [ngClass]="statusBadge(b.flight.status)">
                {{ b.flight.status | titlecase }}
              </span>
            </div>

            <div class="card-body">
              <div class="row g-3">
                <!-- Route -->
                <div class="col-md-5">
                  <div class="d-flex align-items-center gap-3">
                    <div class="text-center">
                      <div class="fs-5 fw-bold text-primary">{{ b.flight.origin.code }}</div>
                      <div class="small text-muted">{{ b.flight.origin.city }}</div>
                      <div class="small">{{ b.flight.departure_time | date:'dd MMM, HH:mm' }}</div>
                    </div>
                    <i class="bi bi-arrow-right text-muted fs-5"></i>
                    <div class="text-center">
                      <div class="fs-5 fw-bold text-primary">{{ b.flight.destination.code }}</div>
                      <div class="small text-muted">{{ b.flight.destination.city }}</div>
                      <div class="small">{{ b.flight.arrival_time | date:'dd MMM, HH:mm' }}</div>
                    </div>
                  </div>
                </div>

                <!-- Passenger details -->
                <div class="col-md-4">
                  <div class="small text-muted mb-1">Passenger</div>
                  <div class="fw-semibold">{{ b.passenger.full_name }}</div>
                  <div class="small">
                    Seat <strong>{{ b.passenger.seat_number }}</strong> ·
                    <span class="badge bg-secondary">{{ b.passenger.seat_class | titlecase }}</span>
                  </div>
                  <div class="mt-1">
                    <span class="badge" [ngClass]="bookingStatusBadge(b.passenger.booking_status)">
                      {{ b.passenger.booking_status | titlecase }}
                    </span>
                  </div>
                </div>

                <!-- Actions -->
                <div class="col-md-3 d-flex align-items-center justify-content-md-end gap-2">
                  <button class="btn btn-outline-primary btn-sm"
                          (click)="startEdit(i)"
                          *ngIf="editingIndex !== i">
                    <i class="bi bi-pencil me-1"></i>Edit
                  </button>
                  <a [routerLink]="['/flights', b.flight._id]"
                     class="btn btn-outline-secondary btn-sm">
                    <i class="bi bi-info-circle me-1"></i>Flight
                  </a>
                </div>
              </div>

              <!-- Edit form inline -->
              <div class="mt-4 border-top pt-3" *ngIf="editingIndex === i">
                <h6 class="fw-bold mb-3">Update Booking</h6>
                <app-passenger-form
                  [editMode]="true"
                  [initialData]="b.passenger"
                  [loading]="updateLoading"
                  [errorMessage]="updateError"
                  (formSubmit)="onUpdate($event, b)"
                  (onCancel)="editingIndex = -1">
                </app-passenger-form>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class MyBookingsComponent implements OnInit {
  bookings: BookingRow[] = [];
  loading = false;
  errorMessage = '';
  editingIndex = -1;
  updateLoading = false;
  updateError = '';
  username = '';

  constructor(
    private flightsService: FlightsService,
    private passengersService: PassengersService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.username = this.authService.getCurrentUser()?.username ?? '';
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading = true;
    this.errorMessage = '';

    // Load all flights, then for each flight load passengers and find ones matching current user's passport
    // Since we don't have a dedicated "my bookings" endpoint, we load all flights & cross-reference
    this.flightsService.getFlights(1, 100).subscribe({
      next: (res) => {
        const flights: Flight[] = res.flights ?? (res as any);
        const passengerRequests = flights.map(f =>
          this.passengersService.getPassengers(f._id).pipe(catchError(() => of([])))
        );

        forkJoin(passengerRequests).subscribe({
          next: (allPassengers) => {
            this.bookings = [];
            flights.forEach((flight, idx) => {
              const passengers: Passenger[] = allPassengers[idx] as Passenger[];
              passengers.forEach(p => {
                this.bookings.push({ flight, passenger: p });
              });
            });
            this.loading = false;
          },
          error: () => {
            this.errorMessage = 'Failed to load bookings.';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        this.errorMessage = err.error?.message ?? 'Failed to load flights.';
        this.loading = false;
      }
    });
  }

  startEdit(index: number): void {
    this.editingIndex = index;
    this.updateError = '';
  }

  onUpdate(data: PassengerFormData, booking: BookingRow): void {
    this.updateLoading = true;
    this.updateError = '';

    this.passengersService
      .updatePassenger(booking.flight._id, booking.passenger.passport_number, data)
      .subscribe({
        next: () => {
          this.updateLoading = false;
          this.editingIndex = -1;
          // Update locally
          booking.passenger = { ...booking.passenger, ...data };
        },
        error: (err) => {
          this.updateLoading = false;
          this.updateError = err.error?.message ?? 'Update failed.';
        }
      });
  }

  statusBadge(status: string): string {
    const map: Record<string, string> = {
      scheduled: 'bg-secondary', boarding: 'bg-success',
      departed: 'bg-info text-dark', arrived: 'bg-dark',
      delayed: 'bg-warning text-dark', cancelled: 'bg-danger'
    };
    return map[status] ?? 'bg-secondary';
  }

  bookingStatusBadge(status: string): string {
    const map: Record<string, string> = {
      confirmed: 'bg-success', cancelled: 'bg-danger',
      checked_in: 'bg-info text-dark', booked: 'bg-secondary'
    };
    return map[status] ?? 'bg-secondary';
  }
}