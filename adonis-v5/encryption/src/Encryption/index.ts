/*
 * @adonisjs/encryption
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../adonis-typings/encryption.ts" />

import { Exception } from '@poppinss/utils'
import { createHash, createCipheriv, createDecipheriv } from 'crypto'
import { EncryptionContract, EncryptionOptions } from '@ioc:Adonis/Core/Encryption'
import { base64 as utilsBase64, MessageBuilder, string } from '@poppinss/utils/build/helpers'

import { Hmac } from '../Hmac'
import { MessageVerifier } from '../MessageVerifier'
import { AppKeyException } from '../Exceptions/AppKeyException'

/**
 * The encryption class allows encrypting and decrypting values using `aes-256-cbc` or `aes-128-cbc`
 * algorithms. The encrypted value uses a unique iv for every encryption and this ensures semantic
 * security (read more https://en.wikipedia.org/wiki/Semantic_security).
 */
export class Encryption implements EncryptionContract {
  /**
   * The key for signing and encrypting values. It is derived
   * from the user provided secret.
   */
  private cryptoKey: Buffer

  /**
   * Use `dot` as a separator for joining encrypted value, iv and the
   * hmac hash. The idea is borrowed from JWT's in which each part
   * of the payload is concatenated with a dot.
   */
  private separator = '.'

  /**
   * Reference to the instance of message verifier for signing
   * and verifying values.
   */
  public verifier: MessageVerifier

  /**
   * Reference to base64 object for base64 encoding/decoding values
   */
  public base64: typeof utilsBase64 = utilsBase64

  /**
   * The algorithm in use
   */
  public algorithm = this.options.algorithm || 'aes-256-cbc'

  constructor(private options: EncryptionOptions) {
    this.validateSecret()
    this.cryptoKey = createHash('sha256').update(this.options.secret).digest()
    this.verifier = new MessageVerifier(this.options.secret)
  }

  /**
   * Validates the app secret
   */
  private validateSecret() {
    if (typeof this.options.secret !== 'string') {
      throw AppKeyException.missingAppKey()
    }

    if (this.options.secret.length < 16) {
      throw AppKeyException.insecureAppKey()
    }
  }

  /**
   * Encrypt value with optional expiration and purpose
   */
  public encrypt(value: any, expiresAt?: string | number, purpose?: string) {
    /**
     * Using a random string as the iv for generating unpredictable values
     */
    const iv = string.generateRandom(16)

    /**
     * Creating chiper
     */
    const cipher = createCipheriv(this.algorithm, this.cryptoKey, iv)

    /**
     * Encoding value to a string so that we can set it on the cipher
     */
    const encodedValue = new MessageBuilder().build(value, expiresAt, purpose)

    /**
     * Set final to the cipher instance and encrypt it
     */
    const encrypted = Buffer.concat([cipher.update(encodedValue, 'utf-8'), cipher.final()])

    /**
     * Concatenate `encrypted value` and `iv` by urlEncoding them. The concatenation is required
     * to generate the HMAC, so that HMAC checks for integrity of both the `encrypted value`
     * and the `iv`.
     */
    const result = `${this.base64.urlEncode(encrypted)}${this.separator}${this.base64.urlEncode(
      iv
    )}`

    /**
     * Returns the result + hmac
     */
    return `${result}${this.separator}${new Hmac(this.cryptoKey).generate(result)}`
  }

  /**
   * Decrypt value and verify it against a purpose
   */
  public decrypt<T extends any>(value: string, purpose?: string): T | null {
    if (typeof value !== 'string') {
      throw new Exception('"Encryption.decrypt" expects a string value', 500, 'E_RUNTIME_EXCEPTION')
    }

    /**
     * Make sure the encrypted value is in correct format. ie
     * [encrypted value]--[iv]--[hash]
     */
    const [encryptedEncoded, ivEncoded, hash] = value.split(this.separator)
    if (!encryptedEncoded || !ivEncoded || !hash) {
      return null
    }

    /**
     * Make sure we are able to urlDecode the encrypted value
     */
    const encrypted = this.base64.urlDecode(encryptedEncoded, 'base64')
    if (!encrypted) {
      return null
    }

    /**
     * Make sure we are able to urlDecode the iv
     */
    const iv = this.base64.urlDecode(ivEncoded)
    if (!iv) {
      return null
    }

    /**
     * Make sure the hash is correct, it means the first 2 parts of the
     * string are not tampered.
     */
    const isValidHmac = new Hmac(this.cryptoKey).compare(
      `${encryptedEncoded}${this.separator}${ivEncoded}`,
      hash
    )

    if (!isValidHmac) {
      return null
    }

    /**
     * The Decipher can raise exceptions with malformed input, so we wrap it
     * to avoid leaking sensitive information
     */
    try {
      const decipher = createDecipheriv(this.algorithm, this.cryptoKey, iv)
      const decrypted = decipher.update(encrypted, 'base64', 'utf8') + decipher.final('utf8')
      return new MessageBuilder().verify(decrypted, purpose)
    } catch (error) {
      return null
    }
  }

  /**
   * Returns a new instance of encryption with custom secret key
   */
  public child(options: EncryptionOptions) {
    return new Encryption(options)
  }
}
