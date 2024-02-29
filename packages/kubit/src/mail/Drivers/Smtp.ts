/*
 * @kubit/mail
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import nodemailer from 'nodemailer';

import { MessageNode, SmtpConfig, SmtpDriverContract, SmtpMailResponse } from '@ioc:Kubit/Mail';

/**
 * Smtp driver to send email using smtp
 */
export class SmtpDriver implements SmtpDriverContract {
  private transporter: any;

  constructor(config: SmtpConfig) {
    this.transporter = nodemailer.createTransport(config);
  }

  /**
   * Send message
   */
  public async send(message: MessageNode): Promise<SmtpMailResponse> {
    if (!this.transporter) {
      throw new Error('Driver transport has been closed and cannot be used for sending emails');
    }

    return this.transporter.sendMail(message);
  }

  /**
   * Close transporter connection, helpful when using connections pool
   */
  public async close() {
    this.transporter.close();
    this.transporter = null;
  }
}
