import { logger } from '@poppinss/cliui';
import { Exception } from '@poppinss/utils';

export class AceRuntimeException extends Exception {
  public handle(error: AceRuntimeException) {
    logger.error(error.message);
  }
}
