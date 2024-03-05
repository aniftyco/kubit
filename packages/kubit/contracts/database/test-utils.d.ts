declare module '@ioc:Kubit/TestUtils' {
  type HookCleanupHandler = () => Promise<void>;
  type HookCallback = () => Promise<HookCleanupHandler> | Promise<void>;

  export interface TestUtilsContract {
    db(connectionName?: string): {
      seed: HookCallback;
      migrate: HookCallback;
      truncate: HookCallback;
    };
  }
}
