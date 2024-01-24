### Validate commit

Configures a git hook to validate the commit messages. This is great, if you want to ensure that contributors to your project must form commit messages as per a given standard.

The default standard used is [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular) and rules are defined inside this [template](https://github.com/adonisjs/mrm-preset/blob/develop/validate-commit/conventional/template.md), which is copied over to your project `.github` folder for readers reference.

