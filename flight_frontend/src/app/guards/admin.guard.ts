/**
 * adminGuard: Route guard that restricts access to admin-only pages
 * Prevents non-admin users and unauthenticated visitors from accessing admin routes
 * Redirects unauthorized users appropriately based on their authentication state
 * Implements Angular's CanActivateFn functional guard pattern
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** 
 * Functional route guard for admin-only routes
 * Called automatically by Angular Router before activating a route
 * Returns true to allow navigation, false to block and redirect
 * Uses dependency injection with inject() function for services
 */

export const adminGuard: CanActivateFn = (_route, _state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  /** 
   * First condition: User is successfully authenticated AND has admin privileges
   * Both checks must pass to allow access to the admin route
   * Returns true immediately, allowing navigation to proceed
   */

  if (authService.isLoggedIn() && authService.isAdmin()) {
    return true;
  }

   /** 
    * Second condition: User is NOT logged in at all
    * This occurs when an unauthenticated visitor tries to access admin pages
    * Redirects to the login page to prompt for authentication 
    * Unauthenticated users should not see admin content and must log in first
    */

   /** 
    * Third condition: User is logged in but does NOT have admin privileges
    * This occurs when a regular non-admin user tries to access admin pages
    * Redirects to home page with query parameter indicating access was denied
    * Home page can read error parameter to show an access-denied message
    */
  
  if (!authService.isLoggedIn()) {
    // Not logged in at all — send to login
    router.navigate(['/login']);
  } else {
    // Logged in but not an admin — send to home with an access-denied signal
    router.navigate(['/'], { queryParams: { error: 'access-denied' } });
  }

  return false;
};