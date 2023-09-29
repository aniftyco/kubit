import { join } from 'path';

import * as sinkStatic from '@adonisjs/sink';
import { ApplicationContract } from '@ioc:Adonis/Core/Application';

function getStub(...relativePaths: string[]) {
  return join(__dirname, '../templates', ...relativePaths);
}

export default async function instructions(projectRoot: string, app: ApplicationContract, sink: typeof sinkStatic) {
  const configPath = app.configPath('sentry.ts');
  const configDir = app.directoriesMap.get('config') || 'config';
  const sentryConfig = new sink.files.MustacheFile(projectRoot, configPath, getStub('config.txt'));

  sentryConfig.overwrite = true;
  sentryConfig.commit();

  sink.logger.action('create').succeeded(`${configDir}/sentry.ts`);
}
