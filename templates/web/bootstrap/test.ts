/*
|--------------------------------------------------------------------------
| Tests
|--------------------------------------------------------------------------
|
| The contents in this file boots the Kubit application and configures
| the Japa tests runner.
|
| For the most part you will never edit this file. The configuration
| for the tests can be controlled via the "tests/bootstrap.ts" file.
|
*/

process.env.NODE_ENV = 'test';

import 'reflect-metadata';

import { Ignitor } from 'kubit';
import { resolve } from 'path';
import sourceMapSupport from 'source-map-support';

import { configure, processCliArgs, run, RunnerHooksHandler } from '@japa/runner';

sourceMapSupport.install({ handleUncaughtExceptions: false });

const kernel = new Ignitor(resolve(__dirname, '../')).kernel('test');

kernel
  .boot()
  .then(() => import('../tests/bootstrap'))
  .then(({ runnerHooks, ...config }) => {
    const app: RunnerHooksHandler[] = [() => kernel.start()];

    configure({
      ...kernel.application.bootConfig.tests,
      ...processCliArgs(process.argv.slice(2)),
      ...config,
      ...{
        importer: (filePath) => import(filePath),
        setup: app.concat(runnerHooks.setup),
        teardown: runnerHooks.teardown,
      },
      cwd: kernel.application.appRoot,
    });

    run();
  });
