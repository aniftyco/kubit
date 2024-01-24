/*
 * @kubit/assembler
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'path'

import { test } from '@japa/runner'
import { Kernel } from '@kubit/ace'
import { Application } from '@kubit/application'
import { Filesystem } from '@poppinss/dev-utils'

import Invoke from '../commands/Invoke'

const fs = new Filesystem(join(__dirname, '__app'))

test.group('Invoke', (group) => {
  group.each.teardown(async () => {
    await fs.cleanup()
  })

  test('execute instructions defined in package.json file', async ({ assert }) => {
    await fs.add(
      'node_modules/@kubit/sample/package.json',
      JSON.stringify({
        name: '@kubit/sample',
        adonisjs: {
          env: {
            PORT: '3333',
          },
        },
      })
    )

    const app = new Application(fs.basePath, 'test', {})

    const invoke = new Invoke(app, new Kernel(app).mockConsoleOutput())
    invoke.packages = ['@kubit/sample']
    await invoke.run()

    const envFile = await fs.fsExtra.readFile(join(fs.basePath, '.env'), 'utf-8')
    const envExampleFile = await fs.fsExtra.readFile(join(fs.basePath, '.env.example'), 'utf-8')

    assert.equal(envFile.trim(), 'PORT=3333')
    assert.equal(envExampleFile.trim(), 'PORT=3333')
  })
})
