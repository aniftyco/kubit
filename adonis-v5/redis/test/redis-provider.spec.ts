/*
 * @kubit/events
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'path';

import { test } from '@japa/runner';
import { Application } from '@kubit/application';
import { Filesystem } from '@poppinss/dev-utils';

import { RedisManager } from '../src/RedisManager';

const fs = new Filesystem(join(__dirname, 'app'))

async function setup(environment: 'web' | 'repl', redisConfig: any) {
  await fs.add('.env', '')
  await fs.add(
    'config/app.ts',
    `
		export const appKey = 'averylong32charsrandomsecretkey',
		export const http = {
			cookie: {},
			trustProxy: () => true,
		}
	`
  )

  await fs.add(
    'config/redis.ts',
    `
		const redisConfig = ${JSON.stringify(redisConfig, null, 2)}
		export default redisConfig
	`
  )

  const app = new Application(fs.basePath, environment, {
    providers: ['@kubit/core', '@kubit/repl', '../../providers/RedisProvider'],
  })

  await app.setup()
  await app.registerProviders()
  await app.bootProviders()

  return app
}

test.group('Redis Provider', (group) => {
  group.each.teardown(async () => {
    await fs.cleanup()
  })

  test('register redis provider', async ({ assert }) => {
    const app = await setup('web', {
      connection: 'local',
      connections: {
        local: {},
      },
    })

    assert.instanceOf(app.container.use('Kubit/Redis'), RedisManager)
    assert.deepEqual(app.container.use('Kubit/Redis')['application'], app)
    assert.deepEqual(app.container.use('Kubit/Redis'), app.container.use('Kubit/Redis'))
  })

  test('raise error when config is missing', async ({ assert }) => {
    assert.plan(1)

    try {
      await setup('web', {})
    } catch (error) {
      assert.equal(
        error.message,
        'Invalid "redis" config. Missing value for "connection". Make sure to set it inside the "config/redis" file'
      )
    }
  })

  test('raise error when primary connection is not defined', async ({ assert }) => {
    assert.plan(1)

    try {
      await setup('web', {})
    } catch (error) {
      assert.equal(
        error.message,
        'Invalid "redis" config. Missing value for "connection". Make sure to set it inside the "config/redis" file'
      )
    }
  })

  test('raise error when connections are not defined', async ({ assert }) => {
    assert.plan(1)

    try {
      await setup('web', {
        connection: 'local',
      })
    } catch (error) {
      assert.equal(
        error.message,
        'Invalid "redis" config. Missing value for "connections". Make sure to set it inside the "config/redis" file'
      )
    }
  })

  test('raise error when primary connection is not defined in the connections list', async ({
    assert,
  }) => {
    assert.plan(1)

    try {
      await setup('web', {
        connection: 'local',
        connections: {},
      })
    } catch (error) {
      assert.equal(
        error.message,
        'Invalid "redis" config. "local" is not defined inside "connections". Make sure to set it inside the "config/redis" file'
      )
    }
  })

  test('define repl bindings', async ({ assert }) => {
    const app = await setup('repl', {
      connection: 'local',
      connections: {
        local: {},
      },
    })

    assert.property(app.container.use('Kubit/Repl')['customMethods'], 'loadRedis')
    assert.isFunction(app.container.use('Kubit/Repl')['customMethods']['loadRedis'].handler)
  })

  test('define health checks', async ({ assert }) => {
    const app = await setup('web', {
      connection: 'local',
      connections: {
        local: {
          healthCheck: true,
        },
      },
    })

    assert.property(app.container.use('Kubit/HealthCheck')['healthCheckers'], 'redis')
    assert.equal(app.container.use('Kubit/HealthCheck')['healthCheckers'].redis, 'Kubit/Redis')
  })
})
