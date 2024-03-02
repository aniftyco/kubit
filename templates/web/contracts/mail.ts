/**
 * Contract source: https://git.io/JvgAT
 *
 * Feel free to let us know via PR, if you find something broken in this contract
 * file.
 */

import { InferMailersFromConfig } from 'kubit';

import mailConfig from '../config/mail';

declare module '@ioc:Kubit/Mail' {
  interface MailersList extends InferMailersFromConfig<typeof mailConfig> {}
}
