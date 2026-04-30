import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FlightsService } from '../../services/flights.service';
import { PassengersService } from '../../services/passengers.service';
import { AuthService } from '../../services/auth.service';
import { Flight } from '../../models/flight.model';
import { PassengerFormData, BookingStatus } from '../../models/passenger.model';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule],
  template: `
    <!-- Toast notification -->
    <div class="position-fixed top-0 end-0 p-3" style="z-index:9999">
      <div class="toast align-items-center border-0 show"
           [class.bg-success]="toast.type==='success'"
           [class.bg-danger]="toast.type==='error'"
           class="text-white"
           *ngIf="toast.visible"
           style="min-width:300px">
        <div class="d-flex">
          <div class="toast-body fw-semibold">
            <i class="bi me-2"
               [class.bi-check-circle-fill]="toast.type==='success'"
               [class.bi-exclamation-triangle-fill]="toast.type==='error'"></i>
            {{ toast.message }}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto"
                  (click)="toast.visible=false"></button>
        </div>
      </div>
    </div>

    <div class="bg-primary text-white py-3 mb-4">
      <div class="container">
        <h4 class="fw-bold mb-0">
          <i class="bi bi-ticket-perforated-fill me-2"></i>Book Your Flight
        </h4>
      </div>
    </div>

    <div class="container pb-5">

      <a routerLink="/flights" class="btn btn-outline-secondary btn-sm mb-4">
        <i class="bi bi-arrow-left me-1"></i>Back to Flights
      </a>

      <div class="text-center py-5" *ngIf="flightLoading">
        <div class="spinner-border text-primary"></div>
      </div>

      <div class="alert alert-danger" *ngIf="flightError">{{ flightError }}</div>

      <ng-container *ngIf="flight && !flightLoading">

        <!-- Flight summary -->
        <div class="card border-0 shadow-sm rounded-4 mb-4">
          <div class="card-header bg-primary text-white rounded-top-4">
            <h6 class="mb-0 fw-bold">
              <i class="bi bi-airplane-fill me-2"></i>
              {{ flight.flight_number }} · {{ flight.airline }} · {{ flight.aircraft_type }}
            </h6>
          </div>
          <div class="card-body">
            <div class="row text-center g-3">
              <div class="col-4">
                <div class="fs-3 fw-bold text-primary">{{ flight.origin.code }}</div>
                <div class="text-muted small">{{ flight.origin.city }}</div>
                <div class="small fw-semibold">{{ flight.departure_time | date:'dd MMM, HH:mm' }}</div>
              </div>
              <div class="col-4 d-flex align-items-center justify-content-center">
                <i class="bi bi-arrow-right text-muted fs-4"></i>
              </div>
              <div class="col-4">
                <div class="fs-3 fw-bold text-primary">{{ flight.destination.code }}</div>
                <div class="text-muted small">{{ flight.destination.city }}</div>
                <div class="small fw-semibold">{{ flight.arrival_time | date:'dd MMM, HH:mm' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step indicators -->
        <div class="d-flex align-items-center mb-2 gap-2">
          <div class="step-circle" [class.active]="step>=1" [class.done]="step>1">
            <i class="bi bi-check" *ngIf="step>1"></i>
            <span *ngIf="step<=1">1</span>
          </div>
          <div class="flex-grow-1 border-top" [class.border-primary]="step>1"></div>
          <div class="step-circle" [class.active]="step>=2" [class.done]="step>2">
            <i class="bi bi-check" *ngIf="step>2"></i>
            <span *ngIf="step<=2">2</span>
          </div>
          <div class="flex-grow-1 border-top" [class.border-primary]="step>2"></div>
          <div class="step-circle" [class.active]="step>=3">3</div>
        </div>
        <div class="d-flex justify-content-between mb-4 small text-muted px-1">
          <span [class.text-primary]="step>=1" [class.fw-semibold]="step===1">Trip Details</span>
          <span [class.text-primary]="step>=2" [class.fw-semibold]="step===2">Passengers</span>
          <span [class.text-primary]="step>=3" [class.fw-semibold]="step===3">Confirm</span>
        </div>

        <!-- STEP 1 -->
        <div class="card border-0 shadow-sm rounded-4 mb-4" *ngIf="step===1">
          <div class="card-header bg-light fw-bold rounded-top-4">
            <i class="bi bi-calendar3 me-2 text-primary"></i>Trip Details
          </div>
          <div class="card-body p-4">
            <form [formGroup]="tripForm">
              <div class="mb-4">
                <label class="form-label fw-semibold">Trip Type</label>
                <div class="d-flex gap-3 flex-wrap">
                  <div class="form-check" *ngFor="let t of tripTypes">
                    <input class="form-check-input" type="radio"
                           [value]="t.value" formControlName="tripType"
                           [id]="'trip_'+t.value">
                    <label class="form-check-label" [for]="'trip_'+t.value">{{ t.label }}</label>
                  </div>
                </div>
              </div>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Departure Date</label>
                  <input type="date" class="form-control" formControlName="departDate"
                         [min]="today"
                         [class.is-invalid]="tf['departDate'].invalid && tf['departDate'].touched">
                  <div class="invalid-feedback">Select a departure date.</div>
                </div>
                <div class="col-md-6" *ngIf="tripForm.get('tripType')?.value!=='one-way'">
                  <label class="form-label fw-semibold">Return Date</label>
                  <input type="date" class="form-control" formControlName="returnDate"
                         [min]="tripForm.get('departDate')?.value||today">
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Class</label>
                  <select class="form-select" formControlName="seatClass">
                    <option value="economy">Economy — £199</option>
                    <option value="business">Business — £599</option>
                    <option value="first">First Class — £1,299</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Passengers</label>
                  <select class="form-select" formControlName="numPassengers">
                    <option *ngFor="let n of [1,2,3,4,5,6,7,8,9]" [value]="n">
                      {{ n }} {{ n===1?'Passenger':'Passengers' }}
                    </option>
                  </select>
                </div>
                <div class="col-12">
                  <label class="form-label fw-semibold">
                    Special Requests <span class="text-muted small">(optional)</span>
                  </label>
                  <textarea class="form-control" rows="2" formControlName="specialRequests"
                            placeholder="e.g. wheelchair assistance, vegetarian meal..."></textarea>
                </div>
              </div>

              <!-- Price summary -->
              <div class="mt-4 p-3 rounded-3 bg-light">
                <div class="d-flex justify-content-between mb-1">
                  <span class="text-muted">{{ selectedClass }} × {{ tripForm.get('numPassengers')?.value }}</span>
                  <span class="fw-semibold">£{{ totalPrice }}</span>
                </div>
                <div class="d-flex justify-content-between text-muted small"
                     *ngIf="tripForm.get('tripType')?.value==='round-trip'">
                  <span>Return flight included</span>
                  <span>× 2</span>
                </div>
                <hr class="my-2">
                <div class="d-flex justify-content-between fw-bold fs-5">
                  <span>Total</span>
                  <span class="text-success">£{{ grandTotal }}</span>
                </div>
              </div>

              <button class="btn btn-primary w-100 mt-4 py-2 fw-semibold"
                      (click)="goToStep2()" [disabled]="tripForm.invalid">
                Continue to Passenger Details <i class="bi bi-arrow-right ms-2"></i>
              </button>
            </form>
          </div>
        </div>

        <!-- STEP 2 -->
        <div class="card border-0 shadow-sm rounded-4 mb-4" *ngIf="step===2">
          <div class="card-header bg-light fw-bold rounded-top-4">
            <i class="bi bi-people-fill me-2 text-primary"></i>
            Passenger Details ({{ passengerGroups.length }})
          </div>
          <div class="card-body p-4">
            <div *ngFor="let pg of passengerGroups; let i=index" class="mb-4">
              <div class="d-flex align-items-center gap-2 mb-3">
                <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                     style="width:28px;height:28px;font-size:0.8rem">{{ i+1 }}</div>
                <h6 class="fw-bold mb-0">Passenger {{ i+1 }}</h6>
                <span class="badge bg-light text-dark border">{{ tripForm.get('seatClass')?.value | titlecase }}</span>
              </div>
              <form [formGroup]="pg" class="row g-3">
                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Full Name *</label>
                  <input type="text" class="form-control" formControlName="full_name"
                         [class.is-invalid]="pg.get('full_name')?.invalid && pg.get('full_name')?.touched"
                         placeholder="As on passport">
                  <div class="invalid-feedback">Required.</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Passport Number *</label>
                  <input type="text" class="form-control" formControlName="passport_number"
                         [class.is-invalid]="pg.get('passport_number')?.invalid && pg.get('passport_number')?.touched"
                         placeholder="e.g. P1234567">
                  <div class="invalid-feedback">Required.</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Nationality</label>
                  <input type="text" class="form-control" formControlName="nationality" placeholder="e.g. British">
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Seat Number</label>
                  <input type="text" class="form-control" formControlName="seat_number" placeholder="e.g. 14A">
                </div>
              </form>
              <hr *ngIf="i < passengerGroups.length-1" class="mt-4">
            </div>

            <div class="alert alert-danger py-2" *ngIf="formError">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ formError }}
            </div>

            <div class="d-flex gap-2 mt-3">
              <button class="btn btn-outline-secondary" (click)="step=1">
                <i class="bi bi-arrow-left me-1"></i>Back
              </button>
              <button class="btn btn-primary flex-grow-1 py-2 fw-semibold" (click)="goToStep3()">
                Review & Confirm <i class="bi bi-arrow-right ms-2"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- STEP 3 -->
        <div class="card border-0 shadow-sm rounded-4 mb-4" *ngIf="step===3">
          <div class="card-header bg-light fw-bold rounded-top-4">
            <i class="bi bi-check2-circle me-2 text-success"></i>Review & Confirm
          </div>
          <div class="card-body p-4">
            <div class="row g-3 mb-4">
              <div class="col-md-6">
                <div class="p-3 bg-light rounded-3 h-100">
                  <div class="small text-muted fw-semibold mb-2">FLIGHT DETAILS</div>
                  <div class="small mb-1"><span class="text-muted">Flight:</span> <strong>{{ flight.flight_number }} · {{ flight.airline }}</strong></div>
                  <div class="small mb-1"><span class="text-muted">Route:</span> <strong>{{ flight.origin.code }} → {{ flight.destination.code }}</strong></div>
                  <div class="small mb-1"><span class="text-muted">Trip:</span> <strong>{{ tripForm.get('tripType')?.value | titlecase }}</strong></div>
                  <div class="small mb-1"><span class="text-muted">Class:</span> <strong>{{ tripForm.get('seatClass')?.value | titlecase }}</strong></div>
                  <div class="small mb-1"><span class="text-muted">Departure:</span> <strong>{{ tripForm.get('departDate')?.value }}</strong></div>
                  <div class="small" *ngIf="tripForm.get('returnDate')?.value">
                    <span class="text-muted">Return:</span> <strong>{{ tripForm.get('returnDate')?.value }}</strong>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="p-3 bg-light rounded-3 h-100">
                  <div class="small text-muted fw-semibold mb-2">PASSENGERS</div>
                  <div *ngFor="let pg of passengerGroups; let i=index" class="mb-2">
                    <div class="small fw-semibold">{{ i+1 }}. {{ pg.value.full_name }}</div>
                    <div class="small text-muted">
                      {{ pg.value.passport_number }}
                      <span *ngIf="pg.value.seat_number"> · Seat {{ pg.value.seat_number }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Total -->
            <div class="p-3 rounded-3 border border-success bg-success bg-opacity-10 mb-4">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <div class="fw-bold fs-5 text-success">Total: £{{ grandTotal }}</div>
                  <div class="text-muted small">
                    {{ tripForm.get('numPassengers')?.value }} × £{{ priceMap[tripForm.get('seatClass')?.value ?? 'economy'] }}
                    <span *ngIf="tripForm.get('tripType')?.value==='round-trip'"> × 2 (return)</span>
                  </div>
                </div>
                <i class="bi bi-shield-check text-success fs-3 opacity-50"></i>
              </div>
            </div>

            <div class="alert alert-danger py-2" *ngIf="formError">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ formError }}
            </div>

            <div class="d-flex gap-2">
              <button class="btn btn-outline-secondary" (click)="step=2" [disabled]="submitting">
                <i class="bi bi-arrow-left me-1"></i>Back
              </button>
              <button class="btn btn-success flex-grow-1 py-2 fw-semibold"
                      (click)="confirmBooking()" [disabled]="submitting">
                <span *ngIf="submitting" class="spinner-border spinner-border-sm me-2"></span>
                <i class="bi bi-check-circle me-2" *ngIf="!submitting"></i>
                {{ submitting ? 'Processing...' : 'Confirm & Pay £' + grandTotal }}
              </button>
            </div>
            <p class="text-center text-muted small mt-3">
              <i class="bi bi-shield-lock me-1"></i>Secure booking · Your data is encrypted
            </p>
          </div>
        </div>

      </ng-container>
    </div>
  `,
  styles: [`
    .step-circle {
      width:32px;height:32px;border-radius:50%;
      background:#dee2e6;color:#6c757d;
      display:flex;align-items:center;justify-content:center;
      font-weight:bold;font-size:0.85rem;flex-shrink:0;transition:all 0.3s;
    }
    .step-circle.active{background:#0d6efd;color:white;}
    .step-circle.done{background:#198754;color:white;}
  `]
})
export class BookingComponent implements OnInit {
  flight: Flight | null = null;
  flightLoading = false;
  flightError = '';
  submitting = false;
  formError = '';
  step = 1;
  private flightId = '';
  today = new Date().toISOString().split('T')[0];
  toast = { visible: false, message: '', type: 'success' };

