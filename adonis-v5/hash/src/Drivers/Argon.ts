/*
 * @adonisjs/hash
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../adonis-typings/hash.ts" />

import phc from '@phc/format'
import argon2 from 'phc-argon2'
import { ArgonConfig, ArgonContract } from '@ioc:Adonis/Core/Hash'

/**
 * Hash driver built on top of argon hashing algorithm. The driver adheres
 * to `phc` string format.
 */
export class Argon implements ArgonContract {
  /**
   * A list of ids to find if hash belongs to this driver
   * or not.
   */
  public ids: ArgonContract['ids'] = ['argon2d', 'argon2i', 'argon2id']

  /**
   * A list of params encoded to the hash value.
   */
  public params: ArgonContract['params'] = {
    iterations: 't',
    memory: 'm',
    parallelism: 'p',
  }

  /**
   * The current argon version in use
   */
  public version = 19

  constructor(private config: ArgonConfig) {}

  /**
   * Hash a value using argon algorithm. The options can be used to override
   * default settings.
   */
  public make(value: string) {
    return argon2.hash(value, this.config)
  }

  /**
   * Verifies the hash against a plain value to find if it's
   * a valid hash or not.
   */
  public verify(hashedValue: string, plainValue: string): Promise<boolean> {
    return argon2.verify(hashedValue, plainValue)
  }

  /**
   * Returns a boolean telling if the hash needs a rehash or not. The rehash is
   * required when
   *
   * 1. The argon2 version is changed
   * 2. Number of iterations are changed.
   * 3. The memory value is changed.
   * 4. The parellelism value is changed.
   * 5. The argon variant is changed.
   */
  public needsReHash(value: string): boolean {
    const deserialized = phc.deserialize(value)
    if (!this.ids.includes(deserialized.id)) {
      throw new Error('value is not an argon2 hash')
    }

    /**
     * Version mis-match
     */
    if (deserialized.version !== this.version) {
      return true
    }

    /**
     * Variant mis-match
     */
    if (deserialized.id !== `argon2${this.config.variant}`) {
      return true
    }

    /**
     * Check for params mis-match
     */
    return !!Object.keys(this.params).find((key) => {
      return deserialized.params[this.params[key]] !== this.config![key]
    })
  }
}
