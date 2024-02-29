import accepts from 'accepts';

/**
 * Negotiations for the supported language
 */
export function language<T extends string>(userLanguage: string | string[], supportLanguages: T[]): T | null {
  return (
    accepts({
      headers: {
        'accept-language': Array.isArray(userLanguage) ? userLanguage.join(',') : userLanguage,
      },
    }).language(supportLanguages) || null
  );
}
