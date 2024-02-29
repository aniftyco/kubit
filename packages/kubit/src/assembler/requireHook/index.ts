import { register } from '../../require-ts';

/**
 * Exports the function to be used for registering require hook
 * for AdonisJS applications
 */
export default function registerForAdonis(appRoot: string) {
  return register(appRoot, {
    cache: true,
    transformers: {
      after: [
        {
          transform: '../assembler/requireHook/ioc-transformer',
        },
      ],
    },
  });
}
