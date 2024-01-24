/*
 * @adonisjs/profiler
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { ProfilerAction } from '../src/Action'

test.group('Profiler action', () => {
  test('get log packet for a given action', ({ assert }) => {
    let logPacket: any = null
    const processor = (log: any) => (logPacket = log)

    const action = new ProfilerAction('render:view', processor, '123', {})
    action.end()

    assert.equal(logPacket.label, 'render:view')
    assert.equal(logPacket.parent_id, '123')
    assert.deepEqual(logPacket.data, {})
    assert.equal(logPacket.type, 'action')
    assert.isDefined(logPacket.timestamp)
    assert.isDefined(logPacket.duration)
  })

  test('add data to log packet', ({ assert }) => {
    let logPacket: any = null
    const processor = (log: any) => (logPacket = log)

    const action = new ProfilerAction('render:view', processor, '123', { id: 1 })
    action.end()

    assert.equal(logPacket.label, 'render:view')
    assert.equal(logPacket.parent_id, '123')
    assert.deepEqual(logPacket.data, { id: 1 })
    assert.equal(logPacket.type, 'action')
    assert.isDefined(logPacket.timestamp)
    assert.isDefined(logPacket.duration)
  })

  test('merge end data with original action data', ({ assert }) => {
    let logPacket: any = null
    const processor = (log: any) => (logPacket = log)

    const action = new ProfilerAction('render:view', processor, '123', { id: 1 })
    action.end({ name: 'virk' })

    assert.equal(logPacket.label, 'render:view')
    assert.equal(logPacket.parent_id, '123')
    assert.deepEqual(logPacket.data, { id: 1, name: 'virk' })
    assert.equal(logPacket.type, 'action')
    assert.isDefined(logPacket.timestamp)
    assert.isDefined(logPacket.duration)
  })

  test('raise error when end is called twice', ({ assert }) => {
    const processor = () => {}

    const action = new ProfilerAction('render:view', processor, '123', { id: 1 })
    action.end({ name: 'virk' })

    const fn = () => action.end()
    assert.throws(fn, 'attempt to end profiler action twice')
  })

  test('get log packet for action without parent row', ({ assert }) => {
    let logPacket: any = null
    const processor = (log: any) => (logPacket = log)

    const action = new ProfilerAction('render:view', processor, undefined, {})
    action.end()

    assert.equal(logPacket.label, 'render:view')
    assert.isUndefined(logPacket.parent_id)
    assert.deepEqual(logPacket.data, {})
    assert.equal(logPacket.type, 'action')
    assert.isDefined(logPacket.timestamp)
    assert.isDefined(logPacket.duration)
  })
})
