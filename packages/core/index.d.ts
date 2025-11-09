declare module "react" {
  interface FC<P = {}> {
    (props: P): any;
  }
}

declare module "@app:config" {
  export function defineConfig<T>(config: T): T;
}

declare module "@app:env" {
  export function env<T>(key: string, defaultValue: T): T;
}

declare module "@app:inertia" {
  export function view(
    page: string,
    data?: Record<string, any>
  ): any | Promise<any>;
}

declare module "@app:router" {
  export type Constructor = new (...args: any[]) => any;
  export type ControllerMethod<C extends Constructor> = Extract<
    {
      [K in keyof InstanceType<C>]: InstanceType<C>[K] extends (
        ...args: any[]
      ) => any
        ? K
        : never;
    }[keyof InstanceType<C>],
    string
  >;

  export const router: {
    name(name: string): typeof router;
    get<
      Controller extends Constructor,
      Method extends ControllerMethod<Controller>
    >(
      path: string,
      handler: [Controller, Method] | ((...args: any[]) => any | Promise<any>)
    ): typeof router;
  };
}

declare module "@app:orm" {
  export class Model {
    // ORM base model methods and properties
  }
}

declare module "@app:db" {
  export class Migration {}

  export const schema: {
    createTable(
      table: string,
      callback: (table: Record<string, any>) => void
    ): Promise<void>;
    dropTableIfExists(table: string): Promise<void>;
  };
}

declare module "@app:jobs" {
  export class Job {
    // Job base class methods and properties
  }
}

declare module "@app:mail" {
  export class Mailable {
    view(template: string, data?: Record<string, any>): any | Promise<any>;
  }
}
