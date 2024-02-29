import '@japa/api-client';

declare module '@japa/api-client' {
  export interface ApiRequest {
    /**
     * Send CSRF token to the server when making the
     * API request.
     */
    withCsrfToken(): this;
  }
}
