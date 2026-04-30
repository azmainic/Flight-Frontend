import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { AuthUser } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark shadow-sm"
         style="background: linear-gradient(135deg, #7e22ce 0%, #581c87 100%);">
      <div class="container">

        <!-- Brand -->
        <a class="navbar-brand fw-bold d-flex align-items-center gap-2" routerLink="/home">
          <i class="bi bi-airplane-fill" style="color:#e9d5ff"></i>
          <span>SkyBook</span>
        </a>

        <!-- Toggler -->
        <button class="navbar-toggler border-0" type="button"
                data-bs-toggle="collapse" data-bs-target="#mainNav">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="mainNav">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <a class="nav-link px-3" routerLink="/home"
                 routerLinkActive="active">Home</a>
            </li>
            <li class="nav-item">
              <a class="nav-link px-3" routerLink="/flights"
                 routerLinkActive="active">Flights</a>
            </li>
            <li class="nav-item" *ngIf="localUser || auth0User">
              <a class="nav-link px-3" routerLink="/my-bookings"
                 routerLinkActive="active">My Bookings</a>
            </li>
            <li class="nav-item" *ngIf="localUser?.admin">
              <a class="nav-link px-3" routerLink="/admin"
                 routerLinkActive="active">
                <i class="bi bi-shield-lock-fill me-1"></i>Admin
              </a>
            </li>
          </ul>

          <ul class="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center gap-1">

            <!-- Auth0 social user -->
            <ng-container *ngIf="auth0User && !localUser">
              <li class="nav-item me-2">
                <span class="navbar-text d-flex align-items-center gap-2"
                      style="color:rgba(233,213,255,0.9)">
                  <img *ngIf="auth0User.picture"
                       [src]="auth0User.picture"
                       class="rounded-circle border border-2"
                       style="border-color:#c084fc !important"
                       width="28" height="28" style="object-fit:cover">
                  <i *ngIf="!auth0User.picture" class="bi bi-person-circle"></i>
                  {{ auth0User.name || auth0User.email }}
                </span>
              </li>
              <li class="nav-item">
                <button class="btn btn-sm fw-semibold px-3"
                        style="background:#c084fc;color:#fff;border:none"
                        (click)="logoutAuth0()">
                  <i class="bi bi-box-arrow-right me-1"></i>Logout
                </button>
              </li>
            </ng-container>

            <!-- Local JWT user -->
            <ng-container *ngIf="localUser">
              <li class="nav-item me-2">
                <span class="navbar-text d-flex align-items-center gap-2"
                      style="color:rgba(233,213,255,0.9)">
                  <div class="rounded-circle d-flex align-items-center justify-content-center fw-bold small"
                       style="width:28px;height:28px;background:#c084fc;color:#fff">
                    {{ localUser.username.charAt(0).toUpperCase() }}
                  </div>
                  {{ localUser.username }}
                  <span *ngIf="localUser.admin"
                        class="badge ms-1"
                        style="background:#f59e0b;color:#1c1917">Admin</span>
                </span>
              </li>
              <li class="nav-item">
                <button class="btn btn-sm fw-semibold px-3"
                        style="background:#c084fc;color:#fff;border:none"
                        (click)="logoutLocal()">
                  <i class="bi bi-box-arrow-right me-1"></i>Logout
                </button>
              </li>
            </ng-container>

            <!-- Not logged in -->
            <ng-container *ngIf="!localUser && !auth0User">
              <li class="nav-item">
                <a class="nav-link px-3" routerLink="/login"
                   routerLinkActive="active">Login</a>
              </li>
              <li class="nav-item">
                <a class="btn btn-sm fw-semibold px-3"
                   style="background:#c084fc;color:#fff"
                   routerLink="/register">Register</a>
              </li>
            </ng-container>

          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .nav-link { transition: color .2s; }
    .nav-link:hover { color: #e9d5ff !important; }
    .nav-link.active { color: #fff !important; font-weight: 600; }
  `]
})
export class NavbarComponent implements OnInit {
  localUser: AuthUser | null = null;
  auth0User: any = null;

  constructor(
    private authService: AuthService,
    private auth0: Auth0Service
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => { this.localUser = user; });
    this.auth0.user$.subscribe(user => { this.auth0User = user ?? null; });
  }

  logoutLocal(): void { this.authService.logout(); }

  logoutAuth0(): void {
    this.auth0.logout({ logoutParams: { returnTo: window.location.origin } });
  }
}