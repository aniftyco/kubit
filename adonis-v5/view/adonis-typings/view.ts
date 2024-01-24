/*
 * @adonisjs/view
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Adonis/Core/View' {
  import { EdgeContract, EdgeRendererContract } from 'edge.js'

  export interface ViewContract extends EdgeContract {}
  export interface ViewRendererContract extends EdgeRendererContract {}

  export {
    TagContract,
    ParserContract,
    EdgeBufferContract,
    TagTokenContract,
    TemplateConstructorContract,
  } from 'edge.js'

  const View: ViewContract
  export default View
}
