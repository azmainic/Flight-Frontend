/** 
 * FlightsComponent: Displays searchable and paginated list of flights
 * Provides search functionality by origin, destination, and flight status
 * Supports pagination for browsing through large flight lists
 * Converts airport codes to city names automatically for better search experience
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FlightsService } from '../../services/flights.service';
import { Flight } from '../../models/flight.model';
import { FlightCardComponent } from '../../components/flight-card/flight-card.component';

/** Map airport codes to city names for the API 
 * This allows users to search using either city names or airport codes
 * The API expects city names, so we convert codes to cities before sending search requests
*/
const CODE_TO_CITY: Record<string, string> = {
  'LHR': 'London', 'CDG': 'Paris', 'DXB': 'Dubai',
  'JFK': 'New York', 'FRA': 'Frankfurt', 'NYC': 'New York'
};

@Component({
  selector: 'app-flights',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FlightCardComponent],
  template: `
    <div class="bg-primary text-white py-4">
      <div class="container">
        <h2 class="fw-bold mb-0"><i class="bi bi-search me-2"></i>Search Flights</h2>
      </div>
    </div>

    <!-- Search bar -->
    <div class="bg-white shadow-sm py-3 sticky-top">
      <div class="container">
        <form [formGroup]="searchForm" (ngSubmit)="onSearch()" class="row g-2 align-items-end">
          <div class="col-md-3">
            <input type="text" class="form-control" formControlName="origin"
                   placeholder="From (city or code e.g. London, LHR)">
          </div>
          <div class="col-md-3">
            <input type="text" class="form-control" formControlName="destination"
                   placeholder="To (city or code e.g. Paris, CDG)">
          </div>
          <div class="col-md-3">
            <select class="form-select" formControlName="status">
              <option value="">Any Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="boarding">Boarding</option>
              <option value="departed">Departed</option>
              <option value="arrived">Arrived</option>
              <option value="delayed">Delayed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div class="col-md-2">
            <button type="submit" class="btn btn-primary w-100">
              <i class="bi bi-search me-1"></i>Search
            </button>
          </div>
          <div class="col-md-1">
            <button type="button" class="btn btn-outline-secondary w-100"
                    (click)="clearSearch()" title="Clear">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="container py-4">

      <div class="text-center py-5" *ngIf="loading">
        <div class="spinner-border text-primary"></div>
        <p class="mt-2 text-muted">Loading flights...</p>
      </div>

      <div class="alert alert-danger" *ngIf="errorMessage && !loading">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
      </div>

      <ng-container *ngIf="!loading && !errorMessage">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <p class="text-muted mb-0">
            <strong>{{ flights.length }}</strong> flight(s) found
            <span *ngIf="isSearchMode" class="ms-2 badge bg-primary">Filtered</span>
          </p>
        </div>

        <div class="row g-4" *ngIf="flights.length > 0; else noResults">
          <div class="col-md-6 col-lg-4" *ngFor="let flight of flights">
            <app-flight-card [flight]="flight"></app-flight-card>
          </div>
        </div>

        <ng-template #noResults>
          <div class="text-center py-5">
            <i class="bi bi-airplane text-muted" style="font-size:4rem;"></i>
            <h4 class="mt-3 text-muted">No flights found</h4>
            <p class="text-muted">Try a city name like "London" or "Paris" instead of the airport code.</p>
            <button class="btn btn-outline-primary" (click)="clearSearch()">Show All Flights</button>
          </div>
        </ng-template>

        <!-- Pagination -->
        <nav class="mt-4" *ngIf="!isSearchMode && totalPages > 1">
          <ul class="pagination justify-content-center">
            <li class="page-item" [class.disabled]="currentPage === 1">
              <button class="page-link" (click)="changePage(currentPage - 1)">
                <i class="bi bi-chevron-left"></i>
              </button>
            </li>
            <li class="page-item" *ngFor="let p of pageNumbers" [class.active]="p === currentPage">
              <button class="page-link" (click)="changePage(p)">{{ p }}</button>
            </li>
            <li class="page-item" [class.disabled]="currentPage === totalPages">
              <button class="page-link" (click)="changePage(currentPage + 1)">
                <i class="bi bi-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </ng-container>

    </div>
  `
})

/**
 * FlightsComponent class implements the logic for displaying and searching flights
 * It manages state for flights list, loading status, error messages, search mode, and pagination
 * It interacts with FlightsService to fetch flight data based on search criteria and pagination
 * The component also handles conversion of airport codes to city names for better search experience
 */

export class FlightsComponent implements OnInit {
  flights: Flight[] = [];
  loading = false;
  errorMessage = '';
  isSearchMode = false;
  currentPage = 1;
  pageSize = 9;
  totalPages = 1;
  searchForm: FormGroup;

  constructor(
    private flightsService: FlightsService,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {
    this.searchForm = this.fb.group({
      origin: [''], destination: [''], status: ['']
    });
  }

  /** 
   * Lifecycle hook that runs after component initialization
   * Subscribes to query parameters for deep linking support
   * If origin/destination are present in URL, pre-fills form and triggers search
   * Otherwise loads all flights with default pagination
   */

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['origin'] || params['destination']) {
        // Convert code to city name if needed
        const origin = this.resolveCity(params['origin'] ?? '');
        const destination = this.resolveCity(params['destination'] ?? '');
        this.searchForm.patchValue({ origin, destination });
        this.onSearch();
      } else {
        this.loadFlights();
      }
    });
  }

  /** 
   * Converts airport code to city name if it exists in the mapping
   * If input is empty or not found in mapping, returns original input
   * This allows users to search using either city names or airport codes
   */

  resolveCity(input: string): string {
    if (!input) return '';
    const upper = input.toUpperCase();
    return CODE_TO_CITY[upper] ?? input;
  }
  /** 
   * ==================== API METHODS ====================
   * Fetches paginated list of all flights from the API
   * Sets loading flag, clears error message, and disables search mode
   * Updates flights array, total pages, and handles errors
   * Called on initial load and when changing pages
   */

  loadFlights(): void {
    this.loading = true;
    this.errorMessage = '';
    this.isSearchMode = false;

    this.flightsService.getFlights(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.flights = res.flights ?? (res as any);
        const total = res.total ?? this.flights.length;
        this.totalPages = Math.ceil(total / this.pageSize);
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message ?? 'Failed to load flights. Is the Flask API running?';
        this.loading = false;
      }
    });
  }

  /** 
   * Performs search with current form values
   * Converts origin/destination to city names before sending to API
   * If all filters are empty, falls back to loading all flights
   * Sets search mode flag to true for UI adjustments
   */

  onSearch(): void {
    let { origin, destination, status } = this.searchForm.value;

    // Auto-convert codes to city names
    origin = this.resolveCity(origin);
    destination = this.resolveCity(destination);

    if (!origin && !destination && !status) {
      this.loadFlights();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.isSearchMode = true;

    this.flightsService.searchFlights(origin, destination, status).subscribe({
      next: (res) => {
        this.flights = res.flights ?? (res as any);
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message ?? 'Search failed.';
        this.loading = false;
      }
    });
  }

  /** 
   * Resets all search filters to empty values
   * Resets current page to 1
   * Loads the full paginated flight list
   * Called when user clicks clear button or "Show All Flights" link
   */

  clearSearch(): void {
    this.searchForm.reset({ origin: '', destination: '', status: '' });
    this.currentPage = 1;
    this.loadFlights();
  }

  /** 
   * Changes the current page number and reloads flights
   * Validates page number is within valid range (1 to totalPages)
   * Called when user clicks on page numbers or prev/next buttons
   */

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadFlights();
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}