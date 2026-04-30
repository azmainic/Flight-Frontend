import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { environment } from '../../environments/environment';

export interface AuthUser {
  username: string;
  admin: boolean;
  picture?: string;
  isAuth0?: boolean;
}

export interface LoginResponse {
  token: string;
  user?: string;
  admin?: boolean;
}

export interface RegisterResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'token';
  private readonly apiUrl = environment.apiUrl;

  private currentUserSubject = new BehaviorSubject<AuthUser | null>(this.loadUserFromToken());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private auth0: Auth0Service
  ) {
    // Sync Auth0 social login into currentUser$
    this.auth0.user$.subscribe(auth0User => {
      if (auth0User && !this.getToken()) {
        this.currentUserSubject.next({
          username: auth0User.name ?? auth0User.email ?? 'User',
          admin: false,
          picture: auth0User.picture ?? undefined,
          isAuth0: true
        });

        // After Auth0 redirect, check if there's a saved returnUrl
        const returnUrl = localStorage.getItem('auth0_return_url');
        if (returnUrl) {
          localStorage.removeItem('auth0_return_url');
          this.router.navigateByUrl(returnUrl);
        }
      } else if (!auth0User && !this.getToken()) {
        this.currentUserSubject.next(null);
      }
    });
  }

  private decodeToken(token: string): any | null {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  private loadUserFromToken(): AuthUser | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return null;
    const payload = this.decodeToken(token);
    if (!payload) return null;
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      localStorage.removeItem(this.TOKEN_KEY);
      return null;
    }
    return {
      username: payload.user ?? payload.sub ?? '',
      admin: payload.admin ?? false,
      isAuth0: false
    };
  }

  register(username: string, password: string): Observable<RegisterResponse> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    return this.http.post<RegisterResponse>(`${this.apiUrl}/auth/register`, formData);
  }

  login(username: string, password: string): Observable<LoginResponse> {
    const credentials = btoa(`${username}:${password}`);
    const headers = new HttpHeaders({ Authorization: `Basic ${credentials}` });
    return this.http.get<LoginResponse>(`${this.apiUrl}/auth/login`, { headers }).pipe(
      tap((response: LoginResponse) => {
        if (response.token) {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          const user = this.loadUserFromToken();
          this.currentUserSubject.next(user);
        }
      })
    );
  }

  logout(): void {
    const token = this.getToken();
    if (token) {
      this.http.get(`${this.apiUrl}/auth/logout`).subscribe({
        complete: () => this.clearSession(),
        error: () => this.clearSession()
      });
    } else {
      this.clearSession();
    }
  }

  private clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.admin === true;
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  handleUnauthorized(): void {
    this.clearSession();
  }
}