<div align="center">
  <img src="https://res.cloudinary.com/adonisjs/image/upload/q_100/v1558612869/adonis-readme_zscycu.jpg" width="600px">
</div>

<br />
<hr />

<div align="center">
  <h1> Typescript Compiler </h1>
	<p> In memory Typescript compiler for Node.js with support for <strong>caching</strong> and <strong> custom transformers</strong> </p>
</div>

<br />

<div align="center">

[![gh-workflow-image]][gh-workflow-url] [![npm-image]][npm-url] ![][typescript-image] [![license-image]][license-url] [![synk-image]][synk-url]

</div>

## Introduction

Require ts is a module similar to [ts-node](https://github.com/TypeStrong/ts-node) with a handful of differences.

The idea is to hook into the lifecycle of Node.js `require` calls and compile Typescript on the fly (in memory)

In case, if you are not aware, Node.js has first class support for registering custom [require extensions](https://gist.github.com/jamestalmage/df922691475cff66c7e6) to resolve and compile files with a certain extension. For example:

```ts
require.extenstions['.ts'] = function (module, filename) {
  var content = fs.readFileSync(filename, 'utf8')
  module._compile(content, filename)
}
```

If we replace the function body of the example with the Typescript compiler API, the we basically get in-memory typescript compilation. However, there are many other things to manage.

- Making source-maps to work, so that the error points to the Typescript code and not the compiled in memory Javascript.
- Support for typescript extensions
- Introducing some sort of caching to avoid re-compiling the unchanged files. Typescript compiler is not one of the fastest compilers, so caching is required.

## Goals

Following are the goals for writing this module

- Able to work with Typescript without setting up a on-disk compiler
- Keeping the in-memory compilation fast. For this, we do not perform type checking. Your IDE or text editor should do it.
- Cache the compiled output on disk so that we can avoid re-compiling the unchanged files. A decent project has 100s of source files and we usually don't change all of them together. Also compiled cache is not same as the compiled output.
- Expose helper functions for watchers to clear the cache. Most of the Node.js apps use some kind of a watcher to watch for file changes and then restart the process. The helpers exposed by this package, allows the watcher to cleanup cache of the changed file.
- Add support for custom transformers.

## Usage

This module is pre-configured with all the AdonisJS applications and ideally you won't have to dig into the setup process yourself. However, if you are using it outside of AdonisJS, then follow the following setup process.

```sh
npm i -D @adonisjs/require-ts
```

And then require it as a Node.js require hook

```sh
node -r @adonisjs/require-ts/build/register app.ts
```

I have personally created a bash alias for the above command.

```sh
alias tsnode="node -r @adonisjs/require-ts/build/register"
```

and then run it as follows

```sh
tsnode app.ts
```

## Programmatic usage

The main goal of this package is to expose a programmatic API that others can use to create their own build tools or commands.

### `register`

```ts
const { register } = require('@adonisjs/require-ts')

/**
 * Require ts will resolve the "tsconfig.json" file from this
 * path. tsconfig.json file is required to compile the code as * per the project requirements
 */
const appRoot = __dirname

const options = {
  cache: true,
  cachePath: join(require.resolve('node_modules'), '.cache/your-app-name'),
  transformers: {
    before: [],
    after: [],
    afterDeclarations: [],
  },
}

register(appRoot, options)

/**
 * From here on you can import the typescript code
 */
require('./typescript-app-entrypoint.ts')
```

The `register` method accepts an optional object for configuring the cache and executing transformers.

- `cache`: Whether or not to configure the cache
- `cachePath`: Where to write the cached output
- `transformers`: An object with transformers to be executed at different lifecycles. Read [transformers](#transformers) section.

The register method adds two global properties to the Node.js global namespace.

- `compiler`: Reference to the compiler, that is compiling the source code. You can access it as follows:
  ```ts
  const { symbols } = require('@adonisjs/require-ts')
  console.log(global[symbols.compiler])
  ```
- `config`: Reference to the config parser, that parses the `tsconfig.json` file. You can access it as follows:
  ```ts
  const { symbols } = require('@adonisjs/require-ts')
  console.log(global[symbols.config])
  ```

### `getWatcherHelpers`

The watcher helpers allows the watchers to cleanup the cache at different events. Here's how you can use it

```ts
const { getWatcherHelpers } = require('@adonisjs/require-ts')

/**
 * Require ts will resolve the "tsconfig.json" file from this
 * path. tsconfig.json file is required to compile the code as * per the project requirements
 */
const appRoot = __dirname

/**
 * Same as what you passed to the `register` method
 */
const cachePath = join(require.resolve('node_modules'), '.cache/your-app-name')

const helpers = getWatcherHelpers(appRoot, cachePath)

helpers.clear('./relative/path/from/app/root')
```

This is how you should set up the flow

- Clean the entire cache when you start the watcher for the first time. `helpers.clear()`. No arguments means, clear everything
- Clean the cache for the file that just changed. `helpers.clear('./file/path')`
- Check if the config file has changed in a way that will impact the compiled output. If yes, then clear all the cached files.

  ```ts
  if (helpers.isConfigStale()) {
    helpers.clear() // clear all files from cache
  }
  ```

## Caching

Caching is really important for us. Reading the compiled output from the disk is way faster than re-compiling the same file with Typescript.

This is how we perform caching.

- Create a `md5 hash` of the file contents using the [rev-hash](https://www.npmjs.com/package/rev-hash) package.
- Checking the cache output with the same name as the hash.
- If the file exists, pass its output to Node.js `module._compile` method.
- Otherwise, compile the file using the Typescript compiler API and cache it on the disk

The module itself doesn't bother itself with clearing the stale cached files. Meaning, the cache grows like grass.

However, we expose helper functions to cleanup the cache. Usually, you will be using them with a file watcher like `nodemon` to clear the cache for the changed file.

## Differences from ts-node

`ts-node` and `require-ts` has a few but important differences.

- `ts-node` also type checks the Typescript code. They do allow configuring ts-node without type checking. But overall, they pay extra setup cost just by even considering type checking.
- `ts-node` has no concept of on-disk caching. This is a deal breaker for us. **Then why not contribute this feature to ts-node?**. Well, we can. But in order for caching to work properly, the module need to expose the helpers for watchers to cleanup the cache and I don't think, ts-node will bother itself with this.
- `ts-node` ships with inbuilt REPL. We don't want to bother ourselves with this. Again, keeping the codebase focused on a single use case. You can use [@adonisjs/repl](https://github.com/adonisjs/repl) for the REPL support.

These are small differences, but has biggest impact overall.

## Transformers

Typescript compiler API supports transformers to transform/mutate the AST during the compile phase. [Here](https://github.com/madou/typescript-transformer-handbook#writing-your-first-transformer) you can learn about transformers in general.

With `require-ts`, you can register the transformers with in the `tsconfig.json` file or pass them inline, when using the programmatic API.

Following is an example of the tsconfig.json file

```json
{
  "compilerOptions": {},
  "transformers": {
    "before": ["./transformer-before"],
    "after": ["./transformer-after"],
    "afterDeclarations": ["./transformer-after-declarations"]
  }
}
```

The transformer array accepts the relative file name from the `appRoot`. The transformer module must export a function as follows:

```ts
export default transformerBefore(ts: typescript, appRoot: string) {
  return function transformerFactory (context) {}
}
```

[gh-workflow-image]: https://img.shields.io/github/workflow/status/adonisjs/require-ts/test?style=for-the-badge
[gh-workflow-url]: https://github.com/adonisjs/require-ts/actions/workflows/test.yml 'Github action'
[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript
[typescript-url]: "typescript"
[npm-image]: https://img.shields.io/npm/v/@adonisjs/require-ts.svg?style=for-the-badge&logo=npm
[npm-url]: https://npmjs.org/package/@adonisjs/require-ts 'npm'
[license-image]: https://img.shields.io/npm/l/@adonisjs/require-ts?color=blueviolet&style=for-the-badge
[license-url]: LICENSE.md 'license'
[synk-image]: https://img.shields.io/snyk/vulnerabilities/github/adonisjs/require-ts?label=Synk%20Vulnerabilities&style=for-the-badge
[synk-url]: https://snyk.io/test/github/adonisjs/require-ts?targetFile=package.json 'synk'
