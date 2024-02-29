import { AsyncLocalStorage } from 'async_hooks';

import { HttpContextContract } from '@ioc:Kubit/HttpContext';

/**
 * Find if the async localstorage is enabled or not
 */
export let usingAsyncLocalStorage = false;

/**
 * Toggle the async local storage
 */
export function useAsyncLocalStorage(enabled: boolean) {
  usingAsyncLocalStorage = enabled;
}

/**
 * Async local storage for the HTTP context
 */
export const httpContextLocalStorage = new AsyncLocalStorage<HttpContextContract>();
