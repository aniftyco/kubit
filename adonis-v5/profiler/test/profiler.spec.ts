/*
 * @adonisjs/profiler
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { join } from 'path'
import { Filesystem } from '@poppinss/dev-utils'
import { FakeLogger } from '@adonisjs/logger'
import { Profiler } from '../src/Profiler'

const logger = new FakeLogger({ enabled: true, level: 'trace', name: 'adonis' })
const fs = new Filesystem(join(__dirname, './app'))

test.group('Profiler | isEnabled', () => {
  test('return false from isEnabled when enabled inside config is set to false', ({ assert }) => {
    const profiler = new Profiler(__dirname, logger, { enabled: false })
    profiler.process(() => {})
    assert.isFalse(profiler.isEnabled('http request'))
  })

  test('return true from isEnabled when whitelist is an empty array', ({ assert }) => {
    const profiler = new Profiler(__dirname, logger, { enabled: true })
    profiler.process(() => {})
    assert.isTrue(profiler.isEnabled('http request'))
  })

  test('return false when whitelist is an empty array but blacklist has the label', ({
    assert,
  }) => {
    const profiler = new Profiler(__dirname, logger, {
      enabled: true,
      whitelist: [],
      blacklist: ['http request'],
    })
    profiler.process(() => {})
    assert.isFalse(profiler.isEnabled('http request'))
  })

  test("return false when whitelist doesn't have the label", ({ assert }) => {
    const profiler = new Profiler(__dirname, logger, {
      enabled: true,
      whitelist: ['foo'],
      blacklist: [],
    })
    profiler.process(() => {})
    assert.isFalse(profiler.isEnabled('http request'))
  })

  test('return true when whitelist has the label', ({ assert }) => {
    const profiler = new Profiler(__dirname, logger, {
      enabled: true,
      whitelist: ['http request'],
      blacklist: [],
    })
    profiler.process(() => {})
    assert.isTrue(profiler.isEnabled('http request'))
  })

  test("return true if it's in whitelist and black list both", ({ assert }) => {
    const profiler = new Profiler(__dirname, logger, {
      enabled: true,
      whitelist: ['http request'],
      blacklist: ['http request'],
    })
    profiler.process(() => {})
    assert.isTrue(profiler.isEnabled('http request'))
  })
})

test.group('Profile | profile', (group) => {
  group.each.teardown(async () => {
    await fs.cleanup()
  })

  test('create a profiler row', ({ assert }) => {
    let packet: any = null

    function subscriber(node: any) {
      packet = node
    }

    const profiler = new Profiler(__dirname, logger, {})
    profiler.process(subscriber)

    const req = profiler.create('http_request', { id: '123' })
    req.end()

    assert.equal(packet.type, 'row')
    assert.equal(packet.label, 'http_request')
    assert.deepEqual(packet.data, { id: '123' })
    assert.isUndefined(packet.parent_id)
  })

  test('create a profiler row and action', ({ assert }) => {
    let packets: any[] = []

    function subscriber(node: any) {
      packets.push(node)
    }

    const profiler = new Profiler(__dirname, logger, {})
    profiler.process(subscriber)

    const req = profiler.create('http_request', { id: '123' })
    const child = req.profile('find_route')
    child.end()
    req.end()

    assert.equal(packets[0].type, 'action')
    assert.equal(packets[0].label, 'find_route')
    assert.deepEqual(packets[0].data, {})
    assert.equal(packets[0].parent_id, packets[1].id)

    assert.equal(packets[1].type, 'row')
    assert.equal(packets[1].label, 'http_request')
    assert.deepEqual(packets[1].data, { id: '123' })
    assert.isUndefined(packets[1].parent_id)
  })

  test('create a profiler row with nested row', ({ assert }) => {
    let packets: any[] = []

    function subscriber(node: any) {
      packets.push(node)
    }

    const profiler = new Profiler(__dirname, logger, {})
    profiler.process(subscriber)

    const req = profiler.create('http_request', { id: '123' })
    const core = req.create('core')
    const child = core.profile('find_route')

    child.end()
    core.end()
    req.end()

    assert.equal(packets[0].type, 'action')
    assert.equal(packets[0].label, 'find_route')
    assert.deepEqual(packets[0].data, {})
    assert.equal(packets[0].parent_id, packets[1].id)

    assert.equal(packets[1].type, 'row')
    assert.equal(packets[1].label, 'core')
    assert.deepEqual(packets[1].data, {})
    assert.equal(packets[1].parent_id, packets[2].id)

    assert.equal(packets[2].type, 'row')
    assert.equal(packets[2].label, 'http_request')
    assert.deepEqual(packets[2].data, { id: '123' })
    assert.isUndefined(packets[2].parent_id)
  })

  test('end action after the row (case overflow)', ({ assert }) => {
    let packets: any[] = []

    function subscriber(node: any) {
      packets.push(node)
    }

    const profiler = new Profiler(__dirname, logger, {})
    profiler.process(subscriber)

    const req = profiler.create('http_request', { id: '123' })
    const child = req.profile('find_route')
    req.end()
    child.end()

    assert.equal(packets[1].type, 'action')
    assert.equal(packets[1].label, 'find_route')
    assert.deepEqual(packets[1].data, {})
    assert.equal(packets[1].parent_id, packets[0].id)

    assert.equal(packets[0].type, 'row')
    assert.equal(packets[0].label, 'http_request')
    assert.deepEqual(packets[0].data, { id: '123' })
    assert.isUndefined(packets[0].parent_id)
  })

  test('raise error when end is called twice on row', ({ assert }) => {
    let packets: any[] = []

    function subscriber(node: any) {
      packets.push(node)
    }

    const profiler = new Profiler(__dirname, logger, { enabled: true })
    profiler.process(subscriber)

    const req = profiler.create('http_request', { id: '123' })
    req.end()

    const fn = () => req.end()
    assert.throws(fn, 'attempt to end profiler row twice')
  })

  test('do not emit when subscriber is not defined', () => {
    const profiler = new Profiler(__dirname, logger, { enabled: true })
    const req = profiler.create('http_request', { id: '123' })
    req.end()
  })

  test('merge end data with actual data', ({ assert }) => {
    let packets: any[] = []

    function subscriber(node: any) {
      packets.push(node)
    }

    const profiler = new Profiler(__dirname, logger, { enabled: true })
    profiler.process(subscriber)

    const req = profiler.create('http_request', { id: '123' })
    req.end({ time: 11 })
    assert.deepEqual(packets[0].data, { id: '123', time: 11 })
  })

  test('return true when row has a parent', ({ assert }) => {
    const profiler = new Profiler(__dirname, logger, { enabled: true })
    profiler.process(() => {})

    const req = profiler.create('http_request', { id: '123' })
    assert.isFalse(req.hasParent)

    const view = req.create('render_view')
    assert.isTrue(view.hasParent)
  })

  test('profile callback', ({ assert }) => {
    let packets: any[] = []

    function subscriber(node: any) {
      packets.push(node)
    }

    const profiler = new Profiler(__dirname, logger, {})
    profiler.process(subscriber)

    const req = profiler.create('http_request', { id: '123' })
    req.profile('find_route', {}, () => {})
    req.end()

    assert.equal(packets[0].type, 'action')
    assert.equal(packets[0].label, 'find_route')
    assert.deepEqual(packets[0].data, {})
    assert.equal(packets[0].parent_id, packets[1].id)

    assert.equal(packets[1].type, 'row')
    assert.equal(packets[1].label, 'http_request')
    assert.deepEqual(packets[1].data, { id: '123' })
    assert.isUndefined(packets[1].parent_id)
  })

  test('report callback errors', ({ assert }) => {
    let packets: any[] = []

    function subscriber(node: any) {
      packets.push(node)
    }

    const profiler = new Profiler(__dirname, logger, {})
    profiler.process(subscriber)

    const req = profiler.create('http_request', { id: '123' })

    try {
      req.profile('find_route', {}, () => {
        throw new Error('what?')
      })
    } catch (error) {
      req.end()
    }

    assert.equal(packets[0].type, 'action')
    assert.equal(packets[0].label, 'find_route')
    assert.equal(packets[0].data.error.message, 'what?')
    assert.equal(packets[0].parent_id, packets[1].id)

    assert.equal(packets[1].type, 'row')
    assert.equal(packets[1].label, 'http_request')
    assert.deepEqual(packets[1].data, { id: '123' })
    assert.isUndefined(packets[1].parent_id)
  })

  test('profile async callback', async ({ assert }) => {
    let packets: any[] = []

    function subscriber(node: any) {
      packets.push(node)
    }

    const profiler = new Profiler(__dirname, logger, {})
    profiler.process(subscriber)

    const req = profiler.create('http_request', { id: '123' })
    await req.profileAsync('find_route', {}, async () => {})
    req.end()

    assert.equal(packets[0].type, 'action')
    assert.equal(packets[0].label, 'find_route')
    assert.deepEqual(packets[0].data, {})
    assert.equal(packets[0].parent_id, packets[1].id)

    assert.equal(packets[1].type, 'row')
    assert.equal(packets[1].label, 'http_request')
    assert.deepEqual(packets[1].data, { id: '123' })
    assert.isUndefined(packets[1].parent_id)
  })

  test('report async callback errors', async ({ assert }) => {
    let packets: any[] = []

    function subscriber(node: any) {
      packets.push(node)
    }

    const profiler = new Profiler(__dirname, logger, {})
    profiler.process(subscriber)

    const req = profiler.create('http_request', { id: '123' })

    try {
      await req.profileAsync('find_route', {}, async () => {
        throw new Error('what?')
      })
    } catch (error) {
      req.end()
    }

    assert.equal(packets[0].type, 'action')
    assert.equal(packets[0].label, 'find_route')
    assert.equal(packets[0].data.error.message, 'what?')
    assert.equal(packets[0].parent_id, packets[1].id)

    assert.equal(packets[1].type, 'row')
    assert.equal(packets[1].label, 'http_request')
    assert.deepEqual(packets[1].data, { id: '123' })
    assert.isUndefined(packets[1].parent_id)
  })

  test('profile without a row', ({ assert }) => {
    let packets: any[] = []

    function subscriber(node: any) {
      packets.push(node)
    }

    const profiler = new Profiler(__dirname, logger, {})
    profiler.process(subscriber)

    const child = profiler.profile('find_route')
    child.end()

    assert.lengthOf(packets, 1)
    assert.equal(packets[0].type, 'action')
    assert.equal(packets[0].label, 'find_route')
    assert.deepEqual(packets[0].data, {})
    assert.isUndefined(packets[0].parent_id)
  })

  test('profile callback without a row', ({ assert }) => {
    let packets: any[] = []

    function subscriber(node: any) {
      packets.push(node)
    }

    const profiler = new Profiler(__dirname, logger, {})
    profiler.process(subscriber)

    profiler.profile('find_route', {}, () => {})

    assert.lengthOf(packets, 1)
    assert.equal(packets[0].type, 'action')
    assert.equal(packets[0].label, 'find_route')
    assert.deepEqual(packets[0].data, {})
    assert.isUndefined(packets[0].parent_id)
  })

  test('profile async callback without a row', async ({ assert }) => {
    let packets: any[] = []

    function subscriber(node: any) {
      packets.push(node)
    }

    const profiler = new Profiler(__dirname, logger, {})
    profiler.process(subscriber)

    try {
      await profiler.profileAsync('find_route', {}, async () => {
        throw new Error('foo')
      })
    } catch (error) {}

    assert.lengthOf(packets, 1)
    assert.equal(packets[0].type, 'action')
    assert.equal(packets[0].label, 'find_route')
    assert.equal(packets[0].data.error.message, 'foo')
    assert.isUndefined(packets[0].parent_id)
  })

  test('raise exception when worker file is missing', ({ assert }) => {
    const profiler = new Profiler(__dirname, logger, {})
    const fn = () => profiler.process('./foo.ts')
    assert.throws(fn, "Cannot find module './foo.ts'")
  })

  test('raise exception when worker file does not export process function', async ({ assert }) => {
    await fs.add('./foo.ts', '')

    const profiler = new Profiler(fs.basePath, logger, {})
    const fn = () => profiler.process('./foo.ts')
    assert.throws(
      fn,
      `E_INVALID_PROFILER_WORKER: Profiler worker file must export a "process" function`
    )
  })

  test('work fine when worker node has process function', async () => {
    await fs.add(
      './foo.ts',
      `
				export function process () {}
			`
    )

    const profiler = new Profiler(fs.basePath, logger, {})
    profiler.process('./foo.ts')
  })
})

test.group('Profile | dummy profile', () => {
  test('return dummy profiler instance when enabled is false', ({ assert }) => {
    let packet: any = null

    function subscriber(node: any) {
      packet = node
    }

    const profiler = new Profiler(__dirname, logger, { enabled: false })
    profiler.process(subscriber)

    const req = profiler.create('http_request', { id: '123' })
    req.end()

    assert.isNull(packet)
  })

  test('return dummy action when action is blacklisted', ({ assert }) => {
    let packets: any[] = []

    function subscriber(node: any) {
      packets.push(node)
    }

    const profiler = new Profiler(__dirname, logger, { blacklist: ['find_route'] })
    profiler.process(subscriber)

    const req = profiler.create('http_request', { id: '123' })
    const child = req.profile('find_route')
    child.end()
    req.end()

    assert.lengthOf(packets, 1)
    assert.equal(packets[0].type, 'row')
    assert.equal(packets[0].label, 'http_request')
    assert.deepEqual(packets[0].data, { id: '123' })
    assert.isUndefined(packets[0].parent_id)
  })

  test("return dummy row when it's black listed", ({ assert }) => {
    let packets: any[] = []

    function subscriber(node: any) {
      packets.push(node)
    }

    const profiler = new Profiler(__dirname, logger, { blacklist: ['core'] })
    profiler.process(subscriber)

    const req = profiler.create('http_request', { id: '123' })
    const core = req.create('core')
    const child = core.profile('find_route')

    child.end()
    core.end()
    req.end()

    assert.lengthOf(packets, 1)
    assert.equal(packets[0].type, 'row')
    assert.equal(packets[0].label, 'http_request')
    assert.deepEqual(packets[0].data, { id: '123' })
    assert.isUndefined(packets[0].parent_id)
  })

  test('return dummy action within dummy action', ({ assert }) => {
    let packets: any[] = []

    function subscriber(node: any) {
      packets.push(node)
    }

    const profiler = new Profiler(__dirname, logger, { enabled: false })
    profiler.process(subscriber)

    const req = profiler.create('http_request', { id: '123' })
    const core = req.create('core')
    const child = core.profile('find_route')

    child.end()
    core.end()
    req.end()

    assert.lengthOf(packets, 0)
  })

  test('return false from dummy row even when row has a parent', ({ assert }) => {
    const profiler = new Profiler(__dirname, logger, { enabled: false })

    const req = profiler.create('http_request', { id: '123' })
    assert.isFalse(req.hasParent)

    const view = req.create('render_view')
    assert.isFalse(view.hasParent)
  })

  test('profile callback and return its output', ({ assert }) => {
    let packets: any[] = []

    function subscriber(node: any) {
      packets.push(node)
    }

    const profiler = new Profiler(__dirname, logger, { enabled: false })
    profiler.process(subscriber)

    const req = profiler.create('http_request', { id: '123' })
    const route = req.profile('find_route', {}, () => {
      return '/foo'
    })
    req.end()

    assert.equal(route, '/foo')
    assert.lengthOf(packets, 0)
  })

  test('profile async callback and return its output', async ({ assert }) => {
    let packets: any[] = []

    function subscriber(node: any) {
      packets.push(node)
    }

    const profiler = new Profiler(__dirname, logger, { enabled: false })
    profiler.process(subscriber)

    const req = profiler.create('http_request', { id: '123' })
    const route = await req.profileAsync('find_route', {}, async () => {
      return '/foo'
    })
    req.end()

    assert.equal(route, '/foo')
    assert.lengthOf(packets, 0)
  })
})
