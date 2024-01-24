/**
 * @kubit/session
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {
  ExtendCallback,
  SessionClientContract,
  SessionConfig,
  SessionDriverContract,
  SessionManagerContract,
} from '@ioc:Adonis/Addons/Session'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Exception, ManagerConfigValidator } from '@poppinss/utils'
import { string } from '@poppinss/utils/build/helpers'

import { Session } from '../Session'

type SessionManagerConfig = SessionConfig & {
  cookie: {
    expires: undefined
    maxAge: number | undefined
  }
}

/**
 * Session manager exposes the API to create session instance for a given
 * request and also add new drivers.
 */
export class SessionManager implements SessionManagerContract {
  /**
   * A private map of drivers added from outside in.
   */
  private extendedDrivers: Map<string, ExtendCallback> = new Map()

  /**
   * Reference to session config
   */
  private config: SessionManagerConfig

  constructor(public application: ApplicationContract, config: SessionConfig) {
    this.validateConfig(config)
    this.processConfig(config)
  }

  /**
   * Validates the config
   */
  private validateConfig(config: SessionConfig) {
    const validator = new ManagerConfigValidator(config, 'session', 'config/session')
    validator.validateDefault('driver')
  }

  /**
   * Processes the config and decides the `expires` option for the cookie
   */
  private processConfig(config: SessionConfig): void {
    /**
     * Explicitly overwriting `cookie.expires` and `cookie.maxAge` from
     * the user defined config
     */
    const processedConfig: SessionManagerConfig = Object.assign({ enabled: true }, config, {
      cookie: {
        ...config.cookie,
        expires: undefined,
        maxAge: undefined,
      },
    })

    /**
     * Set the max age when `clearWithBrowser = false`. Otherwise cookie
     * is a session cookie
     */
    if (!processedConfig.clearWithBrowser) {
      const age =
        typeof processedConfig.age === 'string'
          ? Math.round(string.toMs(processedConfig.age) / 1000)
          : processedConfig.age

      processedConfig.cookie.maxAge = age
    }

    this.config = processedConfig
  }

  /**
   * Returns an instance of cookie driver
   */
  private createCookieDriver(ctx: HttpContextContract): any {
    const { CookieDriver } = require('../Drivers/Cookie')
    return new CookieDriver(this.config, ctx)
  }

  /**
   * Returns an instance of the memory driver
   */
  private createMemoryDriver(): any {
    const { MemoryDriver } = require('../Drivers/Memory')
    return new MemoryDriver()
  }

  /**
   * Returns an instance of file driver
   */
  private createFileDriver(): any {
    const { FileDriver } = require('../Drivers/File')
    return new FileDriver(this.config)
  }

  /**
   * Returns an instance of redis driver
   */
  private createRedisDriver(): any {
    const { RedisDriver } = require('../Drivers/Redis')

    if (!this.application.container.hasBinding('Adonis/Addons/Redis')) {
      throw new Error(
        'Install "@kubit/redis" in order to use the redis driver for storing sessions'
      )
    }

    return new RedisDriver(this.config, this.application.container.use('Adonis/Addons/Redis'))
  }

  /**
   * Creates an instance of extended driver
   */
  private createExtendedDriver(ctx: HttpContextContract): any {
    if (!this.extendedDrivers.has(this.config.driver)) {
      throw new Exception(
        `"${this.config.driver}" is not a valid session driver`,
        500,
        'E_INVALID_SESSION_DRIVER'
      )
    }

    return this.extendedDrivers.get(this.config.driver)!(this, this.config, ctx)
  }

  /**
   * Creates an instance of driver by looking at the config value `driver`.
   * An hard exception is raised in case of invalid driver name
   */
  private createDriver(ctx: HttpContextContract): SessionDriverContract {
    switch (this.config.driver) {
      case 'cookie':
        return this.createCookieDriver(ctx)
      case 'file':
        return this.createFileDriver()
      case 'redis':
        return this.createRedisDriver()
      case 'memory':
        return this.createMemoryDriver()
      default:
        return this.createExtendedDriver(ctx)
    }
  }

  /**
   * Find if the sessions are enabled
   */
  public isEnabled() {
    return this.config.enabled
  }

  /**
   * Creates an instance of the session client
   */
  public client(): SessionClientContract {
    const { SessionClient } = require('../Client')
    const CookieClient = this.application.container.resolveBinding('Adonis/Core/CookieClient')

    return new SessionClient(this.config, this.createMemoryDriver(), CookieClient, {})
  }

  /**
   * Creates a new session instance for a given HTTP request
   */
  public create(ctx: HttpContextContract): Session {
    return new Session(ctx, this.config, this.createDriver(ctx))
  }

  /**
   * Extend the drivers list by adding a new one.
   */
  public extend(driver: string, callback: ExtendCallback): void {
    this.extendedDrivers.set(driver, callback)
  }
}
