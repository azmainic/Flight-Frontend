import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-vh-100 bg-light d-flex align-items-center">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-sm-10 col-md-6 col-lg-4">

            <div class="text-center mb-4">
              <i class="bi bi-airplane-fill text-primary" style="font-size:3rem;"></i>
              <h2 class="fw-bold mt-2">Welcome Back</h2>
              <p class="text-muted">Sign in to your SkyBook account</p>
            </div>

            <div class="card border-0 shadow">
              <div class="card-body p-4">

                <div class="alert alert-danger" *ngIf="errorMessage">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
                </div>

                <div class="alert alert-success" *ngIf="successMessage">
                  <i class="bi bi-check-circle-fill me-2"></i>{{ successMessage }}
                </div>

                <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">

                  <div class="mb-3">
                    <label class="form-label fw-semibold">Username</label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="bi bi-person"></i></span>
                      <input type="text"
                             class="form-control"
                             formControlName="username"
                             [class.is-invalid]="isInvalid('username')"
                             placeholder="Enter username">
                    </div>
                    <div class="invalid-feedback d-block"
                         *ngIf="isInvalid('username')">Username is required.</div>
                  </div>

                  <div class="mb-4">
                    <label class="form-label fw-semibold">Password</label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="bi bi-lock"></i></span>
                      <input [type]="showPassword ? 'text' : 'password'"
                             class="form-control"
                             formControlName="password"
                             [class.is-invalid]="isInvalid('password')"
                             placeholder="Enter password">
                      <button class="btn btn-outline-secondary" type="button"
                              (click)="showPassword = !showPassword">
                        <i [class]="'bi ' + (showPassword ? 'bi-eye-slash' : 'bi-eye')"></i>
                      </button>
                    </div>
                    <div class="invalid-feedback d-block"
                         *ngIf="isInvalid('password')">Password is required.</div>
                  </div>

                  <button type="submit"
                          class="btn btn-primary w-100 btn-lg"
                          [disabled]="loading">
                    <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ loading ? 'Signing in...' : 'Sign In' }}
                  </button>

                </form>
              </div>
            </div>

            <p class="text-center mt-3 text-muted">
              Don't have an account?
              <a routerLink="/register" class="text-primary fw-semibold">Register here</a>
            </p>

          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    // Show success message if redirected from register
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state?.['registered']) {
      this.successMessage = 'Account created! Please sign in.';
    }
  }

  isInvalid(field: string): boolean {
    const ctrl = this.loginForm.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
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
        const isAdmin = this.authService.isAdmin();
        this.router.navigate([isAdmin ? '/admin' : '/flights']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err.error?.message ?? err.error?.error ?? 'Invalid username or password.';
      }
    });
  }
}