import { relative, resolve } from 'node:path';

import { cancel, confirm, intro, isCancel, outro, select, spinner, text } from '@clack/prompts';

import { installDependencies } from './dependencies';
import { initializeGit } from './git';
import { scaffold } from './scaffold';
import { colors } from './utils';

export const program = async ([input = null]: string[], cwd: string) => {
  intro(colors.bold(`Create ${colors.magenta('Kubit')} Application`));

  const dir = await text({
    message: 'Where should we create your new application?',
    placeholder: `./${input || 'my-app'}`,
    defaultValue: `./${input || 'my-app'}`,
  });

  if (isCancel(dir)) {
    cancel('Operation cancelled');
    return process.exit(0);
  }

  const path = resolve(cwd, dir);

  const repository = await confirm({
    message: `Initialize a new git repository? ${colors.dim('(recommended)')}`,
  });

  if (isCancel(repository)) {
    cancel('Operation cancelled');
    return process.exit(0);
  }

  const dependencies = await confirm({
    message: `Install dependencies with npm? ${colors.dim('(recommended)')}`,
  });

  if (isCancel(dependencies)) {
    cancel('Operation cancelled');
    return process.exit(0);
  }

  const s = spinner();

  s.start('Creating your new application...');
  await scaffold(path);
  s.stop(`${colors.green('✔️')} Application created.`);

  if (repository) {
    s.start('Initializing git repository...');

    await initializeGit(path);

    s.stop(`${colors.green('✔️')} Git initialized.`);
  }

  if (dependencies) {
    s.start('Dependencies installing with npm...');

    await installDependencies(path);

    s.stop(`${colors.green('✔️')} Dependencies installed.`);
  }

  outro(
    [
      "You're all set!\n",
      `Enter your application directory using ${colors.cyan(`cd ${relative(cwd, path)}`)}`,
      !dependencies && `Don't forget to run ${colors.cyan('npm install')} to install your dependencies.`,
      `Run ${colors.cyan('npm start')} to start your application.\n`,
      'Happy hacking!',
    ]
      .filter(Boolean)
      .join('\n')
  );
};
