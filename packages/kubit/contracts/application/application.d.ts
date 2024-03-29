import { AssetsManagerConfig } from '@ioc:Kubit/AssetsManager';
import { ConfigContract } from '@ioc:Kubit/Config';
import { IocContract, IocResolverContract } from '@ioc:Kubit/Container';
import { EnvContract } from '@ioc:Kubit/Env';
import * as Helpers from '@ioc:Kubit/Helpers';
import { LoggerConfig, LoggerContract } from '@ioc:Kubit/Logger';
import { ProfilerContract } from '@ioc:Kubit/Profiler';
import { ServerConfig } from '@ioc:Kubit/Server';
import { ValidatorConfig } from '@ioc:Kubit/Validator';

declare module '@ioc:Kubit/Application' {
  /**
   * The interface that is meant to be extended in
   * the user land and other packages
   */
  export interface ContainerBindings {
    'Kubit/Application': ApplicationContract;
    'Kubit/Profiler': ProfilerContract;
    'Kubit/Logger': LoggerContract;
    'Kubit/Config': ConfigContract;
    'Kubit/Env': EnvContract;
    'Kubit/Helpers': typeof Helpers;
  }

  export type ApplicationStates = 'initiated' | 'setup' | 'registered' | 'booted' | 'ready' | 'shutdown';

  /**
   * Shape of directories object with known and unknown
   * directories
   */
  export interface DirectoriesNode {
    commands: string;
    controllers: string;
    middleware: string;
    config: string;
    jobs: string;
    listeners: string;
    mailers: string;
    jobs: string;
    models: string;
    exceptions: string;
    bootstrap: string;
    public: string;
    contracts: string;
    providers: string;
    database: string;
    migrations: string;
    seeds: string;
    factories: string;
    resources: string;
    validators: string;
    views: string;
    routes: string;
    storage: string;
    tests: string;
  }

  /**
   * Shape of namespaces object with known and unknown
   * directories
   */
  export interface NamespacesNode {
    models: string;
    exceptions: string;
    middleware: string;
    controllers: string;
    listeners: string;
    validators: string;
    commands: string;
    jobs: string;
    mailers: string;
    providers: string;
  }

  /**
   * Application environments
   */
  export type AppEnvironments = 'web' | 'console' | 'test' | 'repl' | 'unknown';

  /**
   * Shape of preload files
   */
  export type PreloadNode = {
    file: string;
    environment: Exclude<AppEnvironments, 'unknown'>[];
    optional: boolean;
  };

  /**
   * Shape of semver node
   */
  export type SemverNode = {
    major: number;
    minor: number;
    patch: number;
    prerelease: (string | number)[];
    version: string;
    toString(): string;
  };

  /**
   * Shape of the meta file inside the `kubit.metaFiles` array inside
   * `package.json` file.
   */
  export type MetaFileNode = {
    pattern: string;
    reloadServer: boolean;
  };

  /**
   * Shape of boot config
   */
  export type BootConfig<Preload = string | PreloadNode> = {
    typescript: boolean;
    exceptionHandlerNamespace?: string;
    assetsDriver?: AssetsDriver;
    preloads: Preload[];
    metaFiles: MetaFileNode[];
    commands: string[];
    providers: string[];
    consoleProviders: string[];
    testProviders: string[];
    directories: DirectoriesNode;
    commandsAliases: {
      [key: string]: string;
    };
    aliases: {
      [key: string]: string;
    };
    tests: {
      suites: { name: string; files: string | string[]; timeout?: number }[];
      forceExit: boolean;
      timeout: number;
    };
    namespaces: NamespacesNode;
    raw: any;
  };

  export type AssetsDriver = 'vite' | 'encore' | 'fake';

  export interface ApplicationContract {
    state: ApplicationStates;

    /**
     * Readonly reference to the parsed rc file
     */
    readonly bootConfig: BootConfig;

    /**
     * Absolute path to the application root
     */
    readonly appRoot: string;

    /**
     * Absolute path to the current working directory
     */
    readonly cliCwd?: string;

    /**
     * Name of the application defined inside package.json file
     */
    readonly appName: string;

    /**
     * Version of `@kubit/core` package
     */
    readonly kubitVersion: SemverNode | null;

    /**
     * Version of the application defined inside package.json file
     */
    readonly version: SemverNode | null;

    /**
     * A boolean to know if application source is written in Typescript.
     */
    readonly typescript: boolean;

    /**
     * Application environment.
     *
     * - `console` is when running ace commands
     * - `web` is when running http server
     * - `test` is when running tests
     */
    readonly environment: AppEnvironments;

    /**
     * Global exception handler namespace
     */
    exceptionHandlerNamespace?: string;

