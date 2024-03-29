import { ApplicationContract } from '@ioc:Kubit/Application';
import { ReplContract } from '@ioc:Kubit/Repl';
import { requireAll } from '@poppinss/utils/build/helpers';

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
   * Load all models to the models property
   */
  Repl.addMethod(
    'loadModels',
    (repl) => {
      const modelsPath = app.resolveNamespaceDirectory('models') || 'app/Models';
      console.log(repl.colors.dim(`recursively reading models from "${modelsPath}"`));

      const modelsAbsPath = app.makePath(modelsPath);
      setupReplState(repl, 'models', requireAll(modelsAbsPath));
    },
    {
      description: 'Recursively load Lucid models to the "models" property',
    }
  );

  /**
   * Load all factories to the factories property
   */
  Repl.addMethod(
    'loadFactories',
    (repl) => {
      const factoriesPath = app.resolveNamespaceDirectory('factories') || 'database/factories';
      console.log(repl.colors.dim(`recursively reading factories from "${factoriesPath}"`));

      const factoriesAbsPath = app.makePath(factoriesPath);
      const loadedFactories = requireAll(factoriesAbsPath);

      if (!loadedFactories) {
        return;
      }

      setupReplState(
        repl,
        'factories',
        Object.values(loadedFactories).reduce((acc, items) => ({ ...acc, ...items }), {})
      );
    },
    {
      description: 'Recursively load factories to the "factories" property',
    }
  );
}
