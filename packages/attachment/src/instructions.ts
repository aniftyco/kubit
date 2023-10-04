import { join } from 'path';

import * as sinkStatic from '@adonisjs/sink';
import { ApplicationContract } from '@ioc:Adonis/Core/Application';

function getStub(...relativePaths: string[]) {
  return join(__dirname, '../templates', ...relativePaths);
}

const configFilename = 'attachement.ts';

export default async function instructions(projectRoot: string, app: ApplicationContract, sink: typeof sinkStatic) {
  const configPath = app.configPath(configFilename);
  const configDir = app.directoriesMap.get('config') || 'config';
  const attachementConfig = new sink.files.MustacheFile(projectRoot, configPath, getStub('config.txt'));

  attachementConfig.overwrite = true;
  attachementConfig.commit();

  sink.logger.action('create').succeeded(`${configDir}/${configFilename}`);
}
