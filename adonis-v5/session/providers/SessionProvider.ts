/**
 * @kubit/session
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ApplicationContract } from '@ioc:Kubit/Application';

/**
 * Session provider for AdonisJS
 */
export default class SessionProvider {
  constructor(protected app: ApplicationContract) {}
  public static needsApplication = true

  /**
   * Register Session Manager
   */
  public register(): void {
    this.app.container.singleton('Kubit/Session', () => {
      const { SessionManager } = require('../src/SessionManager')
      return new SessionManager(this.app, this.app.config.get('session', {}))
    })
  }

  /**
   * Register bindings for tests
   */
  protected registerTestsBindings() {
    this.app.container.withBindings(
      [
        'Japa/Preset/ApiRequest',
        'Japa/Preset/ApiResponse',
        'Japa/Preset/ApiClient',
        'Kubit/Session',
      ],
      (ApiRequest, ApiResponse, ApiClient, Session) => {
        const { defineTestsBindings } = require('../src/Bindings/Tests')
        defineTestsBindings(ApiRequest, ApiResponse, ApiClient, Session)
      }
    )
  }

  /**
   * Register server bindings
   */
  protected registerServerBindings() {
    this.app.container.withBindings(
      ['Kubit/Server', 'Kubit/HttpContext', 'Kubit/Session'],
      (Server, HttpContext, Session) => {
        const { defineServerBindings } = require('../src/Bindings/Server')
        defineServerBindings(HttpContext, Server, Session)
      }
    )
  }

  public boot(): void {
    this.registerServerBindings()
    this.registerTestsBindings()
  }
}
