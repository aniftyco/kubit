import { ApplicationContract } from '@ioc:Kubit/Application';
import { ReplContract } from '@ioc:Kubit/Repl';

/**
 * Helper to define REPL state
 */
function setupReplState(repl: any, key: string, value: any) {
  repl.server.context[key] = value;
  repl.notify(`Loaded ${key} module. You can access it using the "${repl.colors.underline(key)}" variable`);
}

/**
 * Define REPL bindings
 */
export function defineReplBindings(app: ApplicationContract, Repl: ReplContract) {
  /**
   * Load database provider to the Db provider
   */
  Repl.addMethod(
    'loadDb',
    (repl) => {
      setupReplState(repl, 'Db', app.container.use('Kubit/Database'));
    },
    {
      description: 'Load database provider to the "Db" property',
    }
  );
}
