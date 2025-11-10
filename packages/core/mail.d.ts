declare module 'kubit:mail' {
  import { Job, PublicProperties } from 'kubit:queue';

  // Mailables are just queueable jobs with mail-specific methods
  export class Mailable extends Job {
    public static send<T extends Mailable>(this: new () => T, props?: PublicProperties<T>): Promise<void>;
    subject(subject: string): this;
    to(email: string, name?: string): this;
    view(template: string, data?: Record<string, any>): this;
    handle(): Promise<any>;
  }
}
