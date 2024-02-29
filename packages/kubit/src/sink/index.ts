export {
  table,
  logger,
  sticker,
  instructions,
  isInteractive,
  supportsColors,
  testingRenderer,
  tasks as tasksUi,
} from '@poppinss/cliui';
import './disableLogger';

import { PromptContract } from '@poppinss/prompts';

/**
 * Returns a new instance of prompt. Also we lazy load the prompts
 */
function getPrompt(): PromptContract {
  const { Prompt, FakePrompt } = require('@poppinss/prompts');
  return process.env.CLI_UI_IS_TESTING ? new FakePrompt() : new Prompt();
}

/**
 * Sharing the sink version, since sink is mainly passed as a reference by
 * the cli
 */
export const sinkVersion = '0.0.1';

export { getPrompt };

export * as files from './Files';
export * as tasks from './Tasks';
export * as utils from './Utils';
