import { ResponseConstructorContract } from '@ioc:Kubit/Response';
import { string } from '@poppinss/utils/build/helpers';

/**
 * Sharing CSP nonce with the response
 */
export default function responseBinding(Response: ResponseConstructorContract) {
  Response.getter(
    'nonce',
    () => {
      return string.generateRandom(16);
    },
    true
  );
}
