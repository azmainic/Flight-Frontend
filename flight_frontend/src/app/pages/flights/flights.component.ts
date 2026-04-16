import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FlightsService } from '../../services/flights.service';
import { Flight } from '../../models/flight.model';
import { FlightCardComponent } from '../../components/flight-card/flight-card.component';

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
                   placeholder="From (city or code)">
          </div>
          <div class="col-md-3">
            <input type="text" class="form-control" formControlName="destination"
                   placeholder="To (city or code)">
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
            <button type="button" class="btn btn-outline-secondary w-100" (click)="clearSearch()"
                    title="Clear filters">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="container py-4">

      <!-- Loading -->
      <div class="text-center py-5" *ngIf="loading">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-2 text-muted">Loading flights...</p>
      </div>

      <!-- Error -->
      <div class="alert alert-danger" *ngIf="errorMessage && !loading">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
      </div>

      <!-- Results -->
      <ng-container *ngIf="!loading && !errorMessage">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <p class="text-muted mb-0">{{ flights.length }} flight(s) found</p>
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
            <p class="text-muted">Try adjusting your search filters.</p>
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
            <li class="page-item" *ngFor="let p of pageNumbers"
                [class.active]="p === currentPage">
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
      origin:      [''],
      destination: [''],
      status:      ['']
    });
  }

  ngOnInit(): void {
    // Pre-fill from query params (e.g. from home page search)
    this.route.queryParams.subscribe(params => {
      if (params['origin'] || params['destination']) {
        this.searchForm.patchValue({
          origin:      params['origin'] ?? '',
          destination: params['destination'] ?? ''
        });
        this.onSearch();
      } else {
        this.loadFlights();
      }
    });
  }

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
        this.errorMessage = err.error?.message ?? 'Failed to load flights.';
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    const { origin, destination, status } = this.searchForm.value;
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

  clearSearch(): void {
    this.searchForm.reset({ origin: '', destination: '', status: '' });
    this.currentPage = 1;
    this.loadFlights();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadFlights();
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}