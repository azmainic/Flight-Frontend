import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <!-- Hero -->
    <section class="bg-primary text-white py-5">
      <div class="container py-4">
        <div class="row align-items-center">
          <div class="col-lg-6">
            <h1 class="display-4 fw-bold mb-3">
              <i class="bi bi-airplane-fill me-3"></i>SkyBook
            </h1>
            <p class="lead mb-4">
              Search and book flights with Emirates, Qatar Airways, British Airways, and Lufthansa — all in one place.
            </p>
            <a routerLink="/flights" class="btn btn-light btn-lg me-3">
              <i class="bi bi-search me-2"></i>Browse Flights
            </a>
            <a *ngIf="!isLoggedIn" routerLink="/register" class="btn btn-outline-light btn-lg">
              Get Started
            </a>
          </div>
          <div class="col-lg-6 d-none d-lg-flex justify-content-center">
            <i class="bi bi-airplane text-white-50" style="font-size: 10rem;"></i>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Search -->
    <section class="bg-white shadow-sm py-4">
      <div class="container">
        <form [formGroup]="searchForm" (ngSubmit)="onSearch()" class="row g-3 align-items-end">
          <div class="col-md-4">
            <label class="form-label fw-semibold">From</label>
            <input type="text" class="form-control form-control-lg"
                   formControlName="origin"
                   placeholder="e.g. London or LHR">
          </div>
          <div class="col-md-4">
            <label class="form-label fw-semibold">To</label>
            <input type="text" class="form-control form-control-lg"
                   formControlName="destination"
                   placeholder="e.g. Paris or CDG">
          </div>
          <div class="col-md-4">
            <button type="submit" class="btn btn-primary btn-lg w-100">
              <i class="bi bi-search me-2"></i>Search Flights
            </button>
          </div>
        </form>
      </div>
    </section>

    <!-- Features -->
    <section class="py-5 bg-light">
      <div class="container">
        <h2 class="text-center fw-bold mb-5">Why Choose SkyBook?</h2>
        <div class="row g-4">
          <div class="col-md-4" *ngFor="let feature of features">
            <div class="card border-0 shadow-sm h-100 text-center p-4">
              <i [class]="'bi ' + feature.icon + ' text-primary mb-3'" style="font-size:2.5rem;"></i>
              <h5 class="fw-bold">{{ feature.title }}</h5>
              <p class="text-muted mb-0">{{ feature.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Airlines -->
    <section class="py-5">
      <div class="container">
        <h2 class="text-center fw-bold mb-5">Our Airline Partners</h2>
        <div class="row g-4 justify-content-center">
          <div class="col-6 col-md-3" *ngFor="let airline of airlines">
            <div class="card border-0 shadow-sm text-center p-4 h-100">
              <i class="bi bi-airplane text-primary mb-2" style="font-size:2rem;"></i>
              <div class="fw-semibold">{{ airline }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class HomeComponent implements OnInit {
  isLoggedIn = false;

  searchForm: FormGroup;

  features = [
    { icon: 'bi-lightning-charge-fill', title: 'Instant Booking',   desc: 'Book your seat in seconds with our streamlined booking flow.' },
    { icon: 'bi-shield-check-fill',     title: 'Secure Payments',   desc: 'Your data is protected with industry-standard JWT authentication.' },
    { icon: 'bi-geo-alt-fill',          title: 'Global Coverage',   desc: 'Flights between major hubs across Europe, USA, UAE, and beyond.' }
  ];

  airlines = ['Emirates', 'Qatar Airways', 'British Airways', 'Lufthansa'];

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.searchForm = this.fb.group({
      origin: [''],
      destination: ['']
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
    });
  }

  onSearch(): void {
    const { origin, destination } = this.searchForm.value;
    this.router.navigate(['/flights'], {
      queryParams: { origin: origin || null, destination: destination || null }
    });
  }
}