/*
 * @adonisjs/events
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class EventProvider {
  constructor(protected app: ApplicationContract) {}

  /**
   * Register `Event emitter` to the container.
   */
  public register() {
    this.app.container.singleton('Adonis/Core/Event', () => {
      const { Emitter } = require('../src/Emitter')
      return new Emitter(this.app)
    })
  }
}
