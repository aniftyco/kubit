declare module 'kubit:mail' {
  export class Mailable {
    view(template: string, data?: Record<string, any>): any | Promise<any>;
  }
}
