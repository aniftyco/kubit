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