  tripTypes = [
    { value: 'one-way',    label: 'One Way' },
    { value: 'round-trip', label: 'Round Trip' },
    { value: 'multi-city', label: 'Multi-City' }
  ];

  priceMap: Record<string, number> = { economy: 199, business: 599, first: 1299 };

  tripForm: FormGroup;
  passengerGroups: FormGroup[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private flightsService: FlightsService,
    private passengersService: PassengersService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.tripForm = this.fb.group({
      tripType:        ['one-way'],
      departDate:      ['', Validators.required],
      returnDate:      [''],
      seatClass:       ['economy'],
      numPassengers:   [1],
      specialRequests: ['']
    });
  }

  ngOnInit(): void {
    this.flightId = this.route.snapshot.paramMap.get('id')!;
    this.loadFlight();
    this.buildPassengerForms();
    this.tripForm.get('numPassengers')?.valueChanges.subscribe(() => this.buildPassengerForms());
  }

  get tf() { return this.tripForm.controls; }

  get selectedClass(): string {
    const c = this.tripForm.get('seatClass')?.value ?? 'economy';
    return c.charAt(0).toUpperCase() + c.slice(1);
  }

  get totalPrice(): number {
    const c = this.tripForm.get('seatClass')?.value ?? 'economy';
    const n = Number(this.tripForm.get('numPassengers')?.value ?? 1);
    return this.priceMap[c] * n;
  }

