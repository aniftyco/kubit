import type { Config } from '@japa/runner';
import TestUtils from '@ioc:Kubit/TestUtils';
import { apiClient } from '@japa/api-client';
import { assert } from '@japa/assert';
import { runFailedTests } from '@japa/run-failed-tests';
import { specReporter } from '@japa/spec-reporter';

/*
|--------------------------------------------------------------------------
| Japa Plugins
|--------------------------------------------------------------------------
|
| Japa plugins allows you to add additional features to Japa. By default
| we register the assertion plugin.
|
| Feel free to remove existing plugins or add more.
|
*/
export const plugins: Required<Config>['plugins'] = [assert(), runFailedTests(), apiClient()];

/*
|--------------------------------------------------------------------------
| Japa Reporters
|--------------------------------------------------------------------------
|
| Japa reporters displays/saves the progress of tests as they are executed.
| By default, we register the spec reporter to show a detailed report
| of tests on the terminal.
|
*/
export const reporters: Required<Config>['reporters'] = [specReporter()];

/*
|--------------------------------------------------------------------------
| Runner hooks
|--------------------------------------------------------------------------
|
| Runner hooks are executed after booting the AdonisJS app and
| before the test files are imported.
|
| You can perform actions like starting the HTTP server or running migrations
| within the runner hooks
|
*/
export const runnerHooks: Pick<Required<Config>, 'setup' | 'teardown'> = {
  setup: [],
  teardown: [],
};

/*
|--------------------------------------------------------------------------
| Configure individual suites
|--------------------------------------------------------------------------
|
| You can use this method to configure suites. For example: Only start
| the HTTP server when it is a functional suite.
*/
export const configureSuite: Required<Config>['configureSuite'] = (suite) => {
  if (suite.name === 'functional') {
    suite.setup(() => TestUtils.httpServer().start());
  }
};
