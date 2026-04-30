import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (_route, _state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn() && authService.isAdmin()) {
    return true;
  }

  if (!authService.isLoggedIn()) {
    // Not logged in at all — send to login
    router.navigate(['/login']);
  } else {
    // Logged in but not an admin — send to home with an access-denied signal
    router.navigate(['/'], { queryParams: { error: 'access-denied' } });
  }

  return false;
};