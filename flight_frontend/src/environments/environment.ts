/*
 *AuthO application configuration
 *Domain and CLient ID are obtained from the AuthO dashboard after creating an application
*/

export const environment = {
  production: false,
  apiUrl: 'http://127.0.0.1:5001',
  auth0: {
    domain: 'dev-0uvb7sw0cktkpw8b.uk.auth0.com',
    clientId: 'Wbbf0ahxnMG9pafxJ2LEoIQfWkZQqBeN',
    redirectUri: 'http://localhost:4200'
  }
};