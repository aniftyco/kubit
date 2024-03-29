import { FileValidationOptions, MultipartFileContract } from '@ioc:Kubit/BodyParser';
import { SyncValidation } from '@ioc:Kubit/Validator';

import { wrapCompile } from '../../Validator/helpers';

const DEFAULT_MESSAGE = 'file validation failed';
const RULE_NAME = 'file';

/**
 * Ensure the value is a valid file instance
 */
export const file: SyncValidation<Partial<FileValidationOptions>> = {
  compile: wrapCompile(RULE_NAME, [], ([options]) => {
    const validationOptions: Partial<FileValidationOptions> = {};
    if (options && options.size) {
      validationOptions.size = options.size;
    }

    if (options && options.extnames) {
      validationOptions.extnames = options.extnames;
    }

    return {
      compiledOptions: validationOptions,
    };
  }),
  validate(fileToValidate: MultipartFileContract, compiledOptions, { errorReporter, pointer, arrayExpressionPointer }) {
    /**
     * Raise error when not a multipart file instance
     */
    if (!fileToValidate.isMultipartFile) {
      errorReporter.report(pointer, RULE_NAME, DEFAULT_MESSAGE, arrayExpressionPointer, compiledOptions);
      return;
    }

    /**
     * Set size when it's defined in the options
     */
    if (fileToValidate.sizeLimit === undefined && compiledOptions.size) {
      fileToValidate.sizeLimit = compiledOptions.size;
    }

    /**
     * Set extensions when it's defined in the options
     */
    if (fileToValidate.allowedExtensions === undefined && compiledOptions.extnames) {
      fileToValidate.allowedExtensions = compiledOptions.extnames;
    }

    /**
     * Validate the file
     */
    fileToValidate.validate();

    /**
     * Report errors
     */
    fileToValidate.errors.forEach((error) => {
      errorReporter.report(
        pointer,
        `${RULE_NAME}.${error.type}`,
        error.message,
        arrayExpressionPointer,
        compiledOptions
      );
    });
  },
};
