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

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const isExcluded = EXCLUDED_URLS.some(url => req.url.startsWith(url));

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