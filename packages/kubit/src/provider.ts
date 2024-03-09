import { resolve } from 'path';

/**
 * The application provider that sticks all core components
 * to the container.
 */
export default class KubitProvider {
  /**
   * Load all component providers
   */
  public provides = [
    resolve(__dirname, './core/provider'),
    resolve(__dirname, './cache/provider'),
    resolve(__dirname, './encryption/provider'),
    resolve(__dirname, './events/provider'),
    resolve(__dirname, './drive/provider'),
    resolve(__dirname, './hash/provider'),
    resolve(__dirname, './http-server/provider'),
    resolve(__dirname, './bodyparser/provider'),
    resolve(__dirname, './validator/provider'),
    resolve(__dirname, './view/provider'),
    resolve(__dirname, './database/provider'),
    resolve(__dirname, './orm/provider'),
    resolve(__dirname, './auth/provider'),
    resolve(__dirname, './mail/provider'),
    resolve(__dirname, './queue/provider'),
    resolve(__dirname, './redis/provider'),
    resolve(__dirname, './scheduler/provider'),
    resolve(__dirname, './security/provider'),
    resolve(__dirname, './session/provider'),
    resolve(__dirname, './test/provider'),
  ];
}
