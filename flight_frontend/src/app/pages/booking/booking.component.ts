import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FlightsService } from '../../services/flights.service';
import { PassengersService } from '../../services/passengers.service';
import { Flight } from '../../models/flight.model';
import { PassengerFormData } from '../../models/passenger.model';
import { PassengerFormComponent } from '../../components/passenger-form/passenger-form.component';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, RouterLink, PassengerFormComponent],
  template: `
    <div class="container py-4">

      <a routerLink="/flights" class="btn btn-outline-secondary btn-sm mb-3">
        <i class="bi bi-arrow-left me-1"></i>Back to Flights
      </a>

      <!-- Loading flight -->
      <div class="text-center py-5" *ngIf="flightLoading">
        <div class="spinner-border text-primary"></div>
        <p class="mt-2 text-muted">Loading flight...</p>
      </div>

      <div class="alert alert-danger" *ngIf="flightError">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ flightError }}
      </div>

      <ng-container *ngIf="flight && !flightLoading">

        <!-- Flight summary -->
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0 fw-bold">
              <i class="bi bi-airplane-fill me-2"></i>
              {{ flight.flight_number }} · {{ flight.airline }}
            </h5>
          </div>
          <div class="card-body">
            <div class="row text-center g-3">
              <div class="col-4">
                <div class="fs-3 fw-bold text-primary">{{ flight.origin.code }}</div>
                <div class="text-muted">{{ flight.origin.city }}</div>
                <div class="small fw-semibold">{{ flight.departure_time | date:'dd MMM, HH:mm' }}</div>
              </div>
              <div class="col-4 d-flex align-items-center justify-content-center">
                <i class="bi bi-arrow-right text-muted fs-4"></i>
              </div>
              <div class="col-4">
                <div class="fs-3 fw-bold text-primary">{{ flight.destination.code }}</div>
                <div class="text-muted">{{ flight.destination.city }}</div>
                <div class="small fw-semibold">{{ flight.arrival_time | date:'dd MMM, HH:mm' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Success -->
        <div class="alert alert-success" *ngIf="successMessage">
          <i class="bi bi-check-circle-fill me-2"></i>{{ successMessage }}
          <div class="mt-2">
            <a routerLink="/my-bookings" class="btn btn-success btn-sm me-2">View My Bookings</a>
            <button class="btn btn-outline-success btn-sm" (click)="bookAgain()">Book Another Seat</button>
          </div>
        </div>

        <!-- Form -->
        <div class="card border-0 shadow-sm" *ngIf="!successMessage">
          <div class="card-header bg-light fw-bold">
            <i class="bi bi-person-plus-fill me-2"></i>Passenger Details
          </div>
          <div class="card-body">
            <app-passenger-form
              [editMode]="false"
              [loading]="submitting"
              [errorMessage]="formError"
              (formSubmit)="onBook($event)"
              (onCancel)="cancel()">
            </app-passenger-form>
          </div>
        </div>

      </ng-container>
    </div>
  `
})
export class BookingComponent implements OnInit {
  flight: Flight | null = null;
  flightLoading = false;
  flightError = '';
  submitting = false;
  formError = '';
  successMessage = '';

  private flightId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private flightsService: FlightsService,
    private passengersService: PassengersService
  ) {}

  ngOnInit(): void {
    this.flightId = this.route.snapshot.paramMap.get('id')!;
    this.loadFlight();
  }

  loadFlight(): void {
    this.flightLoading = true;
    this.flightsService.getFlightById(this.flightId).subscribe({
      next: (f) => { this.flight = f; this.flightLoading = false; },
      error: (err) => {
        this.flightError = err.error?.message ?? 'Could not load flight.';
        this.flightLoading = false;
      }
    });
  }

  onBook(data: PassengerFormData): void {
    this.submitting = true;
    this.formError = '';

    this.passengersService.addPassenger(this.flightId, data).subscribe({
      next: () => {
        this.submitting = false;
        this.successMessage = `Booking confirmed! Welcome aboard, ${data.full_name}.`;
      },
      error: (err) => {
        this.submitting = false;
        this.formError = err.error?.message ?? err.error?.error ?? 'Booking failed. Please try again.';
      }
    });
  }

  bookAgain(): void {
    this.successMessage = '';
    this.formError = '';
  }

  cancel(): void {
    this.router.navigate(['/flights', this.flightId]);
  }
}