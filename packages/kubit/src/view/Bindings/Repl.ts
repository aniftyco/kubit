/*
 * @kubit/view
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ApplicationContract } from '@ioc:Kubit/Application';
import { ReplContract } from '@ioc:Kubit/Repl';

/**
 * Define repl bindings. The method must be invoked when application environment
 * is set to repl.
 */
export function defineReplBindings(app: ApplicationContract, Repl: ReplContract) {
  Repl.addMethod(
    'loadView',
    (repl) => {
      repl.server.context.View = app.container.use('Kubit/View');
      repl.notify(`Loaded View module. You can access it using the "${repl.colors.underline('View')}" variable`);
    },
    {
      description: 'Load view provider and save reference to the "View" variable',
    }
  );
}
