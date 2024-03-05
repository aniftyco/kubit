import { BaseCommand } from '../BaseCommand';

/**
 * Base class to generate framework entities
 */
export abstract class GeneratorCommand extends BaseCommand {
  protected abstract resourceName: string;
  protected abstract createExact: boolean;
  protected abstract getStub(): string;
  protected abstract getDestinationPath(): string;

  protected suffix?: string;
  protected extname: string = '.ts';
  protected form?: 'singular' | 'plural';
  protected pattern?: 'camelcase' | 'snakecase' | 'pascalcase';
  protected formIgnoreList?: string[];
  protected templateData(): any {
    return {};
  }

  /**
   * Returns path for a given namespace by replacing the base namespace
   * with the defined directories map inside the `.adonisrc.json`
   * file
   */
  protected getPathForNamespace(namespaceFor: string): string | null {
    return this.application.resolveNamespaceDirectory(namespaceFor);
  }

  /**
   * Handle command
   */
  public async generate() {
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
        };

    const file = this.generator
      .addFile(this.resourceName, transformations)
      .stub(this.getStub())
      .useMustache()
      .destinationDir(this.getDestinationPath())
      .appRoot(this.application.appRoot)
      .apply(this.templateData());

    await this.generator.run();
    return file;
  }
}
