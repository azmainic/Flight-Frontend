import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Flight } from '../../models/flight.model';

@Component({
  selector: 'app-flight-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="card h-100 shadow-sm border-0 flight-card">
      <div class="card-header d-flex justify-content-between align-items-center"
           [ngClass]="headerClass">
        <span class="fw-bold">{{ flight.airline }}</span>
        <span class="badge" [ngClass]="statusBadgeClass">{{ flight.status | titlecase }}</span>
      </div>

      <div class="card-body">
        <!-- Route -->
        <div class="d-flex align-items-center justify-content-between mb-3">
          <div class="text-center">
            <div class="fs-4 fw-bold text-primary">{{ flight.origin.code }}</div>
            <div class="small text-muted">{{ flight.origin.city }}</div>
          </div>

          <div class="text-center flex-grow-1 px-2">
            <div class="text-muted small">{{ flight.flight_number }}</div>
            <div class="d-flex align-items-center">
              <hr class="flex-grow-1 m-0">
              <i class="bi bi-airplane-fill text-primary mx-1"></i>
              <hr class="flex-grow-1 m-0">
            </div>
            <div class="text-muted small">{{ flight.aircraft_type }}</div>
          </div>

          <div class="text-center">
            <div class="fs-4 fw-bold text-primary">{{ flight.destination.code }}</div>
            <div class="small text-muted">{{ flight.destination.city }}</div>
          </div>
        </div>

        <!-- Times -->
        <div class="row text-center g-2 mb-3">
          <div class="col-6">
            <div class="small text-muted">Departure</div>
            <div class="fw-semibold">{{ flight.departure_time | date:'dd MMM, HH:mm' }}</div>
          </div>
          <div class="col-6">
            <div class="small text-muted">Arrival</div>
            <div class="fw-semibold">{{ flight.arrival_time | date:'dd MMM, HH:mm' }}</div>
          </div>
        </div>
      </div>

      <div class="card-footer bg-transparent d-flex gap-2">
        <a [routerLink]="['/flights', flight._id]"
           class="btn btn-outline-primary btn-sm flex-grow-1">
          <i class="bi bi-info-circle me-1"></i>Details
        </a>
        <a [routerLink]="['/booking', flight._id]"
           class="btn btn-primary btn-sm flex-grow-1">
          <i class="bi bi-ticket-perforated me-1"></i>Book
        </a>
      </div>
    </div>
  `,
  styles: [`
    .flight-card { transition: transform 0.2s, box-shadow 0.2s; }
    .flight-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,.12) !important; }
  `]
})
export class FlightCardComponent {
  @Input({ required: true }) flight!: Flight;

  get statusBadgeClass(): string {
    const map: Record<string, string> = {
      scheduled: 'bg-secondary',
      boarding:  'bg-success',
      departed:  'bg-info text-dark',
      arrived:   'bg-dark',
      delayed:   'bg-warning text-dark',
      cancelled: 'bg-danger'
    };
    return map[this.flight.status] ?? 'bg-secondary';
  }

  get headerClass(): string {
    const map: Record<string, string> = {
      scheduled: 'bg-light text-dark',
      boarding:  'bg-success bg-opacity-10 text-success',
      departed:  'bg-info bg-opacity-10 text-info',
      arrived:   'bg-dark bg-opacity-10 text-dark',
      delayed:   'bg-warning bg-opacity-10 text-warning',
      cancelled: 'bg-danger bg-opacity-10 text-danger'
    };
    return map[this.flight.status] ?? 'bg-light text-dark';
  }
}