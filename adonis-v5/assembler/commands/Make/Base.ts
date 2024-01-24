/*
 * @kubit/assembler
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { pathExists } from 'fs-extra'
import { join } from 'path'

import { BaseCommand } from '@kubit/core/build/standalone'

/**
 * Base class to generate framework entities
 */
export abstract class BaseGenerator extends BaseCommand {
  protected abstract resourceName: string
  protected abstract createExact: boolean
  protected abstract getStub(): string
  protected abstract getDestinationPath(): string

  protected suffix?: string
  protected extname: string = '.ts'
  protected form?: 'singular' | 'plural'
  protected pattern?: 'camelcase' | 'snakecase' | 'pascalcase'
  protected formIgnoreList?: string[]
  protected templateData(): any {
    return {}
  }

  /**
   * Returns path for a given namespace by replacing the base namespace
   * with the defined directories map inside the `.adonisrc.json`
   * file
   */
  protected getPathForNamespace(namespaceFor: string): string | null {
    return this.application.resolveNamespaceDirectory(namespaceFor)
  }

  /**
   * Returns contents of the rcFile
   */
  protected async hasRcFile(cwd: string) {
    const filePath = join(cwd, '.adonisrc.json')
    return pathExists(filePath)
  }

  /**
   * Handle command
   */
  public async generate() {
    const hasRcFile = await this.hasRcFile(this.application.appRoot)

    /**
     * Ensure `.adonisrc.json` file exists
     */
    if (!hasRcFile) {
      this.logger.error('Make sure your project root has ".adonisrc.json" file')
      return
    }

    const transformations = this.createExact
      ? {
          extname: this.extname,
        }
      : {
          form: this.form,
          suffix: this.suffix,
          formIgnoreList: this.formIgnoreList,
          pattern: this.pattern,
          extname: this.extname,
        }

    const file = this.generator
      .addFile(this.resourceName, transformations)
      .stub(this.getStub())
      .useMustache()
      .destinationDir(this.getDestinationPath())
      .appRoot(this.application.appRoot)
      .apply(this.templateData())

    await this.generator.run()
    return file
  }
}
