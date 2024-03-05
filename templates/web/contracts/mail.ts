import { InferMailersFromConfig } from 'kubit';

declare module '@ioc:Kubit/Mail' {
  interface MailersList extends InferMailersFromConfig<typeof import('../config/mail').default> {}
}
