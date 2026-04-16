import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FlightsService } from '../../services/flights.service';
import { PassengersService } from '../../services/passengers.service';
import { AuthService } from '../../services/auth.service';
import { Flight } from '../../models/flight.model';
import { Passenger } from '../../models/passenger.model';

@Component({
  selector: 'app-flight-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container py-4">

      <!-- Loading -->
      <div class="text-center py-5" *ngIf="loading">
        <div class="spinner-border text-primary"></div>
        <p class="mt-2 text-muted">Loading flight details...</p>
      </div>

      <!-- Error -->
      <div class="alert alert-danger" *ngIf="errorMessage">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
      </div>

      <ng-container *ngIf="flight && !loading">

        <!-- Back -->
        <a routerLink="/flights" class="btn btn-outline-secondary btn-sm mb-3">
          <i class="bi bi-arrow-left me-1"></i>Back to Flights
        </a>

        <!-- Header -->
        <div class="card border-0 shadow mb-4">
          <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center py-3">
            <div>
              <h4 class="mb-0 fw-bold">{{ flight.flight_number }} — {{ flight.airline }}</h4>
              <small>{{ flight.aircraft_type }}</small>
            </div>
            <span class="badge fs-6" [ngClass]="statusBadgeClass">{{ flight.status | titlecase }}</span>
          </div>

          <div class="card-body">
            <div class="row g-4 align-items-center">
              <div class="col-md-4 text-center">
                <div class="display-6 fw-bold text-primary">{{ flight.origin.code }}</div>
                <div class="fs-5">{{ flight.origin.city }}</div>
                <div class="text-muted">{{ flight.origin.country }}</div>
                <div class="mt-2 fw-semibold">{{ flight.departure_time | date:'dd MMM yyyy, HH:mm' }}</div>
              </div>

              <div class="col-md-4 text-center">
                <i class="bi bi-airplane-fill text-primary" style="font-size:2.5rem;"></i>
                <div class="text-muted small mt-1">Direct Flight</div>
              </div>

              <div class="col-md-4 text-center">
                <div class="display-6 fw-bold text-primary">{{ flight.destination.code }}</div>
                <div class="fs-5">{{ flight.destination.city }}</div>
                <div class="text-muted">{{ flight.destination.country }}</div>
                <div class="mt-2 fw-semibold">{{ flight.arrival_time | date:'dd MMM yyyy, HH:mm' }}</div>
              </div>
            </div>
          </div>

          <div class="card-footer bg-transparent d-flex gap-2">
            <a [routerLink]="['/booking', flight._id]" class="btn btn-primary">
              <i class="bi bi-ticket-perforated me-1"></i>Book This Flight
            </a>
          </div>
        </div>

        <!-- Passengers (only for logged-in users) -->
        <div class="card border-0 shadow" *ngIf="isLoggedIn">
          <div class="card-header bg-light fw-bold">
            <i class="bi bi-people-fill me-2"></i>Passengers
          </div>
          <div class="card-body">

            <div class="text-center py-3" *ngIf="passengersLoading">
              <div class="spinner-border text-primary spinner-border-sm"></div>
              <span class="ms-2 text-muted">Loading passengers...</span>
            </div>

            <div class="alert alert-warning" *ngIf="passengersError">
              {{ passengersError }}
            </div>

            <div class="table-responsive" *ngIf="!passengersLoading && passengers.length > 0">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Passport</th>
                    <th>Nationality</th>
                    <th>Seat</th>
                    <th>Class</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let p of passengers">
                    <td>{{ p.full_name }}</td>
                    <td><code>{{ p.passport_number }}</code></td>
                    <td>{{ p.nationality }}</td>
                    <td>{{ p.seat_number }}</td>
                    <td><span class="badge bg-secondary">{{ p.seat_class | titlecase }}</span></td>
                    <td>
                      <span class="badge" [ngClass]="passengerStatusClass(p.booking_status)">
                        {{ p.booking_status | titlecase }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p class="text-muted text-center mb-0"
               *ngIf="!passengersLoading && passengers.length === 0 && !passengersError">
              No passengers found for this flight.
            </p>
          </div>
        </div>

        <div class="alert alert-info mt-4" *ngIf="!isLoggedIn">
          <i class="bi bi-info-circle-fill me-2"></i>
          <a routerLink="/login" class="alert-link">Sign in</a> to view passenger information.
        </div>

      </ng-container>
    </div>
  `
})
export class FlightDetailComponent implements OnInit {
  flight: Flight | null = null;
  passengers: Passenger[] = [];
  loading = false;
  passengersLoading = false;
  errorMessage = '';
  passengersError = '';
  isLoggedIn = false;

  constructor(
    private route: ActivatedRoute,
    private flightsService: FlightsService,
    private passengersService: PassengersService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadFlight(id);
  }

  loadFlight(id: string): void {
    this.loading = true;
    this.flightsService.getFlightById(id).subscribe({
      next: (flight) => {
        this.flight = flight;
        this.loading = false;
        if (this.isLoggedIn) this.loadPassengers(id);
      },
      error: (err) => {
        this.errorMessage = err.error?.message ?? 'Failed to load flight details.';
        this.loading = false;
      }
    });
  }

  loadPassengers(flightId: string): void {
    this.passengersLoading = true;
    this.passengersService.getPassengers(flightId).subscribe({
      next: (data) => {
        this.passengers = data;
        this.passengersLoading = false;
      },
      error: (err) => {
        this.passengersError = err.error?.message ?? 'Could not load passengers.';
        this.passengersLoading = false;
      }
    });
  }

  get statusBadgeClass(): string {
    const map: Record<string, string> = {
      scheduled: 'bg-secondary', boarding: 'bg-success',
      departed:  'bg-info text-dark', arrived: 'bg-dark',
      delayed:   'bg-warning text-dark', cancelled: 'bg-danger'
    };
    return map[this.flight?.status ?? ''] ?? 'bg-secondary';
  }

  passengerStatusClass(status: string): string {
    const map: Record<string, string> = {
      confirmed:  'bg-success', cancelled: 'bg-danger',
      checked_in: 'bg-info text-dark', booked: 'bg-secondary'
    };
    return map[status] ?? 'bg-secondary';
  }
}