    /**
     * The driver to use for assets bundling.
     */
    assetsDriver?: AssetsDriver;

    /**
     * Reference to the IoC container
     */
    container: IocContract<ContainerBindings>;

    /**
     * Available after the [[setup]] call
     */
    logger: LoggerContract;
    profiler: ProfilerContract;
    env: EnvContract;
    config: ConfigContract;
    helpers: typeof Helpers;

    /**
     * Reference to preloads defined inside `package.json` file
     */
    preloads: string[] | PreloadNode[];

    /**
     * Value of `NODE_ENV`. But normalized in certain cases.
     *
     * - `development` - We normalize `dev`, `develop` to "development"
     * - `staging` - We normalize `stage` to "staging"
     * - `production` - We normalize `prod` to "production"
     * - `testing` - We normalize `test` to "testing"
     *
     * Rest of the values remains untouched
     */
    nodeEnvironment: string;

    /**
     * A boolean to know if application is ready
     */
    readonly isReady: boolean;

    /**
     * A boolean to know if application is running in production
     * mode
     */
    inProduction: boolean;

    /**
     * A boolean to know if application is running in dev mode
     */
    inDev: boolean;

    /**
     * Returns true when `this.nodeEnvironment === 'test'`
     */
    inTest: boolean;

    /**
     * A boolean to know if application is tearing down
     */
    isShuttingDown: boolean;

    /**
     * Reference to the relative paths of conventional and custom directories
     * defined inside `package.json` file
     */
    directoriesMap: Map<string, string>;

    /**
     * Reference to the alias directories.
     */
    aliasesMap: Map<string, string>;

    /**
     * Reference to the base namespaces for certain pre-defined
     * directories
     */
    namespacesMap: Map<string, string>;

    /**
     * Returns path for a given namespace by replacing the base namespace
     * with the defined directories map inside the package.json file.
     */
    resolveNamespaceDirectory(namespaceFor: string): string | null;

    /**
     * Make path to a file or directory from the application root
     */
    makePath(...paths: string[]): string;

    /**
     * Switch application environment. Only allowed before the setup
     * is called
     */
    switchEnvironment(environment: AppEnvironments): this;

    /**
     * Make path to a file or directory from the application source root
     * @deprecated Use `makePath` instead
     */
    makePathFromCwd(...paths: string[]): string;

    /**
     * Make path to a file or directory from the config directory root
     */
    configPath(...paths: string[]): string;

    /**
     * Make path to a file or directory from the public directory root
     */
    publicPath(...paths: string[]): string;

    /**
     * Make path to a file or directory from the database directory root
     */
    databasePath(...paths: string[]): string;

    /**
     * Make path to a file or directory from the migrations directory root
     */
    migrationsPath(...paths: string[]): string;

    /**
     * Make path to a file or directory from the seeds path root
     */
    seedsPath(...paths: string[]): string;

    /**
     * Make path to a file or directory from the resources path root
     */
    resourcesPath(...paths: string[]): string;

    /**
     * Make path to a file or directory from the views path root
     */
    viewsPath(...paths: string[]): string;

    /**
     * Make path to a file or directory from the bootstrap path root
     */
    bootstrapPath(...paths: string[]): string;

    /**
     * Make path to a file or directory from the storage path root
     */
    storagePath(...paths: string[]): string;

    /**
     * Serialized output
     */
    toJSON(): {
      isReady: boolean;
      isShuttingDown: boolean;
      environment: AppEnvironments;
      nodeEnvironment: string;
      appName: string;
      version: string | null;
      kubitVersion: string | null;
    };

    /**
     * Performs the initial setup. This is the time, when we configure the
     * app to be able to boot itself. For example:
     *
     * - Loading environment variables
     * - Loading config
     * - Setting up the logger
     * - Registering directory aliases
     *
     * Apart from the providers, most of the app including the container
     * is ready at this stage
     */
    setup(): Promise<void>;

    /**
     * Register providers
     */
    registerProviders(): Promise<void>;

    /**
     * Booted providers
     */
    bootProviders(): Promise<void>;

    /**
     * Registers the providers
     */
    requirePreloads(): Promise<void>;

    /**
     * Start the application. At this time we execute the provider's
     * ready hooks
     */
    start(): Promise<void>;

    /**
     * Prepare the application for shutdown. At this time we execute the
     * provider's shutdown hooks
     */
    shutdown(): Promise<void>;
  }

  export interface ApplicationConfig {
    appKey: string;
    http: ServerConfig;
    logger: LoggerConfig;
    profiler: ProfilerConfig;
    validator: ValidatorConfig;
    assets: AssetsManagerConfig;
  }

  const Application: ApplicationContract;
  export default Application;

  /**
   * Export Ioc Container static types
   */
  export * from '../container/Contracts';
}
