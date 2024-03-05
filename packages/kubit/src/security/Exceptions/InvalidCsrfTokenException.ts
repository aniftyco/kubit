import { Exception } from '@poppinss/utils';

/**
 * Invalid CSRF token
 */
export class InvalidCsrfTokenException extends Exception {
  public static invoke() {
    return new this('Invalid CSRF Token', 403, 'E_BAD_CSRF_TOKEN');
  }
}
