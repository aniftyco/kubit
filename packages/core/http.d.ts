declare module 'kubit:server' {
  export type HttpContext = {
    request: Record<'method' | 'url', string>;
    response: Record<'status' | 'body', any>;
  };
}
