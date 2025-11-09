declare module 'react' {
  interface FC<P = {}> {
    (props: P): any;
  }
}

declare module 'datetime' {
  export type DateTime = Date;
}
