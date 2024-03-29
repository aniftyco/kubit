import { HttpContextContract } from '@ioc:Kubit/HttpContext';
import { ContentTypeSniffingOptions } from '@ioc:Kubit/Security';

import { noop } from './noop';

/**
 * Factory function that returns a function to Add `X-Content-Type-Options`
 * header based upon given user options.
 */
export function noSniffFactory(options: ContentTypeSniffingOptions) {
  if (!options.enabled) {
    return noop;
  }

  return function noSniff({ response }: HttpContextContract) {
    response.header('X-Content-Type-Options', 'nosniff');
  };
}
