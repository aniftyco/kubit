![](https://res.cloudinary.com/adonisjs/image/upload/q_100/v1547549861/mrm_entbte.png)

AdonisJS preset for [mrm](https://github.com/sapegin/mrm) to keep the project configuration files **in-sync** and **consistent across** various projects.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of contents

- [What is MRM?](#what-is-mrm)
- [What is MRM Preset?](#what-is-mrm-preset)
- [Getting started](#getting-started)
- [Tasks](#tasks)
  - [Appveyor](#appveyor)
  - [Circle CI](#circle-ci)
  - [Contributing.md template](#contributingmd-template)
  - [Editorconfig file](#editorconfig-file)
  - [Eslint](#eslint)
  - [Github templates](#github-templates)
  - [Github Actions](#github-actions)
  - [Gitignore template](#gitignore-template)
  - [License template](#license-template)
  - [Np release management](#np-release-management)
  - [Package file generation](#package-file-generation)
    - [Testing](#testing)
    - [Typescript setup](#typescript-setup)
    - [Scripts](#scripts)
  - [Prettier](#prettier)
  - [Probot applications](#probot-applications)
  - [Readme file](#readme-file)
  - [Readme file TOC](#readme-file-toc)
  - [Validate commit](#validate-commit)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## What is MRM?

**You might be curious to know what the heck is MRM?**

MRM is a command line tool to scaffold new projects. But instead of just creating the initial set of files, it has powerful utilities to update them as well.

For better explanation, I recommend reading [this article](https://blog.sapegin.me/all/mrm) by the project author.

## What is MRM Preset?

This module is a custom preset of tasks for MRM and is used by [AdonisJS](https://adonisjs.com) and many other projects I author.

You can also create a preset for your own needs. However, just go through the tasks once to see if they fit your needs and that way you can avoid creating your own tasks.

## Getting started

Let's quickly learn how to use this preset, before we dig into the specifics of tasks.

```sh
npm i --save-dev mrm @adonisjs/mrm-preset
```

Add script to `package.json` file

```sh
{
 "scripts": {
   "mrm": "mrm --preset=@adonisjs/mrm-preset"
 }
}
```

and then run it as follows

```sh
## Initiate by creating config file
npm run mrm init
```

```sh
## Execute all tasks (for new projects)
npm run mrm all
```

## Tasks

Let's focus on all the tasks supported by AdonisJS preset.

<!-- TASKS START -->
<!-- DO NOT MODIFY MANUALLY. INSTEAD RUN `npm run docs` TO REGENERATE IT -->

### Appveyor
Appveyor tasks creates a configuration file `(appveyor.yml)` in the root of your project. The tasks depends on the config file `config.json` and requires following key/value pairs.

```json
{
  "services": ["appveyor"],
  "minNodeVersion": "12.0.0"
}
```

To remove support for `appveyor` from your project, just `npm run mrm appveyor` task by removing the `appveyor` keyword from the `services` array. 

```json
{
  "services": []
}
```

```sh
npm run mrm appveyor
```

### Circle CI 
Circle CI  tasks creates a configuration file `(.circleci/config.yml)` in the root of your project. The tasks depends on the config file `config.json` and requires following key/value pairs.

```json
{
  "services": ["circleci"],
  "minNodeVersion": "12.0.0"
}
```

To remove support for `circleci` from your project, just `npm run mrm circleci` task by removing the `circleci` keyword from the `services` array.

```json
{
  "services": []
}
```

```sh
npm run mrm circleci
```

### Contributing.md template
Creates `.github/CONTRIBUTING.md` file. This file is shown by Github to users [creating new issues](https://help.github.com/articles/setting-guidelines-for-repository-contributors).

The content of the template is pre-defined and is not customizable. If you want custom template, then it's better to create the file by hand.

1. Template for Typescript
   The [typescript template](https://github.com/adonisjs/mrm-preset/blob/master/contributing/templates/CONTRIBUTING_TS.md) is used when `ts=true` inside the config file.
   
    ```json
    {
      "ts": true
    }
    ``` 

2. Otherwise the [default template](https://github.com/adonisjs/mrm-preset/blob/master/contributing/templates/CONTRIBUTING.md) will be used.
### Editorconfig file
Creates a `.editorconfig` file inside the project root. The editor config file is a way to keep the editor settings consistent regardless of the the editor you open the files in.

You may need a [plugin](https://editorconfig.org/#download) for your editor to make `editorconfig` work.

The file is generated with settings defined inside the [task file](https://github.com/adonisjs/mrm-preset/blob/master/editorconfig/index.js#L20) and again is not customizable.
### Eslint

Installs `eslint` and `eslint-plugin-adonis`. Also it will remove tslint and it's related dependencies from the project.

### Github templates

Creates issues and PR template for Github. The contents of these templates will be pre-filled anytime someone wants to create a new issue or PR.

1. [Issues template content](https://github.com/adonisjs/mrm-preset/blob/master/github/templates/issues.md)
2. [PR template](https://github.com/adonisjs/mrm-preset/blob/master/github/templates/pr.md)

### Github Actions 

Github actions tasks creates a configuration file `(.github/workflows/test.yml)` in the root of your project. The tasks depends on the config file `config.json` and requires following key/value pairs.

```json
{
  "services": ["github-actions"],
  "minNodeVersion": "14.15.4"
}
```

To remove support for `github-actions` from your project, just `npm run mrm github-actions` task by removing the `github-actions` keyword from the `services` array.

```json
{
  "services": []
}
```

```sh
npm run mrm github-actions
```

### Gitignore template

Creates `.gitignore` file in the root of your project. Following files and folders are ignored by default. However, you can add more to the template.

```
node_modules
coverage
test/__app
.DS_STORE
.nyc_output
.idea
.vscode/
*.sublime-project
*.sublime-workspace
*.log
build
docs
dist
shrinkwrap.yaml
```



### License template

Creates `LICENSE.md` file in the root of your project. 

You can choose from one of the [available licenses](https://github.com/sapegin/mrm-tasks/tree/master/packages/mrm-task-license/templates) when running `npm run init` command or define it by hand inside `config.json` file.

```json
{
  "license": "MIT"
}
```

If not defined, will fallback to `package.json` file or `MIT`.

### Np release management

[np](https://github.com/sindresorhus/np) is a sick (👌) tool to publish your npm packages by ensuring that your package is in healthy state for release.

We recommend reading their README too https://github.com/sindresorhus/np.

### Package file generation

This tasks does lots of work to install handful of packages and update `package.json` file.

The list of operations is based on my personal learnings while maintaining open source projects.

#### Testing

The [japa](https://github.com/thetutlage/japa) test runner is installed along side with `japaFile.js`.

#### Typescript setup

We create a `tsconfig.json` file and install following dependencies.

1. `@types/node`
2. `typescript`
3. `@adonisjs/require-ts`

#### Scripts
The following scripts are defined inside the `package.json` file.

1. `clean` to clean the build folder before starting the build. We also install `del-cli` npm package for this script to work
2. `compile` to compile the TypeScript code to JavaScript
3. `build` runs compile
4. `prePublishOnly` to compile before publishing to npm.

### Prettier

Installs `prettier` and `eslint-plugin-prettier` and `eslint-config-prettier` to setup prettier along side with `eslint`. Also the task will check, if `.eslintrc.json` file exists and then only performs the eslint specific setup

### Probot applications

Configures certain probot application templates inside the `.github` directory. Currently, following apps are supported.

- https://probot.github.io/apps/stale/
- https://probot.github.io/apps/lock/

### Readme file

Generates a Readme file using a [pre-defined template](https://github.com/adonisjs/mrm-preset/blob/master/readme/templates/README.md). Feel free to change the contents of the file, since it's just a starting point.
### Readme file TOC

Generates table of contents for the readme file. This tasks registers a `git hook` to automatically generate the TOC before every commit.

Under the hood npm package [doctoc](https://npm.im/doctoc) is used for generating the TOC, so make sure to read their readme file as well.

### Validate commit

Configures a git hook to validate the commit messages. This is great, if you want to ensure that contributors to your project must form commit messages as per a given standard.

The default standard used is [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular) and rules are defined inside this [template](https://github.com/adonisjs/mrm-preset/blob/develop/validate-commit/conventional/template.md), which is copied over to your project `.github` folder for readers reference.


<!-- TASKS END -->