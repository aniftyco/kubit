import {
  CompiledMailNode,
  DriverOptionsType,
  MailerContract,
  MailerResponseType,
  MailersList,
  MessageComposeCallback,
} from '@ioc:Kubit/Mail';

import { Message } from '../Message';
import { MailManager } from './MailManager';

/**
 * Mailer exposes the unified API to send emails using one of the pre-configure
 * driver
 */
export class Mailer<Name extends keyof MailersList> implements MailerContract<Name> {
  private driverOptions?: DriverOptionsType<MailersList[Name]['implementation']>;

  constructor(
    public name: Name,
    private manager: MailManager,
    private useQueue: boolean,
    public driver: MailersList[Name]['implementation']
  ) {}

  /**
   * Ensure "../view" is installed
   */
  private ensureView(methodName: string) {
    if (!this.manager.view) {
      throw new Error(`"../view" must be installed before using "message.${methodName}"`);
    }
  }

  /**
   * Set the email contents by rendering the views. Views are only
   * rendered when inline values are not defined.
   */
  private async setEmailContent({ message, views }: CompiledMailNode) {
    if (!message.html && views.html) {
      this.ensureView('htmlView');
      message.html = await this.manager.view!.render(views.html.template, views.html.data);
    }

    if (!message.text && views.text) {
      this.ensureView('textView');
      message.text = await this.manager.view!.render(views.text.template, views.text.data);
    }

    if (!message.watch && views.watch) {
      this.ensureView('watchView');
      message.watch = await this.manager.view!.render(views.watch.template, views.watch.data);
    }
  }

  /**
   * Define options to be forwarded to the underlying driver
   */
  public options(options: DriverOptionsType<MailersList[Name]['implementation']>): this {
    this.driverOptions = options;
    return this;
  }

  /**
   * Sends email using a pre-compiled message. You should use [[MailerContract.send]], unless
   * you are pre-compiling messages yourself
   */
  public async sendCompiled(mail: CompiledMailNode) {
    /**
     * Set content by rendering views
     */
    await this.setEmailContent(mail);

    /**
     * Send email for real
     */
    const response = await this.driver.send(mail.message, mail.config);

    /**
     * Emit event
     */
    this.manager.emitter.emit('mail:sent', {
      message: mail.message,
      views: Object.keys(mail.views).map((view) => mail.views[view].template),
      mailer: mail.mailer,
      response: response,
    });

    return response as unknown as Promise<MailerResponseType<Name>>;
  }

  /**
   * Sends email
   */
  public async send(callback: MessageComposeCallback, config?: DriverOptionsType<MailersList[Name]>) {
    const message = new Message(false);
    await callback(message);

    const compiledMessage = message.toJSON();
    return this.sendCompiled({
      message: compiledMessage.message,
      views: compiledMessage.views,
      mailer: this.name,
      config: config || this.driverOptions,
    });
  }

  /**
   * Send email later by queuing it inside an in-memory queue
   */
  public async sendLater(callback: MessageComposeCallback, config?: DriverOptionsType<MailersList[Name]>) {
    if (!this.useQueue) {
      await this.send(callback, config);
      return;
    }

    const message = new Message(true);
    await callback(message);

    const compiledMessage = message.toJSON();
    return this.manager.scheduleEmail({
      message: compiledMessage.message,
      views: compiledMessage.views,
      mailer: this.name,
      config: config || this.driverOptions,
    });
  }

  /**
   * Invokes `close` method on the driver
   */
  public async close() {
    await this.driver.close();
    this.manager.release(this.name);
  }
}
