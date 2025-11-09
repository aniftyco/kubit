declare module "kubit:hash" {
  export const hash: {
    (value: string): Promise<string>;
  };
}
