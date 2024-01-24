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
import argon2 from 'argon2'
import { Argon } from '../src/Drivers/Argon'

test.group('Argon', () => {
  test('hash value', async ({ assert }) => {
    const argon = new Argon({
      driver: 'argon2',
      variant: 'id',
      iterations: 3,
      memory: 4096,
      parallelism: 1,
      saltSize: 16,
    })

    const hashed = await argon.make('hello-world')
    const values = phc.deserialize(hashed)

    assert.equal(values.id, 'argon2id')
    assert.equal(values.version, 19)
    assert.deepEqual(values.params, { t: 3, m: 4096, p: 1 })
    assert.lengthOf(values.salt, 16)
  })

  test('verify hash value', async ({ assert }) => {
    const argon = new Argon({
      driver: 'argon2',
      variant: 'id',
      iterations: 3,
      memory: 4096,
      parallelism: 1,
      saltSize: 16,
    })

    const hashed = await argon.make('hello-world')
    let matches = await argon.verify(hashed, 'hello-world')
    assert.isTrue(matches)

    matches = await argon.verify(hashed, 'hi-world')
    assert.isFalse(matches)
  })

  test('return true for needsRehash when variant is different', async ({ assert }) => {
    const argon = new Argon({
      driver: 'argon2',
      variant: 'id',
      iterations: 3,
      memory: 4096,
      parallelism: 1,
      saltSize: 16,
    })

    const argon1 = new Argon({
      driver: 'argon2',
      variant: 'i',
      iterations: 3,
      memory: 4096,
      parallelism: 1,
      saltSize: 16,
    })

    const hashed = await argon.make('hello-world')
    assert.isTrue(argon1.needsReHash(hashed))
    assert.isFalse(argon.needsReHash(hashed))
  })

  test('return true for needsRehash when version is different', async ({ assert }) => {
    const argon = new Argon({
      driver: 'argon2',
      variant: 'id',
      iterations: 3,
      memory: 4096,
      parallelism: 1,
      saltSize: 16,
    })

    const hashed = await argon.make('hello-world')
    assert.isTrue(argon.needsReHash(hashed.replace('$v=19', '$v=18')))
  })

  test('return true for needsRehash when one of the params is different', async ({ assert }) => {
    const argon = new Argon({
      driver: 'argon2',
      variant: 'id',
      iterations: 3,
      memory: 4096,
      parallelism: 1,
      saltSize: 16,
    })

    const argon1 = new Argon({
      driver: 'argon2',
      variant: 'id',
      iterations: 1,
      memory: 4096,
      parallelism: 1,
      saltSize: 16,
    })

    const hashed = await argon.make('hello-world')
    assert.isTrue(argon1.needsReHash(hashed))
    assert.isFalse(argon.needsReHash(hashed))
  })

  test('return true for needsRehash when hash value is not formatted as a phc string', async ({
    assert,
  }) => {
    const hash = await argon2.hash('hello-world')
    const argon = new Argon({
      driver: 'argon2',
      variant: 'id',
      iterations: 1,
      memory: 4096,
      parallelism: 1,
      saltSize: 16,
    })

    assert.isTrue(argon.needsReHash(hash))
  })
})
