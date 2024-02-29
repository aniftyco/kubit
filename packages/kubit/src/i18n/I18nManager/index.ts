/*
 * @kubit/i18n
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ApplicationContract } from '@ioc:Kubit/Application';
import { EmitterContract } from '@ioc:Kubit/Event';
import {
  FormatterExtendCallback,
  FsLoaderOptions,
  I18nConfig,
  I18nManagerContract,
  LoaderContract,
  LoaderExtendCallback,
  TranslationsFormatterContract,
} from '@ioc:Kubit/I18n';
import { LoggerContract } from '@ioc:Kubit/Logger';
import { Exception } from '@poppinss/utils';

import { IcuFormatter } from '../Formatters/Message/Icu';
import { prettyPrint } from '../Helpers';
import { I18n } from '../I18n';
import { FsLoader } from '../Loaders/Fs';
import { language } from '../Negotiator';

export class I18nManager implements I18nManagerContract {
  /**
   * A set of formatters added from outside in
   */
  private extendedFormatters: Map<string, FormatterExtendCallback> = new Map();

  /**
   * A set of loaders added from outside in
   */
  private extendedLoaders: Map<string, LoaderExtendCallback> = new Map();

  /**
   * Reference to the formatter used by the user application. We initialize
   * it lazily and then cache it.
   */
  private formatter: TranslationsFormatterContract;

  /**
   * Translations fetched using the registered loaders. We load
   * them when "loadTranslations" or "reloadTranslations"
   * is called.
   */
  private translations: { [lang: string]: Record<string, string> } = {};

  /**
   * Find if translations has been loaded atleast once or not
   */
  private loadedTranslations: boolean = false;

  /**
   * Reference to the default locale defined inside the config file
   */
  public defaultLocale = this.config.defaultLocale;

  /**
   * Pretty prints the missing translation message on the console
   */
  public prettyPrint = prettyPrint;

  /**
   * An array of supported locales inferred from the fallback locales
   * object + the translations directories.
   *
   * The array is only used when the config doesn't have an explicit
   * value.
   */
  private inferredLocales: string[] = [];

  constructor(
    public application: ApplicationContract,
    private emitter: EmitterContract,
    private logger: LoggerContract,
    public config: I18nConfig
  ) {
    this.validateConfig();
  }

  /**
   * Validate top level config values to be available when
   * instantiating the manager class
   */
  private validateConfig() {
    if (!this.config) {
      throw new Exception('Missing i18n config. Make sure define it inside "config/i18n.ts" file');
    }

    if (!this.config.loaders) {
      throw new Exception('Missing "loaders" config inside "config/i18n.ts" file');
    }

    if (!this.config.defaultLocale) {
      throw new Exception('Missing "defaultLocale" value inside "config/i18n.ts" file');
    }

    if (!this.config.translationsFormat) {
      throw new Exception('Missing "translationsFormat" value inside "config/i18n.ts" file');
    }
  }

  /**
   * Creates an instance of the extended formatter
   */
  private createExtendedFormatter(name: string) {
    if (!this.extendedFormatters.has(name)) {
      throw new Exception(`Invalid formatter "${name}"`, 500, 'E_INVALID_INTL_FORMATTER');
    }

    return this.extendedFormatters.get(name)!(this, this.config);
  }

  /**
   * Conditionally pushes to the inferred locales avoiding duplicates.
   *
   * Yes, we can use a set. However, we are trying to avoid converting the
   * set to an array during "getSupportedLocales" call. Since that method
   * is used more often than we push to an array.
   */
  private pushToInferredLocales(locale: string) {
    if (!this.inferredLocales.includes(locale)) {
      this.inferredLocales.push(locale);
    }
  }

  /**
   * Returns an instance of the Icu formatter
   */
  private createIcuFormatter() {
    return new IcuFormatter();
  }

  /**
   * Creates an instance of the translations formatter based upon whats
   * defined inside the user config
   */
  private getTranslationsFormatter(name: string): TranslationsFormatterContract {
    switch (name) {
      case 'icu':
        return this.createIcuFormatter();
      default:
        return this.createExtendedFormatter(name);
    }
  }

  /**
   * Creates an instance of the extended loader
   */
  private createExtendedLoader(name: string, config: any) {
    if (!this.extendedLoaders.has(name)) {
      throw new Exception(`Invalid loader "${name}"`, 500, 'E_INVALID_INTL_LOADER');
    }

    return this.extendedLoaders.get(name)!(this, config);
  }

  /**
   * Returns an instance of the FS loader
   */
  private createFsLoader(config: FsLoaderOptions) {
    return new FsLoader(config);
  }

  /**
   * Creates an instance of the translations loader based upon whats
   * defined inside the user config
   */
  private getLoader(name: string, config: any): LoaderContract {
    switch (name) {
      case 'fs':
        return this.createFsLoader(config);
      default:
        return this.createExtendedLoader(name, config);
    }
  }

  /**
   * An array of locales supported by the application
   */
  public supportedLocales() {
    return this.config.supportedLocales || this.inferredLocales;
  }

  /**
   * Load translations using the configured loaders
   */
  public async loadTranslations() {
    if (!this.loadedTranslations) {
      this.logger.trace('loading translations');
      await this.reloadTranslations();
    }
  }

  /**
   * Returns an object of all the loaded translations
   */
  public getTranslations() {
    return this.translations;
  }

  /**
   * Returns an object of translations for a given locale
   */
  public getTranslationsFor(locale: string) {
    return this.translations[locale] || {};
  }

  /**
   * Reload translations from the registered loaders
   */
  public async reloadTranslations() {
    const translationsStack = await Promise.all(
      Object.keys(this.config.loaders)
        .filter((loader) => {
          return this.config.loaders[loader]?.enabled;
        })
        .map((loader) => {
          this.logger.trace('loading translations from "%s" loader', loader);
          return this.getLoader(loader, this.config.loaders[loader]).load();
        })
    );

    /**
     * Set flag to true
     */
    this.loadedTranslations = true;

    /**
     * Empty the existing translations object
     */
    this.translations = {};

    /**
     * Reset to initialize state
     */
    if (!this.config.supportedLocales) {
      this.inferredLocales = [this.defaultLocale].concat(
        this.config.fallbackLocales ? Object.keys(this.config.fallbackLocales) : []
      );
    }

    /**
     * Shallow merge translations from all the loaders
     */
    translationsStack.forEach((translations) => {
      if (!translations) {
        return;
      }

      Object.keys(translations).forEach((lang) => {
        /**
         * Collect inferred locales when not defined explicitly
         */
        if (!this.config.supportedLocales) {
          this.pushToInferredLocales(lang);
        }

        /**
         * Initialize language with an empty object
         */
        if (!this.translations[lang]) {
          this.translations[lang] = {};
        }

        Object.assign(this.translations[lang], translations[lang]);
      });
    });
  }

  /**
   * Returns an instance of the translations formatter for the
   * active formatter
   */
  public getFormatter() {
    if (!this.formatter) {
      this.logger.trace('configuring formatter "%s"', this.config.translationsFormat);
      this.formatter = this.getTranslationsFormatter(this.config.translationsFormat);
    }

    return this.formatter;
  }

  /**
   * Negotiates the user language against the supported
   * locales and returns the best match or null if there
   * is no match.
   */
  public getSupportedLocale(userLanguage: string | string[]): string | null {
    return language(userLanguage, this.supportedLocales());
  }

  /**
   * Returns the fallback locale for a given locale. Returns the default
   * locale when no fallback is defined
   */
  public getFallbackLocale(locale: string): string {
    const fallbacks = this.config.fallbackLocales;
    return fallbacks ? fallbacks[locale] || this.defaultLocale : this.defaultLocale;
  }

  /**
   * Returns an instance of I18n for a given locale
   */
  public locale(locale: string) {
    return new I18n(locale, this.emitter, this.logger, this);
  }

  /**
   * Extend by adding custom formatters and loaders
   */
  public extend(name: string, type: 'loader', callback: LoaderExtendCallback): void;
  public extend(name: string, type: 'formatter', callback: FormatterExtendCallback): void;
  public extend(
    name: string,
    type: 'loader' | 'formatter',
    callback: FormatterExtendCallback | LoaderExtendCallback
  ): void {
    this.logger.trace('extending i18n by adding "%s" %s', name, type);

    if (type === 'loader') {
      this.extendedLoaders.set(name, callback as LoaderExtendCallback);
    } else {
      this.extendedFormatters.set(name, callback as FormatterExtendCallback);
    }
  }
}
