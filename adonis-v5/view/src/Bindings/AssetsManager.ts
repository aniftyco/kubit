/*
 * @adonisjs/view
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { EdgeError } from 'edge-error'
import { ViewContract } from '@ioc:Adonis/Core/View'
import { AssetsManagerContract } from '@ioc:Adonis/Core/AssetsManager'

/**
 * Registers the asset manager tags and globals with the template engine
 */
export function defineAssetsManagerBindings(
  View: ViewContract,
  AssetsManager: AssetsManagerContract
) {
  View.global('assetsManager', AssetsManager)
  View.global('asset', (filename: string) => AssetsManager.assetPath(filename))

  View.registerTag({
    tagName: 'entryPointStyles',
    seekable: true,
    block: false,
    compile(parser, buffer, token) {
      /**
       * Ensure an argument is defined
       */
      if (!token.properties.jsArg.trim()) {
        throw new EdgeError('Missing entrypoint name', 'E_RUNTIME_EXCEPTION', {
          filename: token.filename,
          line: token.loc.start.line,
          col: token.loc.start.col,
        })
      }

      const parsed = parser.utils.transformAst(
        parser.utils.generateAST(token.properties.jsArg, token.loc, token.filename),
        token.filename,
        parser
      )

      const entrypointName = parser.utils.stringify(parsed)
      buffer.outputExpression(
        `state.assetsManager.entryPointStyleTags(${entrypointName})`,
        token.filename,
        token.loc.start.line,
        false
      )
    },
  })

  View.registerTag({
    tagName: 'entryPointScripts',
    seekable: true,
    block: false,
    compile(parser, buffer, token) {
      /**
       * Ensure an argument is defined
       */
      if (!token.properties.jsArg.trim()) {
        throw new EdgeError('Missing entrypoint name', 'E_RUNTIME_EXCEPTION', {
          filename: token.filename,
          line: token.loc.start.line,
          col: token.loc.start.col,
        })
      }

      const parsed = parser.utils.transformAst(
        parser.utils.generateAST(token.properties.jsArg, token.loc, token.filename),
        token.filename,
        parser
      )

      const entrypointName = parser.utils.stringify(parsed)
      buffer.outputExpression(
        `state.assetsManager.entryPointScriptTags(${entrypointName})`,
        token.filename,
        token.loc.start.line,
        false
      )
    },
  })
}
