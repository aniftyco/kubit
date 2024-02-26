/*
 * @kubit/shield
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HttpContextContract } from '@ioc:Kubit/HttpContext'
import { inject } from '@kubit/core/build/standalone'

import * as shield from '../../standalone'

import type { ApplicationContract } from '@ioc:Kubit/Application'

/**
 * Shield middleware to protect web applications against common
 * web attacks
 */
@inject(['Kubit/Application'])
export class ShieldMiddleware {
  private config = this.application.container.resolveBinding('Kubit/Config').get('shield', {})
  private encryption = this.application.container.resolveBinding('Kubit/Encryption')

  /**
   * Resolve view provider, when exists
   */
  private view = this.application.container.hasBinding('Kubit/View')
    ? this.application.container.resolveBinding('Kubit/View')
    : undefined

  /**
   * Actions to be performed
   */
  private actions = [
    shield.csrfFactory(this.config.csrf || {}, this.encryption, this.view),
    shield.cspFactory(this.config.csp || {}),
    shield.dnsPrefetchFactory(this.config.dnsPrefetch || {}),
    shield.frameGuardFactory(this.config.xFrame || {}),
    shield.hstsFactory(this.config.hsts || {}),
    shield.noSniffFactory(this.config.contentTypeSniffing || {}),
  ]

  constructor(private application: ApplicationContract) {}

  /**
   * Handle request
   */
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    for (let action of this.actions) {
      await action(ctx)
    }

    await next()
  }
}
