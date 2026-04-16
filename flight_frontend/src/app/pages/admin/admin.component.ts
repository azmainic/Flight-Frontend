import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FlightsService } from '../../services/flights.service';
import { Flight } from '../../models/flight.model';

type AdminTab = 'analytics' | 'flights' | 'add-flight';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  template: `
    <div class="bg-dark text-white py-4 mb-4">
      <div class="container">
        <h2 class="fw-bold mb-0"><i class="bi bi-shield-lock-fill me-2"></i>Admin Dashboard</h2>
        <p class="mb-0 text-white-50">Manage flights and view system analytics</p>
      </div>
    </div>

    <div class="container pb-5">

      <ul class="nav nav-tabs mb-4">
        <li class="nav-item">
          <button class="nav-link" [class.active]="activeTab === 'analytics'" (click)="setTab('analytics')">
            <i class="bi bi-bar-chart-fill me-1"></i>Analytics
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" [class.active]="activeTab === 'flights'" (click)="setTab('flights')">
            <i class="bi bi-airplane me-1"></i>Manage Flights
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" [class.active]="activeTab === 'add-flight'" (click)="setTab('add-flight')">
            <i class="bi bi-plus-circle me-1"></i>Add Flight
          </button>
        </li>
      </ul>

      <!-- ANALYTICS -->
      <div *ngIf="activeTab === 'analytics'">
        <div class="text-center py-4" *ngIf="analyticsLoading">
          <div class="spinner-border text-primary"></div>
        </div>
        <div class="alert alert-danger" *ngIf="analyticsError">{{ analyticsError }}</div>
        <ng-container *ngIf="analytics && !analyticsLoading">
          <div class="row g-4 mb-4">
            <div class="col-sm-6 col-lg-3" *ngFor="let stat of summaryStats">
              <div class="card border-0 shadow-sm text-center h-100">
                <div class="card-body py-4">
                  <i [class]="'bi ' + stat.icon + ' text-primary mb-2'" style="font-size:2rem;"></i>
                  <div class="fs-2 fw-bold">{{ stat.value }}</div>
                  <div class="text-muted small">{{ stat.label }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-light fw-bold">Raw Analytics Data</div>
            <div class="card-body">
              <pre class="mb-0" style="max-height:400px;overflow-y:auto;">{{ analytics | json }}</pre>
            </div>
          </div>
        </ng-container>
      </div>

      <!-- MANAGE FLIGHTS -->
      <div *ngIf="activeTab === 'flights'">
        <div class="alert alert-success" *ngIf="flightActionSuccess">
          <i class="bi bi-check-circle-fill me-2"></i>{{ flightActionSuccess }}
        </div>
        <div class="alert alert-danger" *ngIf="flightActionError">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ flightActionError }}
        </div>
        <div class="text-center py-4" *ngIf="flightsLoading">
          <div class="spinner-border text-primary"></div>
        </div>
        <div class="table-responsive" *ngIf="!flightsLoading && flights.length > 0">
          <table class="table table-hover align-middle">
            <thead class="table-dark">
              <tr>
                <th>Flight</th><th>Airline</th><th>Route</th><th>Departure</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let f of flights">
                <td><strong>{{ f.flight_number }}</strong></td>
                <td>{{ f.airline }}</td>
                <td>{{ f.origin.code }} → {{ f.destination.code }}</td>
                <td>{{ f.departure_time | date:'dd MMM, HH:mm' }}</td>
                <td><span class="badge" [ngClass]="statusBadge(f.status)">{{ f.status | titlecase }}</span></td>
                <td>
                  <div class="d-flex gap-1">
                    <a [routerLink]="['/flights', f._id]" class="btn btn-outline-primary btn-sm"><i class="bi bi-eye"></i></a>
                    <button class="btn btn-outline-warning btn-sm" (click)="promptStatusUpdate(f)"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-outline-danger btn-sm" (click)="deleteFlight(f._id)" [disabled]="deletingId === f._id">
                      <span *ngIf="deletingId === f._id" class="spinner-border spinner-border-sm"></span>
                      <i class="bi bi-trash" *ngIf="deletingId !== f._id"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Status edit -->
        <div class="card border-0 shadow-sm mt-3" *ngIf="editingFlight">
          <div class="card-header bg-warning text-dark fw-bold">Update Status — {{ editingFlight.flight_number }}</div>
          <div class="card-body d-flex gap-2 align-items-center">
            <select class="form-select w-auto" [(ngModel)]="newStatus">
              <option value="scheduled">Scheduled</option>
              <option value="boarding">Boarding</option>
              <option value="departed">Departed</option>
              <option value="arrived">Arrived</option>
              <option value="delayed">Delayed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button class="btn btn-warning" (click)="updateStatus()" [disabled]="statusUpdating">
              <span *ngIf="statusUpdating" class="spinner-border spinner-border-sm me-1"></span>Save
            </button>
            <button class="btn btn-outline-secondary" (click)="editingFlight = null">Cancel</button>
          </div>
        </div>
      </div>

      <!-- ADD FLIGHT -->
      <div *ngIf="activeTab === 'add-flight'">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-light fw-bold"><i class="bi bi-plus-circle me-2"></i>New Flight</div>
          <div class="card-body">
            <div class="alert alert-success" *ngIf="addSuccess"><i class="bi bi-check-circle-fill me-2"></i>{{ addSuccess }}</div>
            <div class="alert alert-danger" *ngIf="addError"><i class="bi bi-exclamation-triangle-fill me-2"></i>{{ addError }}</div>
            <form [formGroup]="flightForm" (ngSubmit)="onAddFlight()" class="row g-3">
              <div class="col-md-4">
                <label class="form-label fw-semibold">Flight Number</label>
                <input type="text" class="form-control" formControlName="flight_number" placeholder="FL123" [class.is-invalid]="fi('flight_number')">
                <div class="invalid-feedback">Required.</div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Airline</label>
                <select class="form-select" formControlName="airline" [class.is-invalid]="fi('airline')">
                  <option value="">Select airline</option>
                  <option>Emirates</option><option>Qatar Airways</option>
                  <option>British Airways</option><option>Lufthansa</option>
                </select>
                <div class="invalid-feedback">Required.</div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Aircraft Type</label>
                <select class="form-select" formControlName="aircraft_type">
                  <option>Boeing 737</option><option>Boeing 777</option>
                  <option>Airbus A320</option><option>Airbus A380</option>
                </select>
              </div>
              <div class="col-12"><h6 class="text-muted">Origin</h6></div>
              <div class="col-md-4" formGroupName="origin">
                <input type="text" class="form-control" formControlName="code" placeholder="Code (e.g. LHR)">
              </div>
              <div class="col-md-4" formGroupName="origin">
                <input type="text" class="form-control" formControlName="city" placeholder="City">
              </div>
              <div class="col-md-4" formGroupName="origin">
                <input type="text" class="form-control" formControlName="country" placeholder="Country">
              </div>
              <div class="col-12"><h6 class="text-muted">Destination</h6></div>
              <div class="col-md-4" formGroupName="destination">
                <input type="text" class="form-control" formControlName="code" placeholder="Code (e.g. CDG)">
              </div>
              <div class="col-md-4" formGroupName="destination">
                <input type="text" class="form-control" formControlName="city" placeholder="City">
              </div>
              <div class="col-md-4" formGroupName="destination">
                <input type="text" class="form-control" formControlName="country" placeholder="Country">
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">Departure Time</label>
                <input type="datetime-local" class="form-control" formControlName="departure_time" [class.is-invalid]="fi('departure_time')">
                <div class="invalid-feedback">Required.</div>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">Arrival Time</label>
                <input type="datetime-local" class="form-control" formControlName="arrival_time" [class.is-invalid]="fi('arrival_time')">
                <div class="invalid-feedback">Required.</div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Status</label>
                <select class="form-select" formControlName="status">
                  <option value="scheduled">Scheduled</option>
                  <option value="boarding">Boarding</option>
                  <option value="delayed">Delayed</option>
                </select>
              </div>
              <div class="col-12">
                <button type="submit" class="btn btn-primary" [disabled]="addLoading">
                  <span *ngIf="addLoading" class="spinner-border spinner-border-sm me-2"></span>Create Flight
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

    </div>
  `
})
export class AdminComponent implements OnInit {
  activeTab: AdminTab = 'analytics';
  analytics: any = null;
  analyticsLoading = false;
  analyticsError = '';
  summaryStats: { icon: string; label: string; value: any }[] = [];
  flights: Flight[] = [];
  flightsLoading = false;
  flightActionSuccess = '';
  flightActionError = '';
  deletingId = '';
  editingFlight: Flight | null = null;
  newStatus = '';
  statusUpdating = false;
  flightForm!: FormGroup;
  addLoading = false;
  addSuccess = '';
  addError = '';

