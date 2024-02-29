import type { ReplContract } from '@ioc:Kubit/Repl';
import type { ApplicationContract } from '@ioc:Kubit/Application';

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
export function replBindings(app: ApplicationContract, Repl: ReplContract) {
  Repl.addMethod(
    'loadI18n',
    (repl) => {
      setupReplState(repl, 'I18n', app.container.use('Kubit/I18n'));
    },
    {
      description: 'Load I18n provider to the "I18n" property',
    }
  );
}
