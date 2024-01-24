/*
 * @adonisjs/events
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { join } from 'path'
import { Filesystem } from '@poppinss/dev-utils'
import { Application } from '@adonisjs/application'

import { Hash } from '../src/Hash'
const fs = new Filesystem(join(__dirname, 'app'))

async function setup(setupConfig: boolean = true) {
  await fs.add('.env', '')
  await fs.fsExtra.ensureDir(join(fs.basePath, 'config'))

  if (setupConfig) {
    await fs.add(
      'config/hash.ts',
      `
			const hashConfig = {
				default: 'bcrypt',
				list: {
					bcrypt: {}
				}
			}
			export default hashConfig
		`
    )
  }

  const app = new Application(fs.basePath, 'web', {
    providers: ['../../providers/HashProvider'],
  })

  app.setup()
  app.registerProviders()
  await app.bootProviders()

  return app
}

test.group('Hash Provider', (group) => {
  group.each.teardown(async () => {
    await fs.cleanup()
  })

  test('register hash provider', async ({ assert }) => {
    const app = await setup()
    assert.instanceOf(app.container.use('Adonis/Core/Hash'), Hash)
    assert.deepEqual(app.container.use('Adonis/Core/Hash'), app.container.use('Adonis/Core/Hash'))
  })

  test('raise error when hash config is missing', async ({ assert }) => {
    const app = await setup(false)
    const fn = () => app.container.use('Adonis/Core/Hash')
    assert.throws(
      fn,
      'Invalid "hash" config. Missing value for "default". Make sure to set it inside the "config/hash" file'
    )
  })
})
