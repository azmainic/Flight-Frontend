/**
 * HomeComponent: Landing page of the SkyBook application
 * Serves as the main entry point for users with hero section, search, and marketing content
 * Displays popular destinations, airline partners, features, and call-to-action sections
 * Provides quick search functionality that navigates to flights page with query parameters
 */

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
    <!-- Hero with background image -->
    <section class="hero-section text-white position-relative"
             style="background: linear-gradient(135deg, rgba(126,34,206,0.93) 0%, rgba(88,28,135,0.97) 100%),
                    url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600&q=80') center/cover no-repeat;
                    min-height: 520px;">
      <div class="container py-5 position-relative" style="z-index:2">
        <div class="row align-items-center min-vh-50 py-4">
          <div class="col-lg-6">
            <span class="badge bg-white text-primary mb-3 px-3 py-2">
              ✈ Book flights worldwide
            </span>
            <h1 class="display-4 fw-bold mb-3 lh-sm">
              Your Journey<br>Starts Here
            </h1>
            <p class="lead mb-4 text-white-75">
              Search and book flights with Emirates, Qatar Airways,
              British Airways, and Lufthansa — all in one place.
            </p>
            <div class="d-flex gap-3 flex-wrap">
              <a routerLink="/flights" class="btn btn-light btn-lg px-4 fw-semibold">
                <i class="bi bi-search me-2"></i>Browse Flights
              </a>
              <a *ngIf="!isLoggedIn" routerLink="/register"
                 class="btn btn-outline-light btn-lg px-4">
                Get Started Free
              </a>
              <a *ngIf="isLoggedIn" routerLink="/my-bookings"
                 class="btn btn-outline-light btn-lg px-4">
                <i class="bi bi-ticket-perforated me-2"></i>My Bookings
              </a>
            </div>
          </div>
          <div class="col-lg-6 d-none d-lg-flex justify-content-center align-items-center">
            <div class="text-center">
              <i class="bi bi-airplane text-white" style="font-size:9rem;opacity:0.15"></i>
            </div>
          </div>
        </div>

        <!-- Quick search bar overlapping hero -->
        <div class="row mt-4">
          <div class="col-12">
            <div class="card border-0 shadow-lg rounded-4 p-4">
              <form [formGroup]="searchForm" (ngSubmit)="onSearch()">
                <div class="row g-3 align-items-end">
                  <div class="col-md-4">
                    <label class="form-label fw-semibold small text-dark">From</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light border-end-0">
                        <i class="bi bi-geo-alt text-primary"></i>
                      </span>
                      <input type="text" class="form-control border-start-0 ps-0"
                             formControlName="origin"
                             placeholder="City or airport code">
                    </div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label fw-semibold small text-dark">To</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light border-end-0">
                        <i class="bi bi-geo text-primary"></i>
                      </span>
                      <input type="text" class="form-control border-start-0 ps-0"
                             formControlName="destination"
                             placeholder="City or airport code">
                    </div>
                  </div>
                  <div class="col-md-4">
                    <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold">
                      <i class="bi bi-search me-2"></i>Search Flights
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats bar -->
    <section class="bg-primary text-white py-3">
      <div class="container">
        <div class="row text-center g-3">
          <div class="col-6 col-md-3" *ngFor="let stat of stats">
            <div class="fw-bold fs-5">{{ stat.value }}</div>
            <div class="small text-white-50">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Popular destinations with real images -->
    <section class="py-5">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="fw-bold">Popular Destinations</h2>
          <p class="text-muted">Most booked routes on SkyBook</p>
        </div>
        <div class="row g-4">
          <div class="col-md-4" *ngFor="let dest of destinations">
            <div class="card border-0 shadow-sm overflow-hidden rounded-4 destination-card"
                 style="cursor:pointer" (click)="searchDestination(dest.code)">
              <div style="height:200px; overflow:hidden; position:relative">
                <img [src]="dest.image" [alt]="dest.city"
                     style="width:100%;height:100%;object-fit:cover;transition:transform 0.3s">
                <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.6),transparent)">
                </div>
                <div style="position:absolute;bottom:16px;left:16px" class="text-white">
                  <div class="fw-bold fs-5">{{ dest.city }}</div>
                  <div class="small">{{ dest.country }}</div>
                </div>
                <div style="position:absolute;top:12px;right:12px">
                  <span class="badge bg-white text-primary fw-semibold">{{ dest.code }}</span>
                </div>
              </div>
              <div class="card-body d-flex justify-content-between align-items-center py-2">
                <span class="text-muted small">From</span>
                <span class="fw-bold text-success">{{ dest.price }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="py-5 bg-light">
      <div class="container">
        <h2 class="text-center fw-bold mb-5">Why Choose SkyBook?</h2>
        <div class="row g-4">
          <div class="col-md-4" *ngFor="let feature of features">
            <div class="card border-0 shadow-sm h-100 text-center p-4 rounded-4">
              <i [class]="'bi ' + feature.icon + ' text-primary mb-3'" style="font-size:2.5rem;"></i>
              <h5 class="fw-bold">{{ feature.title }}</h5>
              <p class="text-muted mb-0 small">{{ feature.desc }}</p>
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
            <div class="card border-0 shadow-sm text-center p-4 h-100 rounded-4">
              <i class="bi bi-airplane text-primary mb-2" style="font-size:2rem;"></i>
              <div class="fw-semibold">{{ airline }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-5 bg-primary text-white" *ngIf="!isLoggedIn">
      <div class="container text-center">
        <h2 class="fw-bold mb-3">Ready to fly?</h2>
        <p class="lead mb-4 text-white-75">Join thousands of travellers booking smarter with SkyBook.</p>
        <a routerLink="/register" class="btn btn-light btn-lg px-5 fw-semibold me-3">
          Create Free Account
        </a>
        <a routerLink="/login" class="btn btn-outline-light btn-lg px-5">Sign In</a>
      </div>
    </section>
  `,
  styles: [`
    .destination-card:hover img { transform: scale(1.05); }
    .text-white-75 { color: rgba(255,255,255,0.75) !important; }
  `]
})

 /** 
   * Tracks whether current user is authenticated
   * Used to conditionally show different CTAs and buttons
   * Updated via subscription to AuthService.currentUser$
   */

export class HomeComponent implements OnInit {
  isLoggedIn = false;
  searchForm: FormGroup;

  stats = [
    { value: '50+', label: 'Destinations' },
    { value: '4',   label: 'Airlines' },
    { value: '100+', label: 'Daily Flights' },
    { value: '24/7', label: 'Support' }
  ];

  destinations = [
    {
      city: 'London', country: 'United Kingdom', code: 'LHR', price: '£89',
      image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80'
    },
    {
      city: 'Paris', country: 'France', code: 'CDG', price: '£109',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80'
    },
    {
      city: 'Dubai', country: 'UAE', code: 'DXB', price: '£299',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80'
    },
    {
      city: 'New York', country: 'USA', code: 'JFK', price: '£399',
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80'
    },
    {
      city: 'Frankfurt', country: 'Germany', code: 'FRA', price: '£129',
      image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600&q=80'
    },
    {
      city: 'New York', country: 'USA', code: 'JFK', price: '£379',
      image: 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=600&q=80'
    }
  ];

  features = [
    { icon: 'bi-lightning-charge-fill', title: 'Instant Booking',
      desc: 'Book your seat in seconds with our streamlined booking flow.' },
    { icon: 'bi-shield-check-fill', title: 'Secure & Private',
      desc: 'Industry-standard JWT authentication plus Google/Apple sign-in.' },
    { icon: 'bi-phone-fill', title: 'Mobile Friendly',
      desc: 'Fully responsive design works perfectly on any device.' }
  ];

  airlines = ['Emirates', 'Qatar Airways', 'British Airways', 'Lufthansa'];

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.searchForm = this.fb.group({ origin: [''], destination: [''] });
  }

   /** 
   * Lifecycle hook that runs after component initialization
   * Subscribes to currentUser$ observable to track authentication state
   * Updates isLoggedIn flag whenever user logs in or out
   */

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
    });
  }

   // ==================== SEARCH METHODS ====================
  /**
   * Handles quick search form submission
   * Extracts origin and destination values from form
   * Navigates to flights page with query parameters
   * Null values are omitted from URL (clean URL generation)
   */

  onSearch(): void {
    const { origin, destination } = this.searchForm.value;
    this.router.navigate(['/flights'], {
      queryParams: { origin: origin || null, destination: destination || null }
    });
  }

  /**
   * Searches for flights to a specific destination
   * Called when user clicks on a popular destination card
   * Navigates to flights page with destination query parameter
   * Allows users to quickly see flights to popular destinations
   */
  
  searchDestination(code: string): void {
    this.router.navigate(['/flights'], { queryParams: { destination: code } });
  }
}