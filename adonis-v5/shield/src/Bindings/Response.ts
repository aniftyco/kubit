/*
 * @kubit/shield
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ResponseConstructorContract } from '@ioc:Adonis/Core/Response'
import { string } from '@poppinss/utils/build/helpers'

/**
 * Sharing CSP nonce with the response
 */
export default function responseBinding(Response: ResponseConstructorContract) {
  Response.getter(
    'nonce',
    () => {
      return string.generateRandom(16)
    },
    true
  )
}
