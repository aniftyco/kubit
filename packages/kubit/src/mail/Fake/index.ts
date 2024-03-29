import { FakeMailManagerContract, MailerContract, MailersList, MessageNode, MessageSearchNode } from '@ioc:Kubit/Mail';

export class FakeMailManager implements FakeMailManagerContract {
  public fakedMailers: Map<string, MailerContract<never>> = new Map();

  /**
   * Returns the faked mailer instance
   */
  public use(mailer: keyof MailersList) {
    return this.fakedMailers.get(mailer)!;
  }

  /**
   * Restore mailer fake
   */
  public restore(mailer: keyof MailersList) {
    const mailerInstance = this.fakedMailers.get(mailer);
    if (mailerInstance) {
      mailerInstance.close();
      this.fakedMailers.delete(mailer);
    }
  }

  /**
   * Find if a mailer is faked
   */
  public isFaked(mailer: keyof MailersList): boolean {
    return this.fakedMailers.has(mailer);
  }

  /**
   * Find if an email exists
   */
  public exists(messageOrCallback: MessageSearchNode | ((mail: MessageSearchNode) => boolean)): boolean {
    return !!this.find(messageOrCallback);
  }

  /**
   * Find an email
   */
  public find(messageOrCallback: MessageSearchNode | ((mail: MessageSearchNode) => boolean)): MessageSearchNode | null {
    for (let [, mailer] of this.fakedMailers) {
      const message = (mailer.driver as any).find(messageOrCallback);
      if (message) {
        return message;
      }
    }

    return null;
  }

  /**
   * Filter emails
   */
  public filter(messageOrCallback: MessageSearchNode | ((mail: MessageSearchNode) => boolean)): MessageNode[] {
    let messages: MessageNode[] = [];
    for (let [, mailer] of this.fakedMailers) {
      messages = messages.concat((mailer.driver as any).filter(messageOrCallback));
    }

    return messages;
  }
}
