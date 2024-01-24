/*
 * @kubit/i18n
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'path'

import { I18nConfig } from '@ioc:Adonis/Addons/I18n'
import { Application } from '@kubit/core/build/standalone'
import { Filesystem } from '@poppinss/dev-utils'

export const fs = new Filesystem(join(__dirname, 'app'))

export async function setup(
  config?: Partial<I18nConfig>,
  additionalProviders: string[] = [],
  environment: 'web' | 'repl' | 'test' = 'test'
) {
  await fs.add('.env', '')
  await fs.add(
    'config/app.ts',
    `
    export const appKey = '${Math.random().toFixed(36).substring(2, 38)}',
    export const http = {
      cookie: {},
      trustProxy: () => true,
    }
  `
  )

  await fs.add(
    'config/i18n.ts',
    `
    const i18nConfig = ${JSON.stringify(config)}
    export default i18nConfig
  `
  )

  const app = new Application(fs.basePath, environment, {
    providers: ['@kubit/core', '@kubit/view'].concat(additionalProviders),
  })

  await app.setup()
  await app.registerProviders()
  await app.bootProviders()

  return app
}
