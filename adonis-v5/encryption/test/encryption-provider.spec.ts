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

import { Encryption } from '../src/Encryption'
import { MessageVerifier } from '../src/MessageVerifier'

const SECRET = 'averylongradom32charactersstring'
const fs = new Filesystem(join(__dirname, 'app'))

async function setup(setupAppKey: boolean = true) {
  await fs.add('.env', '')
  await fs.add('config/app.ts', setupAppKey ? `export const appKey = '${SECRET}'` : '')

  const app = new Application(fs.basePath, 'web', {
    providers: ['../../providers/EncryptionProvider'],
  })

  app.setup()
  app.registerProviders()
  await app.bootProviders()

  return app
}

test.group('Encryption Provider', (group) => {
  group.each.teardown(async () => {
    await fs.cleanup()
  })

  test('register encryption provider', async ({ assert }) => {
    const app = await setup()
    assert.instanceOf(app.container.use('Adonis/Core/Encryption'), Encryption)
    assert.deepEqual(
      app.container.use('Adonis/Core/Encryption'),
      app.container.use('Adonis/Core/Encryption')
    )
  })

  test('raise error when appKey is missing', async ({ assert }) => {
    const app = await setup(false)
    const fn = () => app.container.use('Adonis/Core/Encryption')
    assert.throws(fn, 'E_MISSING_APP_KEY: The value for "app.appKey" is undefined')
  })

  test('access verifier from encryption module', async ({ assert }) => {
    const app = await setup()
    assert.instanceOf(app.container.use('Adonis/Core/Encryption').verifier, MessageVerifier)
  })
})
