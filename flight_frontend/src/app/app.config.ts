/**
 * appConfig defines the application-wide configuration for the Angular app.
 * It sets up providers for routing, HTTP client with interceptors, and Auth0 authentication.
 * This configuration is used to initialize the app with necessary services and settings for proper functionality.
 */

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAuth0 } from '@auth0/auth0-angular';

import { routes } from './app.routes';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { environment } from '../environments/environment';

/**
 * appConfig is the main configuration object for the Angular application.
 * It includes providers for zone change detection, routing, HTTP client with interceptors, and Auth0 authentication.
 * This configuration ensures that the app has the necessary services and settings to function correctly, including handling authentication and API requests.
 */

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    provideAuth0({
      domain: environment.auth0.domain,
      clientId: environment.auth0.clientId,
      authorizationParams: {
        redirect_uri: environment.auth0.redirectUri
      }
    })
  ]
};