/*
 * @kubit/assembler
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { extname, join } from 'path'
import slash from 'slash'

import { args, flags } from '@kubit/core/build/standalone'

import { BaseGenerator } from './Base'

/**
 * Command to make a new provider
 */
export default class MakeProvider extends BaseGenerator {
  /**
   * Required by BaseGenerator
   */
  protected suffix = 'Provider'
  protected form = 'singular' as const
  protected pattern = 'pascalcase' as const
  protected resourceName: string
  protected createExact: boolean

  /**
   * Command meta data
   */
  public static commandName = 'make:provider'
  public static description = 'Make a new provider class'

  @args.string({ description: 'Name of the provider class' })
  public name: string

  @flags.boolean({ description: 'Register provider under the ace providers array' })
  public ace: boolean

  @flags.boolean({
    description: 'Create the provider with the exact name as provided',
    alias: 'e',
  })
  public exact: boolean

  /**
   * Returns the template stub path
   */
  protected getStub(): string {
    return join(__dirname, '..', '..', 'templates', 'provider.txt')
  }

  /**
   * Path to the providers directory
   */
  protected getDestinationPath(): string {
    return this.application.rcFile.directories.providers || 'providers'
  }

  public async run() {
    this.resourceName = this.name
    this.createExact = this.exact
    const file = await super.generate()

    if (!file) {
      return
    }

    const { files } = await import('@kubit/sink')
    const relativePath = file.toJSON().relativepath
    const rcFile = new files.AdonisRcFile(this.application.appRoot)

    if (this.ace) {
      rcFile.addAceProvider(`./${slash(relativePath).replace(extname(relativePath), '')}`)
    } else {
      rcFile.addProvider(`./${slash(relativePath).replace(extname(relativePath), '')}`)
    }

    rcFile.commit()
  }
}
