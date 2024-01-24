/*
 * @adonisjs/hash
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import phc from '@phc/format'
import PlainBcrypt from 'bcrypt'
import { Bcrypt } from '../src/Drivers/Bcrypt'

test.group('Bcrypt', () => {
  test('hash value using defaults', async ({ assert }) => {
    const bcrypt = new Bcrypt({ rounds: 10, driver: 'bcrypt' })
    const hashed = await bcrypt.make('hello-world')
    const values = phc.deserialize(hashed)

    assert.equal(values.id, 'bcrypt')
    assert.equal(values.version, 98)
    assert.deepEqual(values.params, { r: 10 })
    assert.lengthOf(values.salt, 16)
  })

  test('verify hashed value', async ({ assert }) => {
    const bcrypt = new Bcrypt({ rounds: 10, driver: 'bcrypt' })
    const hashed = await bcrypt.make('hello-world')

    let matched = await bcrypt.verify(hashed, 'hello-world')
    assert.isTrue(matched)

    matched = await bcrypt.verify(hashed, 'hi-world')
    assert.isFalse(matched)
  })

  test('return true for needsRehash when version mismatch', async ({ assert }) => {
    const bcrypt = new Bcrypt({ rounds: 10, driver: 'bcrypt' })

    const hashed = await bcrypt.make('hello-world')
    assert.isTrue(bcrypt.needsReHash(hashed.replace('$v=98', '$v=20')))
  })

  test('return true for needsRehash when one of the params are different', async ({ assert }) => {
    const bcrypt = new Bcrypt({ rounds: 10, driver: 'bcrypt' })
    const bcrypt2 = new Bcrypt({ rounds: 11, driver: 'bcrypt' })

    const hashed = await bcrypt.make('hello-world')
    assert.isTrue(bcrypt2.needsReHash(hashed))
    assert.isFalse(bcrypt.needsReHash(hashed))
  })

  test('return true for needsRehash when hash value is not formatted as a phc string', async ({
    assert,
  }) => {
    const hash = await PlainBcrypt.hash('hello-world', 10)
    const bcrypt = new Bcrypt({ rounds: 10, driver: 'bcrypt' })
    assert.isTrue(bcrypt.needsReHash(hash))
  })
})
