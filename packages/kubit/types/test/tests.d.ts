import '@japa/runner';

import { MakeUrlOptions } from '@ioc:Kubit/Route';

declare module '@japa/runner' {
  interface TestContext {
    route(routeIdentifier: string, params?: Record<string, any> | any[], options?: MakeUrlOptions): string;
  }
}

declare module '@japa/api-client' {
  interface ApiResponse {
    assertRedirectsToRoute(
      routeIdentifier: string,
      params?: Record<string, any> | any[],
      options?: MakeUrlOptions
    ): string;
  }
}
