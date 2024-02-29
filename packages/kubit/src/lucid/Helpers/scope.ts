import { LucidModel, QueryScope, QueryScopeCallback } from '@ioc:Kubit/Lucid/Orm';

/**
 * Helper to mark a function as query scope
 */
export function scope<Model extends LucidModel, Callback extends QueryScopeCallback<Model>>(
  callback: Callback
): QueryScope<Callback> {
  return callback as QueryScope<Callback>;
}
