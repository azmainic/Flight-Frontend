/**
 * AuthService manages user authentication, including registration, login, logout, and session management.
 * It supports both traditional username/password authentication and social login via Auth0.
 * The service uses JWT tokens for session management and provides observables for components to react to authentication state changes.
 * It also handles token expiration and unauthorized access by clearing sessions and redirecting users appropriately.
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { environment } from '../../environments/environment';

/**
 * AuthUser interface defines the structure of the user object used in the authentication system.
 * It includes properties for username, admin status, optional profile picture, and a flag to indicate if the user is authenticated via Auth0.
 * This model is used for type safety when managing user data across the application, ensuring consistent handling of authentication state.
 */

export interface AuthUser {
  username: string;
  admin: boolean;
  picture?: string;
  isAuth0?: boolean;
}

/**
 * LoginResponse interface defines the expected structure of the response from the login API endpoint.
 * It includes a required token property for the JWT token and optional properties for the username and admin status.
 * This model is used for type safety when handling login responses, ensuring consistent processing of authentication data.
 */

export interface LoginResponse {
  token: string;
  user?: string;
  admin?: boolean;
}

/**
 * RegisterResponse interface defines the expected structure of the response from the registration API endpoint.
 * It includes a message property that can be used to convey success or error information about the registration process.
 * This model is used for type safety when handling registration responses, ensuring consistent processing of registration data.
 */

export interface RegisterResponse {
  message: string;
}

/**
 * AuthService class provides methods for user authentication and session management.
 * It includes methods for registering new users, logging in, logging out, and checking authentication status.
 * The service uses JWT tokens for managing sessions and integrates with Auth0 for social login functionality.
 * It also provides an observable for the current user, allowing components to react to changes in authentication state.
 */

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
    
    /** 
     * Sync Auth0 social login into currentUser$
     * Subscribes to Auth0's user stream to handle social login
     * When Auth0 user exists and no JWT token is present, creates local user object
     * After redirect, checks for saved return URL and navigates there
     * Clears user when Auth0 user logs out
     */

    this.auth0.user$.subscribe(auth0User => {
      if (auth0User && !this.getToken()) {
        this.currentUserSubject.next({
          username: auth0User.name ?? auth0User.email ?? 'User',
          admin: false,
          picture: auth0User.picture ?? undefined,
          isAuth0: true
        });

        /** 
         * After Auth0 redirect, check if there's a saved returnUrl 
         */
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

  /** 
   * Decodes a JWT token's payload section without verifying signature
   * Handles base64url decoding by replacing URL-safe characters
   * Returns parsed payload object or null on failure
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


  /** 
   * Retrieves user from stored JWT token
   * Checks token existence, validity, and expiration
   * Removes expired token and returns null if invalid
   * Extracts username from 'user' or 'sub' claim and admin flag
   */

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

  /** 
   * Sends registration request with username and password as FormData
   * Returns observable that emits RegisterResponse
   */

  register(username: string, password: string): Observable<RegisterResponse> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    return this.http.post<RegisterResponse>(`${this.apiUrl}/auth/register`, formData);
  }

  /** 
   * Performs login using HTTP Basic Authentication
   * Encodes credentials as base64, attaches to Authorization header
   * On successful response, stores token in localStorage and updates currentUserSubject
   */

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


  /** 
   * Initiates Auth0 social login flow
   * Logs user out by calling backend logout endpoint if token exists
   * Regardless of success or error, clears local session data
   * Redirects to login page after session cleanup
   */

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


  /** 
   * Removes JWT token from localStorage, clears user subject
   * Navigates user to login page
   * Return the JWT token or null if not found
   * Called internally during logout or unauthorized handling
   */

  private clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  /** 
   * Retrieves the JWT token from localStorage
   * Returns the token string or null if not found
   * Used for attaching token to API requests and checking authentication state
   */
  
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /** 
   * Checks if any user is currently authenticated
   * Returns true if currentUserSubject has a non-null value
   */

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

   /**
    * Checks if the currently authenticated user has admin privileges
    * Returns true if admin flag is exactly true
    */

  isAdmin(): boolean {
    return this.currentUserSubject.value?.admin === true;
  }

  /** 
   * Returns the current user object or null if not logged in
   * Synchronous getter for immediate access
   */

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }


  /**  * Handles unauthorized access by clearing session and redirecting to login
   * Called when API returns 401 Unauthorized, indicating token is invalid or expired
   * Ensures user is logged out and prompted to log in again for a new session
   */

  handleUnauthorized(): void {
    this.clearSession();
  }
}