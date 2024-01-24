/*
 * @adonisjs/hash
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Fake } from '../src/Drivers/Fake'

test.group('Fake', () => {
  test('hash value', async ({ assert }) => {
    const driver = new Fake()
    const hashed = await driver.make('hello-world')

    assert.equal(hashed, 'hello-world')
  })

  test('verify hashed value', async ({ assert }) => {
    const driver = new Fake()
    const hashed = await driver.make('hello-world')

    let matched = await driver.verify(hashed, 'hello-world')
    assert.isTrue(matched)

    matched = await driver.verify(hashed, 'hi-world')
    assert.isFalse(matched)
  })
})
