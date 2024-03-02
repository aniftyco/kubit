import { ApplicationContract } from '@ioc:Kubit/Application';
import { DisksList, DriveConfig } from '@ioc:Kubit/Drive';

/**
 * Registers drive with the IoC container
 */
export default class DriveProvider {
  constructor(protected app: ApplicationContract) {}

  /**
   * Register drive with the container
   */
  protected registerDrive() {
    this.app.container.singleton('Kubit/Drive', () => {
      const { DriveManager } = require('./DriveManager');
      const Router = this.app.container.resolveBinding('Kubit/Route');
      const Config = this.app.container.resolveBinding('Kubit/Config');
      const Logger = this.app.container.resolveBinding('Kubit/Logger');

      return new DriveManager(this.app, Router, Logger, Config.get('drive'));
    });
  }

  /**
   * Register routes for disks using "local" driver.
   */
  protected defineDriveRoutes() {
    this.app.container.withBindings(['Kubit/Config', 'Kubit/Route', 'Kubit/Logger'], (Config, Router, Logger) => {
      /**
       * Do not attempt to resolve Drive from the container when there is
       * no configuration in place.
       *
       * This is a make shift arrangement. Later, we will have a universal
       * approach to disabling modules
       */
      const driveConfig: DriveConfig = Config.get('drive');
      if (!driveConfig) {
        return;
      }

      const Drive = this.app.container.resolveBinding('Kubit/Drive');
      const { LocalFileServer } = require('./LocalFileServer');

      Object.keys(driveConfig.disks).forEach((diskName: keyof DisksList) => {
        const diskConfig = driveConfig.disks[diskName];
        if ((diskConfig as any).driver === 'local' && (diskConfig as any).serveFiles) {
          new LocalFileServer(diskName, diskConfig, Drive.use(diskName), Router, Logger).registerRoute();
        }
      });
    });
  }

  /**
   * Registering all required bindings to the container
   */
  public register() {
    this.registerDrive();
  }

  /**
   * Register drive routes
   */
  public boot() {
    this.defineDriveRoutes();
  }
}
