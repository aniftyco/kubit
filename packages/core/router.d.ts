declare module "kubit:router" {
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

