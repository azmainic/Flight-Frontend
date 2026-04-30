import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const pw  = group.get('password')?.value;
  const pw2 = group.get('confirmPassword')?.value;
  return pw === pw2 ? null : { mismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-vh-100 bg-light d-flex align-items-center">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-sm-10 col-md-6 col-lg-4">

            <div class="text-center mb-4">
              <i class="bi bi-airplane-fill text-primary" style="font-size:3rem;"></i>
              <h2 class="fw-bold mt-2">Create Account</h2>
              <p class="text-muted">Join SkyBook today</p>
            </div>

            <div class="card border-0 shadow">
              <div class="card-body p-4">

                <div class="alert alert-danger" *ngIf="errorMessage">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
                </div>

                <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">

                  <div class="mb-3">
                    <label class="form-label fw-semibold">Username</label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="bi bi-person"></i></span>
                      <input type="text"
                             class="form-control"
                             formControlName="username"
                             [class.is-invalid]="isInvalid('username')"
                             placeholder="Choose a username">
                    </div>
                    <div class="invalid-feedback d-block" *ngIf="isInvalid('username')">
                      Username must be at least 3 characters.
                    </div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label fw-semibold">Password</label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="bi bi-lock"></i></span>
                      <input [type]="showPassword ? 'text' : 'password'"
                             class="form-control"
                             formControlName="password"
                             [class.is-invalid]="isInvalid('password')"
                             placeholder="Min. 6 characters">
                      <button class="btn btn-outline-secondary" type="button"
                              (click)="showPassword = !showPassword">
                        <i [class]="'bi ' + (showPassword ? 'bi-eye-slash' : 'bi-eye')"></i>
                      </button>
                    </div>
                    <div class="invalid-feedback d-block" *ngIf="isInvalid('password')">
                      Password must be at least 6 characters.
                    </div>
                  </div>

                  <div class="mb-4">
                    <label class="form-label fw-semibold">Confirm Password</label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="bi bi-lock-fill"></i></span>
                      <input [type]="showPassword ? 'text' : 'password'"
                             class="form-control"
                             formControlName="confirmPassword"
                             [class.is-invalid]="isInvalid('confirmPassword') || (registerForm.errors?.['mismatch'] && registerForm.get('confirmPassword')?.touched)"
                             placeholder="Repeat password">
                    </div>
                    <div class="invalid-feedback d-block"
                         *ngIf="registerForm.errors?.['mismatch'] && registerForm.get('confirmPassword')?.touched">
                      Passwords do not match.
                    </div>
                  </div>

                  <button type="submit"
                          class="btn btn-primary w-100 btn-lg"
                          [disabled]="loading">
                    <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ loading ? 'Creating account...' : 'Create Account' }}
                  </button>

                </form>
              </div>
            </div>

            <p class="text-center mt-3 text-muted">
              Already have an account?
              <a routerLink="/login" class="text-primary fw-semibold">Sign in</a>
            </p>

          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username:        ['', [Validators.required, Validators.minLength(3)]],
      password:        ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordsMatch });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.registerForm.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    const { username, password } = this.registerForm.value;

    this.authService.register(username, password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/login'], { state: { registered: true } });
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err.error?.message ?? err.error?.error ?? 'Registration failed. Please try again.';
      }
    });
  }
}