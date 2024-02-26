/*
 * @kubit/validator
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ParsedTypedSchema, RequestValidatorNode, TypedSchema } from '@ioc:Kubit/Validator'

declare module '@ioc:Kubit/Request' {
  interface RequestContract {
    /**
     * Validate current request. The data is optional here, since request
     * can pre-fill it for us
     */
    validate<T extends ParsedTypedSchema<TypedSchema>>(
      validator: RequestValidatorNode<T>
    ): Promise<T['props']>
  }
}
