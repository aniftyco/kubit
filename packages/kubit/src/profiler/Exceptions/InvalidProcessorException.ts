import { Exception } from '@poppinss/utils';

import exceptions from '../exceptions.json';

export class InvalidProcessorException extends Exception {
  /**
   * Raised when the profiler worker doesn't exports the process
   * function
   */
  public static missingWorkerMethod() {
    const exception = exceptions['E_INVALID_PROFILER_WORKER'];

    const error = new this(exception.message, exception.status, exception.code);
    error.help = exception.help.join('\n');

    return error;
  }
}
