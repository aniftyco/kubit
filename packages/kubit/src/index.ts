export { BaseCommand } from './ace/BaseCommand';
export { Ignitor, listDirectoryFiles } from './core';
export { defineConfig } from './config';

export { AuthenticationException } from './auth';

export { DriveConfig, InferDisksFromConfig } from './drive/config';
export { HashConfig, InferListFromConfig } from './hash/config';
export { MailConfig, InferMailersFromConfig } from './mail/config';
export { RedisConfig, InferConnectionsFromConfig } from './redis/config';

export interface ServiceProvider {
  register(): void;
  boot?(): Promise<void>;
  ready?(): Promise<void>;
  shutdown?(): Promise<void>;
}
