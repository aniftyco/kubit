import { MissingTranslationEventData } from '@ioc:Kubit/I18n';

/**
 * Pretty prints the missing translation message on the console
 */
export function prettyPrint(data: MissingTranslationEventData) {
  const { Colors } = require('@poppinss/colors');
  const colors = new Colors();

  const name = `[ ${colors.yellow('i18n')} ] `;
  const highlightedText = `${colors.dim(`${data.locale}, ${data.identifier}`)}`;

  console.log(`${name} translation missing: ${highlightedText}`);
}
