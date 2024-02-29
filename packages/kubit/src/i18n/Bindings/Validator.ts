import type { validator } from '@ioc:Kubit/Validator';
import type { I18nManagerContract } from '@ioc:Kubit/I18n';

/**
 * Registers a hook to deliver default messages to the validator.
 */
export function validatorBindings(Validator: typeof validator, I18n: I18nManagerContract) {
  Validator.messages((ctx) => {
    if (ctx && 'i18n' in ctx === true) {
      return ctx.i18n.validatorMessages();
    }

    return I18n.locale(I18n.defaultLocale).validatorMessages();
  });
}
