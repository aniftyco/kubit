/*
 * @kubit/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'

import { CookieClient } from '../src/Cookie/Client'
import { encryption } from '../test-helpers'

test.group('Cookie Client', () => {
  test('sign cookie using cookie client', async ({ assert }) => {
    const client = new CookieClient(encryption)
    const signed = client.sign('user_id', 1)!

    assert.isTrue(signed.startsWith('s:'))
    assert.equal(client.unsign('user_id', signed), 1)
  })

  test('encrypt cookie using cookie client', async ({ assert }) => {
    const client = new CookieClient(encryption)
    const encrypted = client.encrypt('user_id', 1)!

    assert.isTrue(encrypted.startsWith('e:'))
    assert.equal(client.decrypt('user_id', encrypted), 1)
  })

  test('encode cookie using cookie client', async ({ assert }) => {
    const client = new CookieClient(encryption)
    const encoded = client.encode('user_id', 1)!
    assert.equal(client.decode('user_id', encoded), 1)
  })

  test('parse plain cookie', async ({ assert }) => {
    const client = new CookieClient(encryption)
    const encoded = client.encode('user_id', 1)!
    assert.equal(client.parse('user_id', encoded), 1)
  })

  test('parse encrypted cookie using cookie client', async ({ assert }) => {
    const client = new CookieClient(encryption)
    const encrypted = client.encrypt('user_id', 1)!

    assert.isTrue(encrypted.startsWith('e:'))
    assert.equal(client.parse('user_id', encrypted), 1)
  })

  test('parse signed cookie using cookie client', async ({ assert }) => {
    const client = new CookieClient(encryption)
    const signed = client.sign('user_id', 1)!

    assert.isTrue(signed.startsWith('s:'))
    assert.equal(client.parse('user_id', signed), 1)
  })
})