  constructor(private flightsService: FlightsService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildFlightForm();
    this.loadAnalytics();
  }

  setTab(tab: AdminTab): void {
    this.activeTab = tab;
    this.flightActionSuccess = '';
    this.flightActionError = '';
    if (tab === 'analytics' && !this.analytics) this.loadAnalytics();
    if (tab === 'flights' && this.flights.length === 0) this.loadFlights();
  }

  loadAnalytics(): void {
    this.analyticsLoading = true;
    this.analyticsError = '';
    this.flightsService.getAnalytics().subscribe({
      next: (data) => { this.analytics = data; this.buildSummaryStats(data); this.analyticsLoading = false; },
      error: (err) => { this.analyticsError = err.error?.message ?? 'Failed to load analytics.'; this.analyticsLoading = false; }
    });
  }

  buildSummaryStats(data: any): void {
    this.summaryStats = [
      { icon: 'bi-airplane-fill',     label: 'Total Flights',    value: data.total_flights    ?? data.flights    ?? '—' },
      { icon: 'bi-people-fill',       label: 'Total Passengers', value: data.total_passengers ?? data.passengers ?? '—' },
      { icon: 'bi-clock-history',     label: 'Delayed Flights',  value: data.delayed_flights  ?? data.delayed    ?? '—' },
      { icon: 'bi-check-circle-fill', label: 'On-Time Flights',  value: data.on_time_flights  ?? data.on_time    ?? '—' }
    ];
  }

