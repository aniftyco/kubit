/*
 * @adonisjs/hash
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../adonis-typings/hash.ts" />

import { FakeContract } from '@ioc:Adonis/Core/Hash'

/**
 * Generates and verifies hash using no algorigthm.
 */
export class Fake implements FakeContract {
  public ids: FakeContract['ids'] = ['fake']

  /**
   * Returns hash for a given value
   */
  public make(value: string) {
    return Promise.resolve(value)
  }

  /**
   * Verify hash to know if two values are same.
   */
  public verify(hashedValue: string, plainValue: string): Promise<boolean> {
    return Promise.resolve(hashedValue === plainValue)
  }

  /**
   * Returns a boolean telling if hash needs a rehash. Returns true when
   * one of the original params have been changed.
   */
  public needsReHash(_value: string): boolean {
    return false
  }
}
