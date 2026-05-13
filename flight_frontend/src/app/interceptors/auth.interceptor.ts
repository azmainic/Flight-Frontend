/** 
 * AuthInterceptor: HTTP interceptor that attaches JWT token to outgoing requests
 * Automatically adds x-access-token header to all API calls except excluded endpoints
 * Handles 401 unauthorized responses by clearing user session
 * Prevents token injection on login/register endpoints that use different auth methods
 */

import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

/**
 * List of URL patterns that must NOT have the x-access-token header attached.
 * - /auth/login  uses HTTP Basic Auth
 * - /auth/register uses form-data with no auth
 * - Public flight listing / search / detail — token is optional but harmless;
 *   however we only skip for the explicit auth endpoints to keep things simple.
 */
const EXCLUDED_URLS: string[] = [
  `${environment.apiUrl}/auth/login`,
  `${environment.apiUrl}/auth/register`
];

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  /** 
   * Intercepts every HTTP request before it is sent to the server
   * Checks if the request URL matches any excluded URLs
   * Conditionally adds x-access-token header if token exists and URL is not excluded
   * Handles 401 errors globally to trigger session cleanup
   */

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const isExcluded = EXCLUDED_URLS.some(url => req.url.startsWith(url));

    /** 
     * Only adds token for non-excluded endpoints
     * Retrieves JWT token from AuthService (checks localStorage)
     * If token exists, clones the request with additional header
     * Original request is immutable, so clone is required
     */

    if (!isExcluded) {
      const token = this.authService.getToken();
      if (token) {
        req = req.clone({
          setHeaders: {
            'x-access-token': token
          }
        });
      }
    }

    /** 
     * Passes the (potentially modified) request to the next handler
     * Pipe catches HTTP errors from the response stream
     * Specifically checks for 401 Unauthorized status code
     * 401 indicates invalid, expired, or missing token
     */
    
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token is invalid or expired — clear session and redirect to login
          this.authService.handleUnauthorized();
        }
        return throwError(() => error);
      })
    );
  }
}