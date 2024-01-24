/*
 * @adonisjs/encryption
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { createHmac } from 'crypto'
import { base64, safeEqual } from '@poppinss/utils/build/helpers'

/**
 * A generic class for generating SHA-256 Hmac for verifying the value
 * integrity.
 */
export class Hmac {
  constructor(private key: Buffer) {}

  /**
   * Generate the hmac
   */
  public generate(value: string) {
    return base64.urlEncode(createHmac('sha256', this.key).update(value).digest())
  }

  /**
   * Compare raw value against an existing hmac
   */
  public compare(value: string, existingHmac: string) {
    return safeEqual(this.generate(value), existingHmac)
  }
}
