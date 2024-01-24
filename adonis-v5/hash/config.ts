/*
 * @adonisjs/hash
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HashDrivers } from '@ioc:Adonis/Core/Hash'

/**
 * Expected shape of the config accepted by the "hashConfig"
 * method
 */
type HashConfig = {
  list: {
    [name: string]: {
      [K in keyof HashDrivers]: HashDrivers[K]['config'] & { driver: K }
    }[keyof HashDrivers]
  }
}

/**
 * Define config for the Hash module
 */
export function hashConfig<T extends HashConfig & { default: keyof T['list'] }>(config: T): T {
  return config
}

/**
 * Pull hashers list from the config defined inside the "config/hash.ts"
 * file
 */
export type InferListFromConfig<T extends HashConfig> = {
  [K in keyof T['list']]: HashDrivers[T['list'][K]['driver']]
}
