/*
 * @adonisjs/encryption
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * The binding for the given module is defined inside `providers/AppProvider.ts`
 * file.
 */
declare module '@ioc:Adonis/Core/Encryption' {
  import { base64 } from '@poppinss/utils/build/helpers'

  /**
   * Config accepted by the encryption
   */
  export type EncryptionOptions = {
    algorithm?: 'aes-256-cbc'
    secret: string
  }

  /**
   * Message verifier is similar to the encryption. However, the actual payload
   * is not encrypted and just base64 encoded. This is helpful when you are
   * not concerned about the confidentiality of the data, but just want to
   * make sure that is not tampered after encoding.
   */
  export interface MessageVerifierContract {
    /**
     * Sign a given piece of value using the app secret. A wide range of
     * data types are supported.
     *
     * - String
     * - Arrays
     * - Objects
     * - Booleans
     * - Numbers
     * - Dates
     *
     * You can optionally define a purpose for which the value was signed and
     * mentioning a different purpose/no purpose during unsign will fail.
     */
    sign(payload: any, expiresIn?: string | number, purpose?: string): string

    /**
     * Unsign, previously signed value
     */
    unsign<T extends any>(payload: string, purpose?: string): T | null
  }

  /**
   * The encryption class allows encrypting and decrypting values using `aes-256-cbc` or `aes-128-cbc`
   * algorithms. The encrypted value uses a unique iv for every encryption and this ensures semantic
   * security (read more https://en.wikipedia.org/wiki/Semantic_security).
   */
  export interface EncryptionContract {
    /**
     * Reference to the message verifier
     */
    verifier: MessageVerifierContract

    /**
     * Reference to base64 object for base64 encoding/decoding values
     */
    base64: typeof base64

    /**
     * Current algorithm in use
     */
    algorithm: EncryptionOptions['algorithm']

    /**
     * Encrypt a given piece of value using the app secret. A wide range of
     * data types are supported.
     *
     * - String
     * - Arrays
     * - Objects
     * - Booleans
     * - Numbers
     * - Dates
     *
     * You can optionally define a purpose for which the value was encrypted and
     * mentioning a different purpose/no purpose during decrypt will fail.
     */
    encrypt(payload: any, expiresIn?: string | number, purpose?: string): string

    /**
     * Decrypt a previously encrypted value
     */
    decrypt<T extends any>(payload: string, purpose?: string): T | null

    /**
     * Create a children instance with different secret key
     */
    child(options?: EncryptionOptions): EncryptionContract
  }

  const Encryption: EncryptionContract
  export default Encryption
}
