import { ApplicationContract } from '@ioc:Kubit/Application';
import { esmResolver } from '@poppinss/utils';

import { ServiceProvider } from '../index';

/**
 * Provider to register validator with the IoC container
 */
export default class ValidationProvider implements ServiceProvider {
  constructor(protected app: ApplicationContract) {}
  public static needsApplication = true;

  /**
   * Configures validator with the user defined options. We need to
   * resolve the imported reporter (when defined)
   */
  private async configureValidator() {
    const Config = this.app.container.resolveBinding('Kubit/Config');
    const { validator } = this.app.container.resolveBinding('Kubit/Validator');

    /**
     * Resolve reporter when defined
     */
    const validatorConfig = Object.assign({}, Config.get('app.validator'));
    if (validatorConfig.reporter) {
      validatorConfig.reporter = esmResolver(await validatorConfig.reporter());
    }

    validator.configure(validatorConfig);
    return validator;
  }

  /**
   * Register validator
   */
  public register() {
    this.app.container.singleton('Kubit/Validator', () => {
      const { validator } = require('./Validator');
      return {
        ValidationException: require('./ValidationException').ValidationException,
        validator: validator,
        schema: require('./Schema').schema,
        rules: require('./Rules').rules,
      };
    });
  }

  public async boot() {
    const validator = await this.configureValidator();
    this.app.container.withBindings(['Kubit/Request'], (Request) => {
      require('./Bindings/Request').default(Request, validator.validate, validator.config);
    });
  }
}
