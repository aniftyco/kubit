import { LoggerContract } from '@ioc:Kubit/Logger';

/**
 * Custom knex logger that uses Kubit logger under the
 * hood.
 */
export class Logger {
  public warn = function (message: any) {
    this.logger.warn(message);
  }.bind(this);

  public error = function (message: any) {
    this.logger.error(message);
  }.bind(this);

  public deprecate = function (message: any) {
    this.logger.info(message);
  }.bind(this);

  public debug = function (message: any) {
    this.warn('"debug" property inside config is depreciated. We recommend using "db:query" event for enrich logging');
    this.logger.debug(message);
  }.bind(this);

  constructor(
    public name: string,
    public logger: LoggerContract
  ) {}
}
