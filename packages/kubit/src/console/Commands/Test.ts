import { JapaFlags } from '../../assembler/Contracts';
import { BaseCommand } from '../BaseCommand';
import { args } from '../Decorators/args';
import { flags } from '../Decorators/flags';

/**
 * Run tests
 */
export class Test extends BaseCommand {
  public static commandName = 'test';
  public static description = 'Run tests';
  public static settings = {
    stayAlive: true,
  };

  @args.spread({ description: 'Run tests for only the specified suites', required: false })
  public suites: string[];

  /**
   * Allows watching for file changes
   */
  @flags.array({
    description: 'Run tests for the mentioned files only',
  })
  public files: string[];

  /**
   * Allows watching for file changes
   */
  @flags.boolean({
    description: 'Watch for file changes and re-run tests on file change',
    alias: 'w',
  })
  public watch: boolean;

  /**
   * Detect changes by polling files
   */
  @flags.boolean({
    description: 'Detect file changes by polling files instead of listening to filesystem events',
    alias: 'p',
  })
  public poll: boolean;

  /**
   * Arguments to pass to the `node` binary
   */
  @flags.array({ description: 'CLI options to pass to the Node.js command line' })
  public nodeArgs: string[] = [];

  /**
   * Filter by tags
   */
  @flags.array({ description: 'Filter tests by tags' })
  public tags: string[];

  /**
   * Filter by tags
   */
  @flags.array({ description: 'Filter tests by ignoring tags' })
  public ignoreTags: string[];

  /**
   * Filter by test title
   */
  @flags.array({ description: 'Filter tests by title' })
  public tests: string[];

  /**
   * Filter by group title
   */
  @flags.array({ description: 'Filter tests by group title' })
  public groups: string[];

  /**
   * Customize tests timeout
   */
  @flags.number({ description: 'Customize tests timeout' })
  public timeout: number;

  /**
   * Force exit the tests runner
   */
  @flags.boolean({ description: 'Force exit the tests runner process' })
  public forceExit: boolean;

  /**
   * Convert command flags to test filters
   */
  private getTestFilters() {
    const filters: JapaFlags = {};
    if (this.forceExit) {
      filters['--force-exit'] = true;
    }

    if (this.files) {
      filters['--files'] = this.files;
    }

    if (this.timeout !== undefined) {
      filters['--timeout'] = this.timeout;
    }

    if (this.tags) {
      filters['--tags'] = this.tags;
    }

    if (this.suites) {
      filters._ = this.suites;
    }

    if (this.ignoreTags) {
      filters['--ignore-tags'] = this.ignoreTags;
    }

    if (this.tests) {
      filters['--tests'] = this.tests;
    }

    if (this.groups) {
      filters['--groups'] = this.groups;
    }

    return filters;
  }

  public async run() {
    const { TestsServer } = await import('../../assembler/Test');

    try {
      if (this.watch) {
        await new TestsServer(this.application.appRoot, this.getTestFilters(), this.nodeArgs, this.logger).watch();
      } else {
        await new TestsServer(this.application.appRoot, this.getTestFilters(), this.nodeArgs, this.logger).run();
      }
    } catch (error) {
      this.exitCode = 1;
      this.logger.fatal(error);
    }
  }
}
