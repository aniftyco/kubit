/*
 * @kubit/mail
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import nodemailer from 'nodemailer';

import { LoggerContract } from '@ioc:Kubit/Logger';
import {
  MailgunConfig,
  MailgunDriverContract,
  MailgunResponse,
  MailgunRuntimeConfig,
  MessageNode,
} from '@ioc:Kubit/Mail';

import { MailgunTransport } from '../Transports/Mailgun';

/**
 * Ses driver to send email using ses
 */
export class MailgunDriver implements MailgunDriverContract {
  constructor(
    private config: MailgunConfig,
    private logger: LoggerContract
  ) {}

  /**
   * Send message
   */
  public async send(message: MessageNode, config?: MailgunRuntimeConfig): Promise<MailgunResponse> {
    const transporter = nodemailer.createTransport(
      new MailgunTransport(
        {
          ...this.config,
          ...config,
        },
        this.logger
      )
    );

    return transporter.sendMail(message);
  }

  public async close() {}
}
