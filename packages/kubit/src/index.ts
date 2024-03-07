export { BaseCommand as Command } from './console/BaseCommand';
export { Ignitor, listDirectoryFiles } from './core';
export { defineConfig } from './config';

export { AuthenticationException } from './auth';

export { InferDisksFromConfig } from './drive/config';
export { InferListFromConfig } from './hash/config';
export { InferMailersFromConfig } from './mail/config';
export { InferConnectionsFromConfig } from './redis/config';

export interface ServiceProvider {
  register(): void;
  boot?(): Promise<void>;
  ready?(): Promise<void>;
  shutdown?(): Promise<void>;
}
