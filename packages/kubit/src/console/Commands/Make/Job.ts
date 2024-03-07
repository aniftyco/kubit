import { join } from 'path';

import { BaseCommand } from '../../BaseCommand';
import { args } from '../../Decorators/args';

/**
 * Command to make a new job
 */
export class MakeJob extends BaseCommand {
  /**
   * Command meta data
   */
  public static commandName = 'make:job';
  public static description = 'Make a new job class';

  @args.string({ description: 'Name of the job class' })
  public name: string;

  /**
   * Create the mailer template
   */
  public async run() {
    const stub = join(__dirname, '../../../..', 'templates', 'job.txt');
    const path = this.application.resolveNamespaceDirectory('jobs');

    this.generator
      .addFile(this.name, { pattern: 'pascalcase' })
      .stub(stub)
      .destinationDir(path || 'app/Jobs')
      .useMustache()
      .appRoot(this.application.cliCwd || this.application.appRoot);

    await this.generator.run();
  }
}
