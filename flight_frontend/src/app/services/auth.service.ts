import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthUser {
  username: string;
  admin: boolean;
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

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Decode the JWT payload without a library.
   * Returns null if the token is missing or malformed.
   */
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

    // Check expiry (JWT exp is in seconds)
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      localStorage.removeItem(this.TOKEN_KEY);
      return null;
    }

    return {
      username: payload.user ?? payload.sub ?? '',
      admin: payload.admin ?? false
    };
  }

  /**
   * Register — POST /auth/register with form-data
   */
  register(username: string, password: string): Observable<RegisterResponse> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    return this.http.post<RegisterResponse>(`${this.apiUrl}/auth/register`, formData);
  }

  /**
   * Login — GET /auth/login with HTTP Basic Auth
   */
  login(username: string, password: string): Observable<LoginResponse> {
    const credentials = btoa(`${username}:${password}`);
    const headers = new HttpHeaders({
      Authorization: `Basic ${credentials}`
    });

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

  /**
   * Logout — GET /auth/logout (token attached by interceptor)
   */
  logout(): void {
    const token = this.getToken();
    if (token) {
      // Fire-and-forget: notify backend, then clean up locally regardless
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
    return this.loadUserFromToken() !== null;
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.admin === true;
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  /** Called by the interceptor when a 401 is received */
  handleUnauthorized(): void {
    this.clearSession();
  }
}