/**
 * authGuard: Route guard that protects pages requiring user authentication
 * Allows access only to users who are logged in via JWT or Auth0
 * Saves the attempted URL for post-login redirection
 * Returns Observable<boolean> for async authentication checks with Auth0
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { map, take, of, switchMap } from 'rxjs';

/** 
 * Functional route guard that checks both JWT and Auth0 authentication
 * Called by Angular Router before activating protected routes
 * Returns Observable<boolean> to handle Auth0's async auth check
 * Receives route snapshot and state (contains target URL for redirect)
 */

export const authGuard: CanActivateFn = (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const auth0 = inject(Auth0Service);
  const router = inject(Router);

  return auth0.isAuthenticated$.pipe(
    take(1),
    switchMap(isAuth0LoggedIn => {
      const isJwtLoggedIn = authService.isLoggedIn();

       /**
        * First condition: User is authenticated via either method
        * JWT token OR Auth0 social login is sufficient for access
        * Returns observable of true to allow route activation
        */

      if (isJwtLoggedIn || isAuth0LoggedIn) {
        return of(true);
      }

      // Save the attempted URL so we can redirect after login
      /** 
       * Second condition: User is not authenticated at all
       * Saves the attempted URL (state.url) as returnUrl query parameter
       * After successful login, user will be redirected back to this URL
       * Navigates to login page and returns observable of false to block access
       */

      router.navigate(['/login'], {
        queryParams: { returnUrl: state.url }
      });
      return of(false);
    })
  );
};