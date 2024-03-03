import { HashDrivers } from '@ioc:Kubit/Hash';

/**
 * Expected shape of the config accepted by the "hashConfig"
 * method
 */
export type HashConfig = {
  default: keyof HashConfig['list'];
  list: {
    [name: string]: {
      [K in keyof HashDrivers]: HashDrivers[K]['config'] & { driver: K };
    }[keyof HashDrivers];
  };
};

/**
 * Pull hashers list from the config defined inside the "config/hash.ts"
 * file
 */
export type InferListFromConfig<T extends HashConfig> = {
  [K in keyof T['list']]: HashDrivers[T['list'][K]['driver']];
};
