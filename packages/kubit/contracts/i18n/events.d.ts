declare module '@ioc:Kubit/Event' {
  import { MissingTranslationEventData } from '@ioc:Kubit/I18n';

  export interface EventsList {
    'i18n:missing:translation': MissingTranslationEventData;
  }
}
