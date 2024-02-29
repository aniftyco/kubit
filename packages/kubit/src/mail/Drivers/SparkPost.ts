import nodemailer from 'nodemailer';

import { LoggerContract } from '@ioc:Kubit/Logger';
import {
  MessageNode,
  SparkPostConfig,
  SparkPostDriverContract,
  SparkPostResponse,
  SparkPostRuntimeConfig,
} from '@ioc:Kubit/Mail';

import { SparkPostTransport } from '../Transports/SparkPost';

/**
 * Ses driver to send email using ses
 */
export class SparkPostDriver implements SparkPostDriverContract {
  constructor(
    private config: SparkPostConfig,
    private logger: LoggerContract
  ) {}

  /**
   * Send message
   */
  public async send(message: MessageNode, config?: SparkPostRuntimeConfig): Promise<SparkPostResponse> {
    const transporter = nodemailer.createTransport(
      new SparkPostTransport(
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
