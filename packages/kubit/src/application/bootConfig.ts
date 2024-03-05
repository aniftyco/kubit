import { BootConfig, MetaFileNode, PreloadNode } from '@ioc:Kubit/Application';
import { Exception } from '@poppinss/utils';

export const defaultBootConfig: BootConfig = {
  typescript: true,
  directories: {
    config: 'config',
    public: 'public',
    contracts: 'contracts',
    providers: 'app/Providers',
    database: 'database',
    migrations: 'database/migrations',
    seeds: 'database/seeders',
    resources: 'resources',
    views: 'resources/views',
    start: 'bootstrap',
    tmp: 'storage/tmp',
    tests: 'tests',
  },
  namespaces: {
    models: '@app/Models',
    middleware: '@app/Http/Middleware',
    exceptions: '@app/Exceptions',
    validators: '@app/Validators',
    httpControllers: '@app/Http/Controllers',
    eventListeners: '@app/Listeners',
    redisListeners: '@app/Listeners',
  },
  commands: ['./app/Commands'],
  commandsAliases: {},
  exceptionHandlerNamespace: '@app/Exceptions/Handler',
  preloads: ['./bootstrap/kernel', './routes/web', './routes/api'],
  aliases: { '@app': 'app' },
  providers: ['kubit/dist/provider', './app/Providers/AppProvider'],
  consoleProviders: ['kubit/dist/repl/provider'],
  testProviders: ['kubit/dist/test/provider'],
  metaFiles: [
    {
      pattern: 'public/**',
      reloadServer: false,
    },
    {
      pattern: 'resources/views/**/*.edge',
      reloadServer: false,
    },
  ],
  tests: {
    suites: [
      {
        name: 'functional',
        files: ['tests/functional/**/*.spec.ts'],
        timeout: 60000,
      },
      {
        name: 'unit',
        files: ['tests/unit/**/*.spec.ts'],
        timeout: 60000,
      },
      {
        name: 'e2e',
        files: ['tests/e2e/**/*.spec.ts'],
        timeout: 60000,
      },
    ],
    timeout: 2000,
    forceExit: true,
  },
  raw: null,
};

/**
 * Parses the contents of `package.json#kubit` config and merges it with the
 * defaults.
 */
export function parse(contents: { [key: string]: any }): BootConfig<PreloadNode> {
  const normalizedContents = Object.assign(
    {
      typescript: true,
      directories: {
        config: 'config',
        public: 'public',
        contracts: 'contracts',
        providers: 'app/Providers',
        database: 'database',
        migrations: 'database/migrations',
        seeds: 'database/seeders',
        resources: 'resources',
        views: 'resources/views',
        start: 'bootstrap',
        tmp: 'storage/tmp',
        tests: 'tests',
      },
      namespaces: {
        models: '@app/Models',
        middleware: '@app/Http/Middleware',
        exceptions: '@app/Exceptions',
        validators: '@app/Validators',
        httpControllers: '@app/Http/Controllers',
        eventListeners: '@app/Listeners',
        redisListeners: '@app/Listeners',
      },
      commands: ['./app/Commands'],
      commandsAliases: {},
      exceptionHandlerNamespace: '@app/Exceptions/Handler',
      preloads: ['./bootstrap/kernel', './routes/web', './routes/api'],
      aliases: { '@app': 'app' },
      providers: ['kubit/dist/provider', './app/Providers/AppProvider'],
      consoleProviders: ['kubit/dist/repl/provider'],
      testProviders: ['kubit/dist/test/provider'],
      metaFiles: [
        {
          pattern: 'public/**',
          reloadServer: false,
        },
        {
          pattern: 'resources/views/**/*.edge',
          reloadServer: false,
        },
      ],
      tests: {
        suites: [
          {
            name: 'functional',
            files: ['tests/functional/**/*.spec.ts'],
            timeout: 60000,
          },
          {
            name: 'unit',
            files: ['tests/unit/**/*.spec.ts'],
            timeout: 60000,
          },
          {
            name: 'e2e',
            files: ['tests/e2e/**/*.spec.ts'],
            timeout: 60000,
          },
        ],
        timeout: 2000,
        forceExit: true,
      },
    },
    contents
  );

  /**
   * Validate the assetsDriver value
   */
  const { assetsDriver } = normalizedContents;
  if (assetsDriver && !['vite', 'encore', 'fake'].includes(assetsDriver)) {
    throw new Exception(
      `Invalid assets driver "${assetsDriver}" defined in package.json file`,
      500,
      'E_INVALID_ASSETS_DRIVER'
    );
  }

  return {
    typescript: normalizedContents.typescript,
    ...(assetsDriver ? { assetsDriver } : {}),
    directories: Object.assign({}, normalizedContents.directories),
    ...(normalizedContents.exceptionHandlerNamespace
      ? { exceptionHandlerNamespace: normalizedContents.exceptionHandlerNamespace }
      : {}),
    preloads: normalizedContents.preloads.map((preload: PreloadNode | string, index: number) => {
      if (typeof preload === 'string') {
        return {
          file: preload,
          optional: false,
          environment: ['web', 'console', 'test', 'repl'],
        };
      }

      if (!preload.file) {
        throw new Exception(`Invalid value for preloads[${index}]`, 500, 'E_PRELOAD_MISSING_FILE_PROPERTY');
      }

      return {
        file: preload.file,
        optional: preload.optional === undefined ? false : preload.optional,
        environment: preload.environment === undefined ? ['web', 'console', 'test', 'repl'] : preload.environment,
      };
    }),
    namespaces: Object.assign({}, normalizedContents.namespaces),
    aliases: Object.assign({}, normalizedContents.autoloads, normalizedContents.aliases),
    metaFiles: normalizedContents.metaFiles.map((file: MetaFileNode | string, index) => {
      if (typeof file === 'string') {
        return {
          pattern: file,
          reloadServer: true,
        };
      }

      const { pattern, reloadServer } = file;
      if (!pattern) {
        throw new Exception(`Invalid value for metaFiles[${index}]`, 500, 'E_METAFILE_MISSING_PATTERN');
      }

      return {
        pattern,
        reloadServer: !!reloadServer,
      };
    }),
    commands: normalizedContents.commands,
    commandsAliases: normalizedContents.commandsAliases,
    providers: normalizedContents.providers,
    consoleProviders: normalizedContents.consoleProviders,
    testProviders: normalizedContents.testProviders,
    tests: {
      suites: (normalizedContents.tests.suites || []).map((suite: any, index) => {
        if (!suite.name || !suite.files) {
          throw new Exception(`Invalid value for "tests.suites[${index}]"`, 500, 'E_MISSING_SUITE_PROPERTIES');
        }

        return suite;
      }),
      timeout: normalizedContents.tests.timeout !== undefined ? normalizedContents.tests.timeout : 2000,
      forceExit: normalizedContents.tests.forceExit !== undefined ? normalizedContents.tests.forceExit : true,
    },
    raw: contents,
  };
}
