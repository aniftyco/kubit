/*
 * @adonisjs/require-ts
 *
 * (c) Harminder Virk <virk@adonisjs.comharminder@cav.ai>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Custom transformers extracted from the package.json file
 */
export type Transformers = {
  before?: { transform: string }[]
  after?: { transform: string }[]
  afterDeclarations?: { transform: string }[]
}
