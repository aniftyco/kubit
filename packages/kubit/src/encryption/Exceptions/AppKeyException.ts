import { Exception } from '@poppinss/utils';

import exceptions from '../exceptions.json';

export class AppKeyException extends Exception {
  public static missingAppKey(): AppKeyException {
    const details = exceptions['E_MISSING_APP_KEY'];
    const error = new this(details.message, details.status, details.code);
    error.help = details.help.join('\n');
    return error;
  }

  public static insecureAppKey(): AppKeyException {
    const details = exceptions['E_INSECURE_APP_KEY'];
    const error = new this(details.message, details.status, details.code);
    error.help = details.help.join('\n');
    return error;
  }
}
