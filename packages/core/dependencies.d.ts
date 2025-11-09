declare module "react" {
  interface FC<P = {}> {
    (props: P): any;
  }
}
