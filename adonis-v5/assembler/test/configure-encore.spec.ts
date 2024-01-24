/*
 * @adonisjs/assembler
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

test.group('Configure Encore', (group) => {
  group.each.teardown(async () => {
    await fs.cleanup()
  })

  test('setup encore', async ({ assert }) => {
    await fs.add(
      'package.json',
      JSON.stringify({
        name: 'sample_app',
      })
    )

    await fs.ensureRoot()
    const app = new Application(fs.basePath, 'test', {})

    const invoke = new Invoke(app, new Kernel(app).mockConsoleOutput())
    invoke.packages = ['encore']
    await invoke.run()

    const envFile = await fs.fsExtra.pathExists(join(fs.basePath, 'webpack.config.js'))
    const envExampleFile = await fs.fsExtra.readFile(
      join(fs.basePath, 'resources/js/app.js'),
      'utf-8'
    )

    const pkgFile = await fs.get('package.json')
    assert.properties(JSON.parse(pkgFile).devDependencies, [
      '@babel/core',
      '@babel/preset-env',
      '@symfony/webpack-encore',
      'webpack',
      'webpack-cli',
    ])

    assert.isTrue(envFile)
    assert.equal(envExampleFile.trim(), '// app entrypoint')
  })
    .timeout(0)
    .skip(!!process.env.CI)
})
