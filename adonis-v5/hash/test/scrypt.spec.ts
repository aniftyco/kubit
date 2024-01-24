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
import { scryptFactory } from '../test-helpers'
import { kMaxUint24 } from '../src/utils'

test.group('Scrypt', () => {
  test('hash value', async ({ assert }) => {
    const scrypt = scryptFactory()

    const hashed = await scrypt.make('Romain Lanz')
    const values = phc.deserialize(hashed)

    assert.equal(values.id, 'scrypt')
    assert.deepEqual(values.params, { n: 2048, r: 8, p: 1 })
    assert.lengthOf(values.salt, 16)
  })

  test('verify hash value', async ({ assert }) => {
    const scrypt = scryptFactory()

    const hashed = await scrypt.make('Romain Lanz')
    let matches = await scrypt.verify(hashed, 'Romain Lanz')
    assert.isTrue(matches)

    matches = await scrypt.verify(hashed, 'Romain')
    assert.isFalse(matches)
  })

  test('return true for needsRehash when one of the params is different', async ({ assert }) => {
    const scrypt = scryptFactory()
    const scrypt2 = scryptFactory({
      parallelization: 2,
    })

    const hashed = await scrypt.make('Romain Lanz')
    assert.isTrue(scrypt2.needsReHash(hashed))
    assert.isFalse(scrypt.needsReHash(hashed))
  })

  test('return true for needsRehash when hash value is not formatted as a phc string', async ({
    assert,
  }) => {
    const hash =
      '46219dec36aeeb9587836be851a8147ce0837b1bef30b28400cf1decce027c937333a314068577835b6f44f34f75758b6de3161696fade65731f5548ea09d95e'
    const scrypt = scryptFactory()

    assert.isTrue(scrypt.needsReHash(hash))
  })

  test('should throw exception when hash value is not formatted as a phc string', async ({
    assert,
  }) => {
    const hash =
      '46219dec36aeeb9587836be851a8147ce0837b1bef30b28400cf1decce027c937333a314068577835b6f44f34f75758b6de3161696fade65731f5548ea09d95e'
    const scrypt = scryptFactory()

    await assert.rejects(async () => {
      await scrypt.verify(hash, 'Romain Lanz')
    }, 'The hash must be a valid phc string')
  })

  test('should throw exception when the identifier is not compatible', async ({ assert }) => {
    const hash = phc.serialize({
      id: 'bcrypt',
      params: { n: 1024, r: 8, p: 1 },
      salt: Buffer.from('46219dec36aeeb9587836be851a8147ce0837b1bef30b28400cf1decce027c93'),
      hash: Buffer.from('7333a314068577835b6f44f34f75758b6de3161696fade65731f5548ea09d95e'),
    })

    const scrypt = scryptFactory()

    await assert.rejects(async () => {
      await scrypt.verify(hash, 'Romain Lanz')
    }, 'Incompatible bcrypt identifier found in the hash')
  })

  test('should throw exception when there is no params', async ({ assert }) => {
    const hash = phc.serialize({
      id: 'scrypt',
      salt: Buffer.from('46219dec36aeeb9587836be851a8147ce0837b1bef30b28400cf1decce027c93'),
      hash: Buffer.from('7333a314068577835b6f44f34f75758b6de3161696fade65731f5548ea09d95e'),
    })

    const scrypt = scryptFactory()

    await assert.rejects(async () => {
      await scrypt.verify(hash, 'Romain Lanz')
    }, 'The param section cannot be empty')
  })

  test('should throw exception when param "n" is not a integer', async ({ assert }) => {
    const hash = phc.serialize({
      id: 'scrypt',
      params: { n: 'foo', r: 8, p: 1 },
      salt: Buffer.from('46219dec36aeeb9587836be851a8147ce0837b1bef30b28400cf1decce027c93'),
      hash: Buffer.from('7333a314068577835b6f44f34f75758b6de3161696fade65731f5548ea09d95e'),
    })

    const scrypt = scryptFactory()

    await assert.rejects(async () => {
      await scrypt.verify(hash, 'Romain Lanz')
    }, `The 'n' param must be an integer`)
  })

  test('should throw exception when param "r" is not a integer', async ({ assert }) => {
    const hash = phc.serialize({
      id: 'scrypt',
      params: { n: 1024, r: 'foo', p: 1 },
      salt: Buffer.from('46219dec36aeeb9587836be851a8147ce0837b1bef30b28400cf1decce027c93'),
      hash: Buffer.from('7333a314068577835b6f44f34f75758b6de3161696fade65731f5548ea09d95e'),
    })

    const scrypt = scryptFactory()

    await assert.rejects(async () => {
      await scrypt.verify(hash, 'Romain Lanz')
    }, `The 'r' param must be an integer`)
  })

  test('should throw exception when param "p" is not a integer', async ({ assert }) => {
    const hash = phc.serialize({
      id: 'scrypt',
      params: { n: 1024, r: 8, p: 'foo' },
      salt: Buffer.from('46219dec36aeeb9587836be851a8147ce0837b1bef30b28400cf1decce027c93'),
      hash: Buffer.from('7333a314068577835b6f44f34f75758b6de3161696fade65731f5548ea09d95e'),
    })

    const scrypt = scryptFactory()

    await assert.rejects(async () => {
      await scrypt.verify(hash, 'Romain Lanz')
    }, `The 'p' param must be an integer`)
  })

  test('should throw exception when param "n" is not a power of 2', async ({ assert }) => {
    const hash = phc.serialize({
      id: 'scrypt',
      params: { n: 1025, r: 8, p: 1 },
      salt: Buffer.from('46219dec36aeeb9587836be851a8147ce0837b1bef30b28400cf1decce027c93'),
      hash: Buffer.from('7333a314068577835b6f44f34f75758b6de3161696fade65731f5548ea09d95e'),
    })

    const scrypt = scryptFactory()

    await assert.rejects(async () => {
      await scrypt.verify(hash, 'Romain Lanz')
    }, `The 'n' param must be a power of 2 greater than 1`)
  })

  test('should throw exception when param "n" is less than 2', async ({ assert }) => {
    const hash = phc.serialize({
      id: 'scrypt',
      params: { n: 1, r: 8, p: 1 },
      salt: Buffer.from('46219dec36aeeb9587836be851a8147ce0837b1bef30b28400cf1decce027c93'),
      hash: Buffer.from('7333a314068577835b6f44f34f75758b6de3161696fade65731f5548ea09d95e'),
    })

    const scrypt = scryptFactory()

    await assert.rejects(async () => {
      await scrypt.verify(hash, 'Romain Lanz')
    }, `The 'n' param must be a power of 2 greater than 1`)
  })

  test('should throw exception when param "p" is less than 1', async ({ assert }) => {
    const hash = phc.serialize({
      id: 'scrypt',
      params: { n: 1024, r: 8, p: 0 },
      salt: Buffer.from('46219dec36aeeb9587836be851a8147ce0837b1bef30b28400cf1decce027c93'),
      hash: Buffer.from('7333a314068577835b6f44f34f75758b6de3161696fade65731f5548ea09d95e'),
    })

    const scrypt = scryptFactory()

    await assert.rejects(async () => {
      await scrypt.verify(hash, 'Romain Lanz')
    }, `The 'p' param must be in the range (1 <= parallelism <= ${kMaxUint24})`)
  })

  test('should throw exception when param "p" is greater than 2^24-1', async ({ assert }) => {
    const hash = phc.serialize({
      id: 'scrypt',
      params: { n: 1024, r: 8, p: 16777216 },
      salt: Buffer.from('46219dec36aeeb9587836be851a8147ce0837b1bef30b28400cf1decce027c93'),
      hash: Buffer.from('7333a314068577835b6f44f34f75758b6de3161696fade65731f5548ea09d95e'),
    })

    const scrypt = scryptFactory()

    await assert.rejects(async () => {
      await scrypt.verify(hash, 'Romain Lanz')
    }, `The 'p' param must be in the range (1 <= parallelism <= ${kMaxUint24})`)
  })

  test('should throw exception when the salt is not defined', async ({ assert }) => {
    const hash = phc.serialize({
      id: 'scrypt',
      params: { n: 1024, r: 8, p: 1 },
      hash: Buffer.from('7333a314068577835b6f44f34f75758b6de3161696fade65731f5548ea09d95e'),
    })

    const scrypt = scryptFactory()

    await assert.rejects(async () => {
      await scrypt.verify(hash, 'Romain Lanz')
    }, `No salt found in the given string`)
  })

  test('should throw exception when the hash is not defined', async ({ assert }) => {
    const hash = phc.serialize({
      id: 'scrypt',
      params: { n: 1024, r: 8, p: 1 },
      salt: Buffer.from('46219dec36aeeb9587836be851a8147ce0837b1bef30b28400cf1decce027c93'),
    })

    const scrypt = scryptFactory()

    await assert.rejects(async () => {
      await scrypt.verify(hash, 'Romain Lanz')
    }, `No hash found in the given string`)
  })
})
