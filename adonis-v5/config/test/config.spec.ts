/*
 * @adonisjs/config
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { join } from 'path'
import { Config } from '../src/Config'

test.group('Config', () => {
  test('merge config with given defaults', async ({ assert }) => {
    const config = new Config({
      app: {
        logger: {
          driver: 'file',
        },
      },
    })

    assert.deepEqual(config.merge('app.logger', { filePath: 'foo' }), {
      driver: 'file',
      filePath: 'foo',
    })
  })

  test('define merge config customizer', async ({ assert }) => {
    const config = new Config({
      app: {
        logger: {
          driver: 'file',
        },
      },
    })

    assert.deepEqual(
      config.merge('app.logger', { filePath: 'foo' }, (_, __, key) => {
        if (key === 'driver') {
          return 'memory'
        }
      }),
      {
        driver: 'memory',
        filePath: 'foo',
      }
    )
  })

  test('update in-memory config value', async ({ assert }) => {
    const config = new Config({
      app: {
        logger: {
          driver: 'file',
        },
      },
    })
    config.set('app.logger', { driver: 'memory' })
    assert.deepEqual(config.get('app.logger'), { driver: 'memory' })
  })

  test('merge defaults with existing user defaults', async ({ assert }) => {
    const config = new Config({
      app: {
        logger: {
          driver: 'file',
        },
      },
    })
    config.defaults('app.logger', { filePath: join(__dirname), driver: 'console' })

    assert.deepEqual(config.get('app.logger'), {
      filePath: join(__dirname),
      driver: 'file',
    })
  })

  test('merge defaults with existing user defaults when they are missing', async ({ assert }) => {
    const config = new Config({
      app: {},
    })

    config.defaults('app.logger', { filePath: join(__dirname) })

    assert.deepEqual(config.get('app.logger'), {
      filePath: join(__dirname),
    })
  })

  test('get complete config', async ({ assert }) => {
    const config = new Config({
      app: {
        logger: {
          driver: 'file',
        },
      },
    })

    assert.deepEqual(config.all(), {
      app: {
        logger: {
          driver: 'file',
        },
      },
    })
  })

  test('get value for a key', async ({ assert }) => {
    const config = new Config({
      app: {
        logger: {
          driver: 'file',
        },
      },
    })

    assert.deepEqual(config.get('app.logger.driver'), 'file')
  })

  test('return undefined when key parent is missing', async ({ assert }) => {
    const config = new Config({
      app: {
        logger: {
          driver: 'file',
        },
      },
    })

    assert.isUndefined(config.get('app.profiler.enabled'))
  })

  test('return default value when value is missing', async ({ assert }) => {
    const config = new Config({
      app: {
        logger: {
          driver: 'file',
        },
      },
    })

    assert.deepEqual(config.get('app.profiler.enabled', true), true)
  })
})
