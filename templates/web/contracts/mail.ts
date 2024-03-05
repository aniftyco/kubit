import { InferMailersFromConfig } from 'kubit';

import mailConfig from '../config/mail';

declare module '@ioc:Kubit/Mail' {
  interface MailersList extends InferMailersFromConfig<typeof mailConfig> {}
}
