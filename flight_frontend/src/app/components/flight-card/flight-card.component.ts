/**
 * FlightCardComponent: Displays a single flight's information in a card format
 * Used in flight listings, search results, and dashboard views
 * Shows route, times, pricing, and provides navigation to details/booking pages
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Flight } from '../../models/flight.model';

/**
 * FlightCardComponent class implements the logic for displaying a single flight's information
 * It receives a Flight object as input and renders details such as route, times, status, and pricing
 */
@Component({
  selector: 'app-flight-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="card h-100 shadow-sm border-0 flight-card rounded-4 overflow-hidden">

      <div class="card-header d-flex justify-content-between align-items-center py-2 px-3"
           [ngClass]="headerClass">
        <div>
          <span class="fw-bold">{{ flight.airline }}</span>
          <span class="ms-2 text-muted small">{{ flight.flight_number }}</span>
        </div>
        <span class="badge" [ngClass]="statusBadgeClass">{{ flight.status | titlecase }}</span>
      </div>

      <div class="card-body px-3 py-3">

        <!-- Route -->
        <div class="d-flex align-items-center justify-content-between mb-3">
          <div class="text-center">
            <div class="fs-3 fw-bold text-primary">{{ flight.origin.code }}</div>
            <div class="small text-muted">{{ flight.origin.city }}</div>
          </div>
          <div class="text-center flex-grow-1 px-2">
            <div class="d-flex align-items-center">
              <hr class="flex-grow-1 m-0">
              <i class="bi bi-airplane-fill text-primary mx-2"></i>
              <hr class="flex-grow-1 m-0">
            </div>
            <div class="text-muted small">{{ flight.aircraft_type }}</div>
          </div>
          <div class="text-center">
            <div class="fs-3 fw-bold text-primary">{{ flight.destination.code }}</div>
            <div class="small text-muted">{{ flight.destination.city }}</div>
          </div>
        </div>

        <!-- Times -->
        <div class="row text-center g-2 mb-3">
          <div class="col-6">
            <div class="small text-muted">Departure</div>
            <div class="fw-semibold small">{{ flight.departure_time | date:'dd MMM, HH:mm' }}</div>
          </div>
          <div class="col-6">
            <div class="small text-muted">Arrival</div>
            <div class="fw-semibold small">{{ flight.arrival_time | date:'dd MMM, HH:mm' }}</div>
          </div>
        </div>

        <!-- Prices -->
        <div class="rounded-3 p-2 mb-2" style="background:#f8f9fa">
          <div class="row text-center g-1">
            <div class="col-4">
              <div class="small text-muted">Economy</div>
              <div class="fw-bold text-success small">£199</div>
            </div>
            <div class="col-4 border-start border-end">
              <div class="small text-muted">Business</div>
              <div class="fw-bold text-primary small">£599</div>
            </div>
            <div class="col-4">
              <div class="small text-muted">First</div>
              <div class="fw-bold text-warning small">£1,299</div>
            </div>
          </div>
        </div>

      </div>

      <div class="card-footer bg-transparent d-flex gap-2 px-3 pb-3 pt-0">
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

  /** 
   * Required input property that receives the flight data object
   * Component will not render without this input being provided
   * Contains all flight details including route, times, status, and identifiers
   */
  
export class FlightCardComponent {
  @Input({ required: true }) flight!: Flight;

  /**
   * Computes the CSS class for the status badge based on flight status
   * Uses a mapping of status values to Bootstrap badge classes for consistent styling
   * Defaults to 'bg-secondary' if status is unrecognized or missing
   */

  get statusBadgeClass(): string {
    const map: Record<string, string> = {
      scheduled: 'bg-secondary', boarding: 'bg-success',
      departed: 'bg-info text-dark', arrived: 'bg-dark',
      delayed: 'bg-warning text-dark', cancelled: 'bg-danger'
    };
    return map[this.flight.status] ?? 'bg-secondary';
  }

  /**
   * Computes the CSS class for the card header based on flight status
   * Provides visual cues through background and text colors to indicate flight status
   * Defaults to 'bg-light text-dark' for unrecognized or missing status
   */
  
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