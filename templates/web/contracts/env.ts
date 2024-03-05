declare module '@ioc:Kubit/Env' {
  /*
  |--------------------------------------------------------------------------
  | Getting types for validated environment variables
  |--------------------------------------------------------------------------
  |
  | The `default` export from the "../bootstrap/env.ts" file exports types
  | for the validated environment variables. Here we merge them with the
  | `EnvTypes` interface so that you can enjoy intellisense when using
  | the "Env" module.
  |
  */

  type CustomTypes = typeof import('../bootstrap/env').default;
  interface EnvTypes extends CustomTypes {
    //
  }
}
