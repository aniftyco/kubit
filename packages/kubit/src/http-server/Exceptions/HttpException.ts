import { Exception } from '@poppinss/utils';
import { interpolate } from '@poppinss/utils/build/helpers';

import { E_HTTP_EXCEPTION } from '../exceptions.json';

/**
 * Custom exception to abort requests as one liners
 */
export class HttpException extends Exception {
  public body: any;

  /**
   * This method returns an instance of the exception class
   */
  public static invoke(body: any, status: number, code?: string) {
    const message = E_HTTP_EXCEPTION.message;
    code = code || E_HTTP_EXCEPTION.code;

    if (body !== null && typeof body === 'object') {
      const error = new this(body.message || interpolate(message, { status }), status, code);
      error.body = body;
      return error;
    }

    const error = new this(body || interpolate(message, { status }), status, code);
    error.body = error.message;
    return error;
  }
}