  get grandTotal(): number {
    return this.tripForm.get('tripType')?.value === 'round-trip'
      ? this.totalPrice * 2 : this.totalPrice;
  }

  buildPassengerForms(): void {
    const n = Number(this.tripForm.get('numPassengers')?.value ?? 1);
    this.passengerGroups = Array.from({ length: n }, () =>
      this.fb.group({
        full_name:       ['', Validators.required],
        passport_number: ['', Validators.required],
        nationality:     [''],
        seat_number:     ['']
      })
    );
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

  goToStep2(): void {
    if (this.tripForm.invalid) { this.tripForm.markAllAsTouched(); return; }
    this.step = 2;
    window.scrollTo(0, 0);
  }

  goToStep3(): void {
    const invalid = this.passengerGroups.some(g => { g.markAllAsTouched(); return g.invalid; });
    if (invalid) { this.formError = 'Please fill in all required passenger details.'; return; }
    this.formError = '';
    this.step = 3;
    window.scrollTo(0, 0);
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { visible: true, message, type };
    setTimeout(() => { this.toast.visible = false; }, 5000);
  }

  confirmBooking(): void {
    this.submitting = true;
    this.formError = '';
    const seatClass = this.tripForm.get('seatClass')?.value as 'economy' | 'business' | 'first';
    const currentUser = this.authService.getCurrentUser();

    // Cast booking_status explicitly to satisfy the strict type
    const bookings: PassengerFormData[] = this.passengerGroups.map((pg, i) => ({
      full_name:       pg.value.full_name as string,
      passport_number: pg.value.passport_number as string,
      nationality:     (pg.value.nationality as string) || 'Unknown',
      seat_class:      seatClass,
      seat_number:     (pg.value.seat_number as string) || `${i + 1}A`,
      booking_status:  'booked' as BookingStatus
    }));

    let completed = 0;
    let hasError = false;

    bookings.forEach(passenger => {
      this.passengersService.addPassenger(this.flightId, passenger).subscribe({
        next: () => {
          completed++;

          // Save passport number to user's local storage for My Bookings lookup
          if (currentUser) {
            const storageKey = `skybook_${currentUser.username}_passports`;
            const existing: string[] = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
            if (!existing.includes(passenger.passport_number)) {
              existing.push(passenger.passport_number);
              localStorage.setItem(storageKey, JSON.stringify(existing));
            }
          }

          if (completed === bookings.length && !hasError) {
            this.submitting = false;
            this.showToast(
              `Booking confirmed for ${bookings.length} passenger(s)! Total: £${this.grandTotal}`,
              'success'
            );
            setTimeout(() => this.router.navigate(['/my-bookings']), 2000);
          }
        },
        error: (err) => {
          if (!hasError) {
            hasError = true;
            this.submitting = false;
            this.formError = err.error?.message ?? err.error?.error
              ?? 'Booking failed. Is your Flask API running on port 5001?';
            this.showToast('Booking failed: ' + this.formError, 'error');
          }
        }
      });
    });
  }
}