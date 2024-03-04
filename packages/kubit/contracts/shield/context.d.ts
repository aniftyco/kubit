declare module '@ioc:Kubit/Response' {
  interface ResponseContract {
    readonly nonce: string;
  }
}

declare module '@ioc:Kubit/Request' {
  interface RequestContract {
    csrfToken: string;
  }
}
