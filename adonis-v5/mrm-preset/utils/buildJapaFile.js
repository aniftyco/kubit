/*
* @adonisjs/mrm-preset
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

const recast = require('recast')

/**
 * Added to japaFile.js
 */
const japaFileContents = `const { configure } = require('japa')

configure({
  files: ['test/**/*.spec.ts'],
})`

/**
 * Add to japaFile.js when project uses Typescript
 */
const tsRegisterContent = 'require(\'@adonisjs/require-ts/build/register\')\n\n'

/**
 * Returns the name of the require module. It is the job
 * of the consumer to pass the `CallExpression` node
 * to this method.
 *
 * @method getRequireName
 *
 * @param  {Object}       node
 *
 * @return {String|Null}
 */
function getRequireName (node) {
  if (!node.callee || node.callee.name !== 'require') {
    return null
  }

  if (node.arguments[0].type !== 'Literal') {
    return null
  }

  return node.arguments[0].value
}

module.exports = function (existingContent, ts) {
  let usingRequireTs = false
  let usingJapa = false

  const ast = recast.parse(existingContent)

  /**
   * Looking for all callExpressions and finding neccessary `require`
   * calls.
   */
  recast.types.visit(ast, {
    visitCallExpression ({ node }) {
      if (getRequireName(node) === 'japa') {
        usingJapa = true
      }

      if (getRequireName(node) === '@adonisjs/require-ts/build/register') {
        usingRequireTs = true
      }

      return false
    }
  })

  /**
   * Add japa file contents
   */
  if (!usingJapa) {
    if (!usingRequireTs) {
      ast.program.body = recast.parse(japaFileContents).program.body.concat(ast.program.body)
    } else {
      ast.program.body = ast.program.body.concat(recast.parse(`\n\n${japaFileContents}`).program.body)
    }
  }

  /**
   * Add ts related code when missing. Also make sure this is added
   * as the first line inside the japaFile.js file
   */
  if (!usingRequireTs) {
    ast.program.body = recast.parse(tsRegisterContent).program.body.concat(ast.program.body)
  }

  /**
   * Print and return a string back
   */
  return recast.print(ast).code
}
