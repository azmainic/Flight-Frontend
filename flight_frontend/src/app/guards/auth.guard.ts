import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { map, take, of, switchMap } from 'rxjs';

export const authGuard: CanActivateFn = (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const auth0 = inject(Auth0Service);
  const router = inject(Router);

  return auth0.isAuthenticated$.pipe(
    take(1),
    switchMap(isAuth0LoggedIn => {
      const isJwtLoggedIn = authService.isLoggedIn();

      if (isJwtLoggedIn || isAuth0LoggedIn) {
        return of(true);
      }

      // Save the attempted URL so we can redirect after login
      router.navigate(['/login'], {
        queryParams: { returnUrl: state.url }
      });
      return of(false);
    })
  );
};