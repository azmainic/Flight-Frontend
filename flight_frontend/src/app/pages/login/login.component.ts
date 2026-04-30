import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-vh-100 bg-light d-flex align-items-center py-5">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-sm-10 col-md-6 col-lg-4">

            <div class="text-center mb-4">
              <i class="bi bi-airplane-fill text-primary" style="font-size:2.5rem;"></i>
              <h2 class="fw-bold mt-2 mb-0">Welcome back</h2>
              <p class="text-muted small">Sign in to your SkyBook account</p>
              <div class="alert alert-info py-2 small" *ngIf="returnUrl">
                <i class="bi bi-info-circle me-1"></i>
                Please sign in to continue with your booking.
              </div>
            </div>

            <div class="card border-0 shadow-sm">
              <div class="card-body p-4">

                <!-- Social logins -->
                <div class="d-grid gap-2 mb-4">
                  <button class="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2"
                          type="button" (click)="loginWith('google-oauth2')">
                    <svg width="18" height="18" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    Continue with Google
                  </button>
                  <button class="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2"
                          type="button" (click)="loginWith('facebook')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Continue with Facebook
                  </button>
                  <button class="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2"
                          type="button" (click)="loginWith('apple')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    Continue with Apple
                  </button>
                  <button class="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2"
                          type="button" (click)="loginWith('windowslive')">
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#F25022" d="M1 1h10v10H1z"/>
                      <path fill="#7FBA00" d="M13 1h10v10H13z"/>
                      <path fill="#00A4EF" d="M1 13h10v10H1z"/>
                      <path fill="#FFB900" d="M13 13h10v10H13z"/>
                    </svg>
                    Continue with Microsoft
                  </button>
                </div>

                <div class="d-flex align-items-center mb-4">
                  <hr class="flex-grow-1">
                  <span class="px-3 text-muted small">or sign in with username</span>
                  <hr class="flex-grow-1">
                </div>

                <div class="alert alert-success py-2" *ngIf="successMessage">
                  <i class="bi bi-check-circle-fill me-2"></i>{{ successMessage }}
                </div>
                <div class="alert alert-danger py-2" *ngIf="errorMessage">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
                </div>

                <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" autocomplete="off">
                  <input type="text" style="display:none" tabindex="-1">
                  <input type="password" style="display:none" tabindex="-1">

                  <div class="mb-3">
                    <label class="form-label fw-semibold small">Username</label>
                    <div class="input-group">
                      <span class="input-group-text bg-white">
                        <i class="bi bi-person text-muted"></i>
                      </span>
                      <input type="text" class="form-control"
                             formControlName="username"
                             [class.is-invalid]="isInvalid('username')"
                             placeholder="Enter your username"
                             autocomplete="off"
                             [attr.readonly]="autofillBlocked ? true : null"
                             (focus)="enableInput($event)">
                    </div>
                    <div class="text-danger small mt-1" *ngIf="isInvalid('username')">
                      Username is required.
                    </div>
                  </div>

                  <div class="mb-3">
                    <div class="d-flex justify-content-between">
                      <label class="form-label fw-semibold small">Password</label>
                      <a href="#" class="small text-primary"
                         (click)="$event.preventDefault()">Forgot password?</a>
                    </div>
                    <div class="input-group">
                      <span class="input-group-text bg-white">
                        <i class="bi bi-lock text-muted"></i>
                      </span>
                      <input [type]="showPassword ? 'text' : 'password'"
                             class="form-control"
                             formControlName="password"
                             [class.is-invalid]="isInvalid('password')"
                             placeholder="Enter your password"
                             autocomplete="new-password"
                             [attr.readonly]="autofillBlocked ? true : null"
                             (focus)="enableInput($event)">
                      <button class="btn btn-outline-secondary" type="button"
                              (click)="showPassword = !showPassword" tabindex="-1">
                        <i [class]="'bi ' + (showPassword ? 'bi-eye-slash' : 'bi-eye')"></i>
                      </button>
                    </div>
                    <div class="text-danger small mt-1" *ngIf="isInvalid('password')">
                      Password is required.
                    </div>
                  </div>

                  <div class="form-check mb-3">
                    <input type="checkbox" class="form-check-input" id="remember"
                           formControlName="rememberMe">
                    <label class="form-check-label small" for="remember">Remember me</label>
                  </div>

                  <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold"
                          [disabled]="loading">
                    <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ loading ? 'Signing in...' : 'Sign In' }}
                  </button>
                </form>
              </div>
            </div>

            <p class="text-center mt-3 text-muted small">
              Don't have an account?
              <a routerLink="/register" class="text-primary fw-semibold">Create one free</a>
            </p>

          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  autofillBlocked = true;
  returnUrl = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private auth0: Auth0Service,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      username:   ['', Validators.required],
      password:   ['', Validators.required],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Capture returnUrl from query params
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] ?? '';

    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state?.['registered']) {
      this.successMessage = 'Account created! Please sign in.';
    }

    // If already logged in, redirect immediately
    this.authService.currentUser$.subscribe(user => {
      if (user && this.returnUrl) {
        this.router.navigateByUrl(this.returnUrl);
      }
    });
  }

  enableInput(event: FocusEvent): void {
    (event.target as HTMLInputElement).removeAttribute('readonly');
    this.autofillBlocked = false;
  }

  isInvalid(field: string): boolean {
    const ctrl = this.loginForm.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  loginWith(connection: string): void {
    // Store returnUrl in localStorage so Auth0 redirect can use it
    if (this.returnUrl) {
      localStorage.setItem('auth0_return_url', this.returnUrl);
    }
    this.auth0.loginWithRedirect({
      authorizationParams: { connection }
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: () => {
        this.loading = false;
        // Redirect to returnUrl or default page
        const target = this.returnUrl ||
          (this.authService.isAdmin() ? '/admin' : '/flights');
        this.router.navigateByUrl(target);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err.error?.message ?? err.error?.error ?? 'Invalid username or password.';
      }
    });
  }
}