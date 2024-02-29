import { tmpdir } from 'os';
import { isAbsolute, join } from 'path';

import coBody from '@poppinss/co-body';
import { Exception } from '@poppinss/utils';
import { cuid } from '@poppinss/utils/build/helpers';

import { inject } from '../../application';
import { Multipart } from '../Multipart';
import { streamFile } from '../Multipart/streamFile';

import type { ConfigContract } from '@ioc:Kubit/Config';
import type { DriveManagerContract } from '@ioc:Kubit/Drive';
import type { BodyParserConfig } from '@ioc:Kubit/BodyParser';
import type { HttpContextContract } from '@ioc:Kubit/HttpContext';

/**
 * BodyParser middleware parses the incoming request body and set it as
 * request body to be read later in the request lifecycle.
 */
@inject(['Kubit/Config', 'Kubit/Drive'])
export class BodyParserMiddleware {
  /**
   * Bodyparser config
   */
  private config: BodyParserConfig;

  constructor(
    Config: ConfigContract,
    private drive: DriveManagerContract
  ) {
    this.config = Config.get('bodyparser', {});
  }

  /**
   * Returns config for a given type
   */
  private getConfigFor<K extends keyof BodyParserConfig>(type: K): BodyParserConfig[K] {
    const config = this.config[type];
    config['returnRawBody'] = true;
    return config;
  }

  /**
   * Ensures that types exists and have length
   */
  private ensureTypes(types: string[]): boolean {
    return !!(types && types.length);
  }

  /**
   * Returns a boolean telling if request `content-type` header
   * matches the expected types or not
   */
  private isType(request: HttpContextContract['request'], types: string[]): boolean {
    return !!(this.ensureTypes(types) && request.is(types));
  }

  /**
   * Returns a proper Adonis style exception for popular error codes
   * returned by https://github.com/stream-utils/raw-body#readme.
   */
  private getExceptionFor(error: { type: string; status: number; message: string }) {
    switch (error.type) {
      case 'encoding.unsupported':
        return new Exception(error.message, error.status, 'E_ENCODING_UNSUPPORTED');
      case 'entity.too.large':
        return new Exception(error.message, error.status, 'E_REQUEST_ENTITY_TOO_LARGE');
      case 'request.aborted':
        return new Exception(error.message, error.status, 'E_REQUEST_ABORTED');
      default:
        return error;
    }
  }

  /**
   * Returns the tmp path for storing the files temporarly
   */
  private getTmpPath(config: BodyParserConfig['multipart']) {
    if (typeof config.tmpFileName === 'function') {
      const tmpPath = config.tmpFileName();
      return isAbsolute(tmpPath) ? tmpPath : join(tmpdir(), tmpPath);
    }

    return join(tmpdir(), cuid());
  }

  /**
   * Handle HTTP request body by parsing it as per the user
   * config
   */
  public async handle(ctx: any, next: () => Promise<void>): Promise<void> {
    /**
     * Initiating the `__raw_files` private property as an object
     */
    ctx.request['__raw_files'] = {};
    const requestMethod = ctx.request.method();

    /**
     * Only process for whitelisted nodes
     */
    if (!this.config.whitelistedMethods.includes(requestMethod)) {
      ctx.logger.trace(`bodyparser skipping method ${requestMethod}`);
      return next();
    }

    /**
     * Return early when request body is empty. Many clients set the `Content-length = 0`
     * when request doesn't have any body, which is not handled by the below method.
     *
     * The main point of `hasBody` is to early return requests with empty body created by
     * clients with missing headers.
     */
    if (!ctx.request.hasBody()) {
      ctx.logger.trace('bodyparser skipping empty body');
      return next();
    }

    /**
     * Handle multipart form
     */
    const multipartConfig = this.getConfigFor('multipart');

    if (this.isType(ctx.request, multipartConfig.types)) {
      ctx.logger.trace('bodyparser parsing as multipart body');

      ctx.request.multipart = new Multipart(
        ctx,
        {
          maxFields: multipartConfig.maxFields,
          limit: multipartConfig.limit,
          fieldsLimit: multipartConfig.fieldsLimit,
          convertEmptyStringsToNull: multipartConfig.convertEmptyStringsToNull,
        },
        this.drive
      );

      /**
       * Skip parsing when `autoProcess` is disabled or route matches one
       * of the defined processManually route patterns.
       */
      if (!multipartConfig.autoProcess || multipartConfig.processManually.indexOf(ctx.route!.pattern) > -1) {
        return next();
      }

      /**
       * Make sure we are not running any validations on the uploaded files. They are
       * deferred for the end user when they will access file using `request.file`
       * method.
       */
      ctx.request.multipart.onFile('*', { deferValidations: true }, async (part, reporter) => {
        /**
         * We need to abort the main request when we are unable to process any
         * file. Otherwise the error will endup on the file object, which
         * is incorrect.
         */
        try {
          const tmpPath = this.getTmpPath(multipartConfig);
          await streamFile(part, tmpPath, reporter);
          return { tmpPath };
        } catch (error) {
          ctx.request.multipart.abort(error);
        }
      });

      const action = ctx.profiler.profile('bodyparser:multipart');

      try {
        await ctx.request.multipart.process();
        action.end();
        return next();
      } catch (error) {
        action.end({ error });
        throw error;
      }
    }

    /**
     * Handle url-encoded form data
     */
    const formConfig = this.getConfigFor('form');
    if (this.isType(ctx.request, formConfig.types)) {
      ctx.logger.trace('bodyparser parsing as form request');
      const action = ctx.profiler.profile('bodyparser:urlencoded');

      try {
        const { parsed, raw } = await coBody.form(ctx.request.request, formConfig);
        ctx.request.setInitialBody(parsed);
        ctx.request.updateRawBody(raw);
        action.end();
        return next();
      } catch (error) {
        action.end({ error });
        throw this.getExceptionFor(error);
      }
    }

    /**
     * Handle content with JSON types
     */
    const jsonConfig = this.getConfigFor('json');
    if (this.isType(ctx.request, jsonConfig.types)) {
      ctx.logger.trace('bodyparser parsing as json body');
      const action = ctx.profiler.profile('bodyparser:json');

      try {
        const { parsed, raw } = await coBody.json(ctx.request.request, jsonConfig);
        ctx.request.setInitialBody(parsed);
        ctx.request.updateRawBody(raw);
        action.end();
        return next();
      } catch (error) {
        action.end({ error });
        throw this.getExceptionFor(error);
      }
    }

    /**
     * Handles raw request body
     */
    const rawConfig = this.getConfigFor('raw');
    if (this.isType(ctx.request, rawConfig.types)) {
      ctx.logger.trace('bodyparser parsing as raw body');
      const action = ctx.profiler.profile('bodyparser:raw');

      try {
        const { raw } = await coBody.text(ctx.request.request, rawConfig);
        ctx.request.setInitialBody({});
        ctx.request.updateRawBody(raw);
        action.end();
        return next();
      } catch (error) {
        action.end({ error });
        throw this.getExceptionFor(error);
      }
    }

    await next();
  }
}
