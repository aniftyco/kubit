import { ApplicationContract } from '@ioc:Adonis/Core/Application';

interface AttachmentConfig {}

export const attachmentConfig = (config: AttachmentConfig): AttachmentConfig => config;

export default class AttachmentProvider {
  public static needsApplication = true;

  constructor(protected app: ApplicationContract) {}

  public register() {
    this.app.container.singleton('Kubit/Attachment', () => {
      return null;
    });
  }
}
