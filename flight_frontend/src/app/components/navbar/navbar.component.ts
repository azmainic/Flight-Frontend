import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, AuthUser } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div class="container">

        <!-- Brand -->
        <a class="navbar-brand fw-bold" routerLink="/home">
          <i class="bi bi-airplane-fill me-2"></i>SkyBook
        </a>

        <!-- Toggler -->
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Links -->
        <div class="collapse navbar-collapse" id="mainNav">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <a class="nav-link" routerLink="/home" routerLinkActive="active">Home</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/flights" routerLinkActive="active">Flights</a>
            </li>
            <li class="nav-item" *ngIf="currentUser">
              <a class="nav-link" routerLink="/my-bookings" routerLinkActive="active">My Bookings</a>
            </li>
            <li class="nav-item" *ngIf="currentUser?.admin">
              <a class="nav-link" routerLink="/admin" routerLinkActive="active">
                <i class="bi bi-shield-lock-fill me-1"></i>Admin
              </a>
            </li>
          </ul>

          <!-- Auth buttons -->
          <ul class="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center">
            <ng-container *ngIf="!currentUser; else loggedIn">
              <li class="nav-item me-2">
                <a class="nav-link" routerLink="/login" routerLinkActive="active">Login</a>
              </li>
              <li class="nav-item">
                <a class="btn btn-light btn-sm" routerLink="/register">Register</a>
              </li>
            </ng-container>

            <ng-template #loggedIn>
              <li class="nav-item me-2">
                <span class="navbar-text text-white-50">
                  <i class="bi bi-person-circle me-1"></i>{{ currentUser?.username }}
                  <span *ngIf="currentUser?.admin" class="badge bg-warning text-dark ms-1">Admin</span>
                </span>
              </li>
              <li class="nav-item">
                <button class="btn btn-outline-light btn-sm" (click)="logout()">
                  <i class="bi bi-box-arrow-right me-1"></i>Logout
                </button>
              </li>
            </ng-template>
          </ul>
        </div>

      </div>
    </nav>
  `
})
export class NavbarComponent implements OnInit {
  currentUser: AuthUser | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout(): void {
    this.authService.logout();
  }
}