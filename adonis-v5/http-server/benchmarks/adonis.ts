/**
 * @kubit/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { createServer } from 'http'
import proxyaddr from 'proxy-addr'

import { Application } from '@kubit/application'
import { Encryption } from '@kubit/encryption/build/standalone'

import { Server } from '../standalone'

const app = new Application(__dirname, 'web', {})
app.setup()

const encryption = new Encryption({ secret: 'averylongrandom32charslongsecret' })

const server = new Server(app, encryption, {
  etag: false,
  jsonpCallbackName: 'callback',
  cookie: {},
  subdomainOffset: 2,
  generateRequestId: false,
  trustProxy: proxyaddr.compile('loopback'),
  allowMethodSpoofing: false,
})

server.router.get('/', async () => {
  return { hello: 'world' }
})
server.optimize()

createServer(server.handle.bind(server)).listen(4000, () => {
  console.log('listening on 4000')
})
