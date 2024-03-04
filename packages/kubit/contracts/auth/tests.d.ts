import '@japa/api-client';

import { AuthManagerContract, GetProviderRealUser, GuardsList, ProvidersList } from '@ioc:Kubit/Auth';

declare module '@japa/api-client' {
  export interface ApiRequest {
    /**
     * Auth manager reference
     */
    authManager: AuthManagerContract;

    /**
     * Switch guard to login during the request
     */
    guard<K extends keyof GuardsList, Self>(
      this: Self,
      guard: K
    ): {
      /**
       * Login as a user
       */
      loginAs(...args: Parameters<GuardsList[K]['client']['login']>): Self;
    };

    /**
     * Login as a user
     */
    loginAs(user: GetProviderRealUser<keyof ProvidersList>): this;
  }
}
