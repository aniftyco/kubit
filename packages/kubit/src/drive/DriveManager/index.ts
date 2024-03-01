import { ApplicationContract } from '@ioc:Kubit/Application';
import {
  DirectoryListingContract,
  DisksList,
  DriveConfig,
  DriveFileStats,
  DriveListItem,
  DriverContract,
  FakeImplementationCallback,
  LocalDriverConfig,
  Visibility,
} from '@ioc:Kubit/Drive';
import { LoggerContract } from '@ioc:Kubit/Logger';
import { RouterContract } from '@ioc:Kubit/Route';
import { Manager } from '@poppinss/manager';
import { Exception, ManagerConfigValidator } from '@poppinss/utils';

import { FakeDrive } from '../Fake';

/**
 * Drive manager exposes the API to resolve disks and extend by
 * adding custom drivers
 */
export class DriveManager extends Manager<
  ApplicationContract,
  DriverContract,
  DriverContract,
  { [P in keyof DisksList]: DisksList[P]['implementation'] }
> {
  /**
   * Find if drive is ready to be used
   */
  private isReady: boolean = false;

  /**
   * The fake callback
   */
  private fakeCallback: FakeImplementationCallback = (_, disk, config) => {
    const { FakeDriver } = require('../Drivers/Fake');
    return new FakeDriver(disk, config, this.router);
  };

  /**
   * Reference to the fake drive
   */
  private fakeDrive = new FakeDrive();

  /**
   * Cache all disks instances
   */
  protected singleton = true;

  /**
   * Reference to registered fakes
   */
  public fakes = this.fakeDrive.fakes;

  constructor(
    public application: ApplicationContract,
    public router: RouterContract,
    private logger: LoggerContract,
    private config: DriveConfig
  ) {
    super(application);
    this.validateConfig();
  }

  /**
   * Validate config
   */
  private validateConfig() {
    if (!this.config) {
      return;
    }

    const validator = new ManagerConfigValidator(this.config, 'drive', 'config/drive');
    validator.validateDefault('disk');
    validator.validateList('disks', 'disk');

    this.isReady = true;
  }

  /**
   * Returns the default mapping name
   */
  protected getDefaultMappingName() {
    return this.config.disk;
  }

  /**
   * Returns config for a given mapping
   */
  protected getMappingConfig(diskName: keyof DisksList) {
    return this.config.disks[diskName] as any;
  }

  /**
   * Returns the name of the drive used by a given mapping
   */
  protected getMappingDriver(diskName: keyof DisksList): string | undefined {
    return this.getMappingConfig(diskName)?.driver;
  }

  /**
   * Make instance of the local driver
   */
  protected createLocal(diskName: keyof DisksList, config: LocalDriverConfig) {
    const { LocalDriver } = require('../Drivers/Local');
    return new LocalDriver(diskName, config, this.router);
  }

  /**
   * Fake default or a named disk
   */
  public fake(disks?: keyof DisksList | keyof DisksList[]) {
    disks = disks || this.getDefaultMappingName();
    const disksToFake = Array.isArray(disks) ? disks : [disks];

    disksToFake.forEach((disk) => {
      if (!this.fakeDrive.isFaked(disk as never)) {
        this.logger.trace({ disk: disk }, 'drive faking disk');
        this.fakeDrive.fakes.set(
          disk as never,
          this.fakeCallback(this as any, disk as never, this.getMappingConfig(disk as never))
        );
      }
    });

    return this.fakeDrive;
  }

  /**
   * Restore the fake for the default or a named disk
   */
  public restore(disks?: keyof DisksList | keyof DisksList[]) {
    disks = disks || this.getDefaultMappingName();
    const disksToRestore = Array.isArray(disks) ? disks : [disks];

    disksToRestore.forEach((disk) => {
      if (this.fakeDrive.isFaked(disk as never)) {
        this.logger.trace({ disk: disk }, 'drive restoring disk fake');
        this.fakeDrive.restore(disk as never);
      }
    });
  }

  /**
   * Restore all fakes1
   */
  public restoreAll() {
    (this.fakeDrive.fakes as any) = new Map();
  }

  /**
   * Resolve instance for a disk
   */
  public use(disk?: keyof DisksList): never {
    if (!this.isReady) {
      throw new Exception(
        'Missing configuration for drive. Visit https://bit.ly/2WnR5j9 for setup instructions',
        500,
        'E_MISSING_DRIVE_CONFIG'
      );
    }

    disk = disk || this.getDefaultMappingName();
    if (this.fakeDrive.isFaked(disk)) {
      return this.fakeDrive.use(disk) as never;
    }

    return super.use(disk);
  }

  /**
   * Register a custom fake implementation
   */
  public setFakeImplementation(callback: FakeImplementationCallback) {
    this.fakeCallback = callback;
  }

  /**
   * Returns the file contents as a buffer. The buffer return
   * value allows you to self choose the encoding when
   * converting the buffer to a string.
   */
  public async get(location: string, ...args: any[]): Promise<Buffer> {
    return (this.use() as any).get(location, ...args);
  }

  /**
   * Returns the file contents as a stream
   */
  public async getStream(location: string, ...args: any[]): Promise<NodeJS.ReadableStream> {
    return (this.use() as any).getStream(location, ...args);
  }

  /**
   * A boolean to find if the location path exists or not
   */
  public exists(location: string, ...args: any[]): Promise<boolean> {
    return (this.use() as any).exists(location, ...args);
  }

  /**
   * Returns the location path visibility
   */
  public async getVisibility(location: string, ...args: any[]): Promise<Visibility> {
    return (this.use() as any).getVisibility(location, ...args);
  }

  /**
   * Returns the location path stats
   */
  public async getStats(location: string, ...args: any[]): Promise<DriveFileStats> {
    return (this.use() as any).getStats(location, ...args);
  }

  /**
   * Returns a signed URL for a given location path
   */
  public getSignedUrl(location: string, ...args: any[]): Promise<string> {
    return (this.use() as any).getSignedUrl(location, ...args);
  }

  /**
   * Returns a URL for a given location path
   */
  public getUrl(location: string, ...args: any[]): Promise<string> {
    return (this.use() as any).getUrl(location, ...args);
  }

  /**
   * Write string|buffer contents to a destination. The missing
   * intermediate directories will be created (if required).
   */
  public put(location: string, ...args: any[]): Promise<void> {
    return (this.use() as any).put(location, ...args);
  }

  /**
   * Write a stream to a destination. The missing intermediate
   * directories will be created (if required).
   */
  public putStream(location: string, ...args: any[]): Promise<void> {
    return (this.use() as any).putStream(location, ...args);
  }

  /**
   * Not supported
   */
  public setVisibility(location: string, ...args: any[]): Promise<void> {
    return (this.use() as any).setVisibility(location, ...args);
  }

  /**
   * Remove a given location path
   */
  public delete(location: string, ...args: any[]): Promise<void> {
    return (this.use() as any).delete(location, ...args);
  }

  /**
   * Copy a given location path from the source to the desination.
   * The missing intermediate directories will be created (if required)
   */
  public copy(source: string, ...args: any[]): Promise<void> {
    return (this.use() as any).copy(source, ...args);
  }

  /**
   * Move a given location path from the source to the desination.
   * The missing intermediate directories will be created (if required)
   */
  public move(source: string, ...args: any[]): Promise<void> {
    return (this.use() as any).move(source, ...args);
  }

  /**
   * Return a listing directory iterator for given location.
   */
  public list(location: string): DirectoryListingContract<DriverContract, DriveListItem> {
    const driver = this.use() as any;

    if (typeof driver.list !== 'function') {
      throw new Exception(`List is not supported by the "${driver.name}" driver.`, 500, 'E_LIST_NOT_SUPPORTED');
    }

    return driver.list(location);
  }
}
