import { DriversList } from '@ioc:Kubit/Drive';

/**
 * Expected shape of the config accepted by the "driveConfig"
 * method
 */
export type DriveConfig = {
  disk: keyof DriveConfig['disks'];
  disks: {
    [name: string]: {
      [K in keyof DriversList]: DriversList[K]['config'] & { driver: K };
    }[keyof DriversList];
  };
};

/**
 * Pull disks from the config defined inside the "config/drive.ts"
 * file
 */
export type InferDisksFromConfig<T extends DriveConfig> = {
  [K in keyof T['disks']]: DriversList[T['disks'][K]['driver']];
};
