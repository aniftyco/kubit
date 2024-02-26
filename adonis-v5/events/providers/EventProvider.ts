/*
 * @kubit/events
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ApplicationContract } from '@ioc:Kubit/Application'

export default class EventProvider {
  constructor(protected app: ApplicationContract) {}

  /**
   * Register `Event emitter` to the container.
   */
  public register() {
    this.app.container.singleton('Kubit/Event', () => {
      const { Emitter } = require('../src/Emitter')
      return new Emitter(this.app)
    })
  }
}
