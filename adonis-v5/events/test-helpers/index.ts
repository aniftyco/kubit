/*
 * @adonisjs/events
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'path'
import { Filesystem } from '@poppinss/dev-utils'
import { Application } from '@adonisjs/application'

export const fs = new Filesystem(join(__dirname, 'app'))

export async function setUp() {
  await fs.add('.env', '')
  await fs.fsExtra.ensureDir(join(fs.basePath, 'config'))
  const app = new Application(fs.basePath, 'web', {
    providers: ['../../providers/EventProvider'],
  })

  app.setup()
  app.registerProviders()
  await app.bootProviders()
  return app
}