  loadFlights(): void {
    this.flightsLoading = true;
    this.flightsService.getFlights(1, 100).subscribe({
      next: (res) => { this.flights = res.flights ?? (res as any); this.flightsLoading = false; },
      error: () => { this.flightsLoading = false; }
    });
  }

  deleteFlight(id: string): void {
    if (!confirm('Are you sure you want to delete this flight?')) return;
    this.deletingId = id;
    this.flightsService.deleteFlight(id).subscribe({
      next: () => { this.flights = this.flights.filter(f => f._id !== id); this.deletingId = ''; this.flightActionSuccess = 'Flight deleted successfully.'; },
      error: (err) => { this.deletingId = ''; this.flightActionError = err.error?.message ?? 'Delete failed.'; }
    });
  }

  promptStatusUpdate(flight: Flight): void {
    this.editingFlight = flight;
    this.newStatus = flight.status;
  }

  updateStatus(): void {
    if (!this.editingFlight) return;
    this.statusUpdating = true;
    this.flightsService.updateFlight(this.editingFlight._id, { status: this.newStatus as any }).subscribe({
      next: () => { this.editingFlight!.status = this.newStatus as any; this.editingFlight = null; this.statusUpdating = false; this.flightActionSuccess = 'Status updated.'; },
      error: (err) => { this.statusUpdating = false; this.flightActionError = err.error?.message ?? 'Update failed.'; }
    });
  }

  buildFlightForm(): void {
    this.flightForm = this.fb.group({
      flight_number: ['', Validators.required],
      airline: ['', Validators.required],
      aircraft_type: ['Boeing 737'],
      status: ['scheduled'],
      departure_time: ['', Validators.required],
      arrival_time: ['', Validators.required],
      origin: this.fb.group({ code: [''], city: [''], country: [''] }),
      destination: this.fb.group({ code: [''], city: [''], country: [''] })
    });
  }

  fi(field: string): boolean {
    const ctrl = this.flightForm.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  onAddFlight(): void {
    if (this.flightForm.invalid) { this.flightForm.markAllAsTouched(); return; }
    this.addLoading = true;
    this.addSuccess = '';
    this.addError = '';
    this.flightsService.createFlight(this.flightForm.value).subscribe({
      next: () => { this.addLoading = false; this.addSuccess = 'Flight created successfully!'; this.flightForm.reset({ aircraft_type: 'Boeing 737', status: 'scheduled' }); this.flights = []; },
      error: (err) => { this.addLoading = false; this.addError = err.error?.message ?? 'Failed to create flight.'; }
    });
  }

  statusBadge(status: string): string {
    const map: Record<string, string> = {
      scheduled: 'bg-secondary', boarding: 'bg-success', departed: 'bg-info text-dark',
      arrived: 'bg-dark', delayed: 'bg-warning text-dark', cancelled: 'bg-danger'
    };
    return map[status] ?? 'bg-secondary';
  }
}