/*
 * @adonisjs/ioc-transformer
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import tsStatic from 'typescript'

/**
 * Find if the node is a require call
 */
function isRequireCall(node: tsStatic.Node, ts: typeof tsStatic): node is tsStatic.CallExpression {
  return (
    ts.isCallExpression(node) &&
    node.expression &&
    ts.isIdentifier(node.expression) &&
    node.expression.escapedText === 'require'
  )
}

/**
 * Returns the module identifier. Performs checks for dynamic imports as well
 */
function getModuleIdentifier(node: tsStatic.CallExpression, ts: typeof tsStatic) {
  const firstArg = node.arguments[0]
  let moduleIdentifier: null | string = null
  let expressionType: 'templateLiteral' | 'binary' | 'static' | 'unknown' = 'unknown'

  if (ts.isTemplateExpression(firstArg)) {
    moduleIdentifier = firstArg.head.text
    expressionType = 'templateLiteral' as const
  } else if (ts.isStringLiteral(firstArg)) {
    moduleIdentifier = firstArg.text
    expressionType = 'static' as const
  } else if (ts.isBinaryExpression(firstArg) && ts.isStringLiteral(firstArg.left)) {
    moduleIdentifier = firstArg.left.text
    expressionType = 'binary' as const
  }

  return { moduleIdentifier, expressionType }
}

/**
 * Find if the module indentifier is a container binding
 */
function isContainerBinding(moduleIdentifier: string | null): moduleIdentifier is string {
  return !!moduleIdentifier && moduleIdentifier.startsWith('@ioc:')
}

/**
 * Find if the module indentifier is an alias
 */
function isAlias(aliases: string[], moduleIdentifier: string | null): moduleIdentifier is string {
  return !!(moduleIdentifier && aliases.find((alias) => moduleIdentifier!.startsWith(`${alias}/`)))
}

/**
 * Converts Ioc container import statements to `use` statements
 * in compiled Javascript code.
 */
export function iocTransformer(
  ts: typeof tsStatic,
  rcFile: { aliases: { [key: string]: string } }
) {
  const aliases = Object.keys(rcFile.aliases || {})

  return (ctx: tsStatic.TransformationContext) => {
    return (sourceFile: tsStatic.SourceFile) => {
      function visitor(node: tsStatic.Node): tsStatic.Node {
        if (isRequireCall(node, ts)) {
          const { moduleIdentifier, expressionType } = getModuleIdentifier(node, ts)

          if (isContainerBinding(moduleIdentifier)) {
            if (expressionType !== 'static') {
              throw new Error('Imports prefixed with "@ioc:" cannot use runtime values')
            }

            return ts.factory.createCallExpression(
              ts.factory.createIdentifier("global[Symbol.for('ioc.use')]"),
              undefined,
              [ts.factory.createStringLiteral(moduleIdentifier.substr(5))]
            )
          }

          if (isAlias(aliases, moduleIdentifier)) {
            return ts.factory.createCallExpression(
              ts.factory.createIdentifier("global[Symbol.for('ioc.use')]"),
              undefined,
              node.arguments
            )
          }
        }

        return ts.visitEachChild(node, visitor, ctx)
      }

      return ts.visitEachChild(sourceFile, visitor, ctx)
    }
  }
}
