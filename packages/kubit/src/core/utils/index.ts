import { createServer } from 'http';

import { ApplicationContract } from '@ioc:Kubit/Application';
import { ServerContract } from '@ioc:Kubit/Server';
import { CustomServerCallback } from '@ioc:Kubit/TestUtils';
import { resolveFrom } from '@poppinss/utils/build/helpers';

/**
 * Registers the ts hook to compile typescript code within the memory
 */
export function registerTsHook(appRoot: string) {
  require(resolveFrom(appRoot, 'kubit/dist/assembler/requireHook')).default(appRoot);
}

/**
 * Creates the Kubit HTTP server. The method is abstracted to be used by
 * test utils and the HTTP server process both.
 */
export function createHttpServer(
  application: ApplicationContract,
  server: ServerContract,
  callback?: CustomServerCallback
) {
  /**
   * Optimizing the server by pre-compiling routes and middleware
   */
  application.logger.trace('optimizing http server handler');
  server.optimize();

  /**
   * Bind exception handler to handle exceptions occured during HTTP requests.
   */
  if (application.exceptionHandlerNamespace) {
    application.logger.trace('binding %s exception handler', application.exceptionHandlerNamespace);
    server.errorHandler(application.exceptionHandlerNamespace);
  }

  const handler = server.handle.bind(server);
  server.instance = callback ? callback(handler) : createServer(handler);
}
