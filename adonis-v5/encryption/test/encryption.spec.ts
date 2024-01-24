/*
 * @adonisjs/encryption
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../adonis-typings/encryption.ts" />

import { test } from '@japa/runner'
import { Encryption } from '../src/Encryption'

const SECRET = 'averylongradom32charactersstring'

test.group('Encryption', () => {
  test('encrypt value', ({ assert }) => {
    const encryption = new Encryption({ secret: SECRET })
    assert.notEqual(encryption.encrypt('hello-world'), 'hello-world')
    assert.equal(encryption.decrypt(encryption.encrypt('hello-world')), 'hello-world')
  })

  test('encrypt an object with a secret', ({ assert }) => {
    const encryption = new Encryption({ secret: SECRET })
    const encrypted = encryption.encrypt({ username: 'virk' })
    assert.exists(encrypted)
  })

  test('ensure iv is random for each encryption call', ({ assert }) => {
    const encryption = new Encryption({ secret: SECRET })
    assert.notEqual(
      encryption.encrypt({ username: 'virk' }),
      encryption.encrypt({ username: 'virk' })
    )
  })

  test('decrypt encrypted value', ({ assert }) => {
    const encryption = new Encryption({ secret: SECRET })
    const encrypted = encryption.encrypt({ username: 'virk' })
    assert.deepEqual(encryption.decrypt(encrypted), { username: 'virk' })
  })

  test('return null when value is in invalid format', ({ assert }) => {
    const encryption = new Encryption({ secret: SECRET })
    assert.isNull(encryption.decrypt('foo'))
  })

  test('return null when unable to decode encrypted value', ({ assert }) => {
    const encryption = new Encryption({ secret: SECRET })
    assert.isNull(encryption.decrypt('foo--bar--baz'))
  })

  test('return null when hash is tampered', ({ assert }) => {
    const encryption = new Encryption({ secret: SECRET })
    const encrypted = encryption.encrypt({ username: 'virk' })
    assert.isNull(encryption.decrypt(encrypted.slice(0, -2)))
  })

  test('return null when encrypted value is tampered', ({ assert }) => {
    const encryption = new Encryption({ secret: SECRET })
    const encrypted = encryption.encrypt({ username: 'virk' })
    assert.isNull(encryption.decrypt(encrypted.slice(2)))
  })

  test('return null when iv value is tampered', ({ assert }) => {
    const encryption = new Encryption({ secret: SECRET })
    const encrypted = encryption.encrypt({ username: 'virk' })

    const ivIndex = encrypted.indexOf('--') + 2
    const part1 = encrypted.slice(0, ivIndex)
    const part2 = encrypted.slice(ivIndex).slice(2)

    assert.isNull(encryption.decrypt(`${part1}${part2}`))
  })

  test('return null when purpose is missing during decrypt', ({ assert }) => {
    const encryption = new Encryption({ secret: SECRET })
    const encrypted = encryption.encrypt({ username: 'virk' }, undefined, 'login')
    assert.isNull(encryption.decrypt(encrypted))
  })

  test('return null when purpose is defined only during decrypt', ({ assert }) => {
    const encryption = new Encryption({ secret: SECRET })
    const encrypted = encryption.encrypt({ username: 'virk' })
    assert.isNull(encryption.decrypt(encrypted, 'login'))
  })

  test('return null when purpose are not same', ({ assert }) => {
    const encryption = new Encryption({ secret: SECRET })
    const encrypted = encryption.encrypt({ username: 'virk' }, undefined, 'register')
    assert.isNull(encryption.decrypt(encrypted, 'login'))
  })

  test('decrypt when purpose are same', ({ assert }) => {
    const encryption = new Encryption({ secret: SECRET })
    const encrypted = encryption.encrypt({ username: 'virk' }, undefined, 'register')
    assert.deepEqual(encryption.decrypt(encrypted, 'register'), { username: 'virk' })
  })

  test('get new instance of encryptor with different key', ({ assert }) => {
    const encryption = new Encryption({ secret: SECRET })
    const customEncryptor = encryption.child({ secret: 'another secret key' })
    assert.isNull(encryption.decrypt(customEncryptor.encrypt('hello-world')))
  })
})
