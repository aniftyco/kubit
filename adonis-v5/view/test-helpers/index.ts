/*
 * @adonisjs/view
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'path'
import { Filesystem } from '@poppinss/dev-utils'
import { Application } from '@adonisjs/core/build/standalone'

export const fs = new Filesystem(join(__dirname, 'app'))
export const APP_KEY = Math.random().toFixed(36).substring(2, 38)

export async function setup(environment: 'web' | 'repl', setupDriveConfig: boolean = false) {
  await fs.add('.env', '')
  await fs.add(
    'config/app.ts',
    `
    export const appKey = '${APP_KEY}',
    export const http = {
      cookie: {},
      trustProxy: () => true,
    }
  `
  )

  if (setupDriveConfig) {
    await fs.add(
      'config/drive.ts',
      `
    export const disk = 'local',
    export const disks = {
      local: {
        driver: 'local',
        basePath: '/uploads',
        serveFiles: true,
        root: '${join(fs.basePath, 'uploads').replace(/\\/g, '/')}',
      }
    }
  `
    )
  }

  const app = new Application(fs.basePath, environment, {
    providers: ['@adonisjs/core', '@adonisjs/repl', '../../providers/ViewProvider'],
  })

  await app.setup()
  await app.registerProviders()
  await app.bootProviders()

  return app
}
