import { register } from '../../require-ts';

/**
 * Exports the function to be used for registering require hook
 * for Kubit applications
 */
export default (appRoot: string) =>
  register(appRoot, {
    cache: true,
    transformers: {
      after: [
        {
          transform: 'kubit/dist/assembler/requireHook/ioc-transformer',
        },
      ],
    },
  });
