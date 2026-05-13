/**   
 * PassengerFormComponent: Reusable form for adding or editing passenger details
 * Supports both create and update modes with conditional fields
 * Uses reactive forms with validation for all passenger data fields
 * Emits form data to parent component when submitted
 */

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PassengerFormData } from '../../models/passenger.model';

@Component({
  selector: 'app-passenger-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="row g-3">

        <div class="col-md-6">
          <label class="form-label fw-semibold">Full Name</label>
          <input type="text" class="form-control"
                 formControlName="full_name"
                 [class.is-invalid]="isInvalid('full_name')"
                 placeholder="John Doe">
          <div class="invalid-feedback">Full name is required.</div>
        </div>

        <div class="col-md-6">
          <label class="form-label fw-semibold">Passport Number</label>
          <input type="text" class="form-control"
                 formControlName="passport_number"
                 [class.is-invalid]="isInvalid('passport_number')"
                 placeholder="P1234567"
                 [readonly]="editMode">
          <div class="invalid-feedback">Passport number is required.</div>
        </div>

        <div class="col-md-6">
          <label class="form-label fw-semibold">Nationality</label>
          <input type="text" class="form-control"
                 formControlName="nationality"
                 [class.is-invalid]="isInvalid('nationality')"
                 placeholder="UK">
          <div class="invalid-feedback">Nationality is required.</div>
        </div>

        <div class="col-md-3">
          <label class="form-label fw-semibold">Seat Class</label>
          <select class="form-select" formControlName="seat_class"
                  [class.is-invalid]="isInvalid('seat_class')">
            <option value="">Select class</option>
            <option value="economy">Economy</option>
            <option value="business">Business</option>
            <option value="first">First</option>
          </select>
          <div class="invalid-feedback">Seat class is required.</div>
        </div>

        <div class="col-md-3">
          <label class="form-label fw-semibold">Seat Number</label>
          <input type="text" class="form-control"
                 formControlName="seat_number"
                 [class.is-invalid]="isInvalid('seat_number')"
                 placeholder="12A">
          <div class="invalid-feedback">Seat number is required.</div>
        </div>

        <div class="col-md-6" *ngIf="editMode">
          <label class="form-label fw-semibold">Booking Status</label>
          <select class="form-select" formControlName="booking_status">
            <option value="booked">Booked</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked_in">Checked In</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

      </div>

      <!-- Error alert -->
      <div class="alert alert-danger mt-3" *ngIf="errorMessage">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
      </div>

      <div class="d-flex gap-2 mt-4">
        <button type="submit" class="btn btn-primary" [disabled]="loading">
          <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
          {{ editMode ? 'Update Passenger' : 'Add Passenger' }}
        </button>
        <button type="button" class="btn btn-outline-secondary" (click)="onCancel.emit()">
          Cancel
        </button>
      </div>
    </form>
  `
})

  /** 
   * Determines whether form is in edit mode or create mode
   * When true, passport_number field becomes read-only
   * When true, booking_status dropdown becomes visible
   * Changes submit button text from "Add" to "Update"
   */

export class PassengerFormComponent implements OnInit {
  @Input() editMode = false;
  @Input() initialData: Partial<PassengerFormData> | null = null;
  @Input() loading = false;
  @Input() errorMessage = '';

  @Output() formSubmit = new EventEmitter<PassengerFormData>();
  @Output() onCancel = new EventEmitter<void>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      full_name:       [this.initialData?.full_name ?? '',       Validators.required],
      passport_number: [this.initialData?.passport_number ?? '', Validators.required],
      nationality:     [this.initialData?.nationality ?? '',     Validators.required],
      seat_class:      [this.initialData?.seat_class ?? '',      Validators.required],
      seat_number:     [this.initialData?.seat_number ?? '',     Validators.required],
      booking_status:  [this.initialData?.booking_status ?? 'booked']
    });
  }

  /** 
   * Checks if a form field is both invalid and has been touched
   * Returns true for displaying Bootstrap's is-invalid class
   * Used in template to show red borders and error messages
   * Prevents showing errors before user has interacted with field
   */

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }


   /** 
   * Handles form submission when user clicks submit button
   * Marks all fields as touched to trigger validation display
   * If form is invalid, submission is blocked
   * If form is valid, emits form values via formSubmit event
   */

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.formSubmit.emit(this.form.value as PassengerFormData);
  }
}