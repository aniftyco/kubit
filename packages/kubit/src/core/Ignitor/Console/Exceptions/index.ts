import { logger } from '@poppinss/cliui';
import { Exception } from '@poppinss/utils';

export class ConsoleRuntimeException extends Exception {
  public handle(error: ConsoleRuntimeException) {
    logger.error(error.message);
  }
}
