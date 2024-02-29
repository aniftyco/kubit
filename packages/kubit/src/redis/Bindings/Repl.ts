import { ApplicationContract } from '@ioc:Kubit/Application';
import { ReplContract } from '@ioc:Kubit/Repl';

/**
 * Defune repl bindings. The method must be invoked when application environment
 * is set to repl.
 */
export function defineReplBindings(application: ApplicationContract, Repl: ReplContract) {
  Repl.addMethod(
    'loadRedis',
    (repl) => {
      repl.server.context.Redis = application.container.use('Kubit/Redis');
      repl.notify(`Loaded Redis module. You can access it using the "${repl.colors.underline('Redis')}" variable`);
    },
    {
      description: 'Load redis provider and save reference to the "Redis" variable',
    }
  );
}
