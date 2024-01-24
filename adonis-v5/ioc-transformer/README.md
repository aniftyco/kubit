<div align="center"><img src="https://res.cloudinary.com/adonisjs/image/upload/q_100/v1564392111/adonis-banner_o9lunk.png" width="600px"></div>

# Ioc Transformer
> Typescript transformer to transform import statements to IoC container use calls

[![gh-workflow-image]][gh-workflow-url] [![npm-image]][npm-url] ![][typescript-image] [![license-image]][license-url]

The [Ioc container](https://github.com/adonisjs/fold) of AdonisJs exposes the `use` method to resolve dependencies from the container. However, using `use` and `import` statements together feels a bit cluttered. This module enables using `import` statements for IoC container bindings and transforms them to the `use` call by hooking into the Typescript compiler lifecycle.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of contents

- [Usage](#usage)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Usage
Install the package from npm registry as follows:

```sh
npm i @adonisjs/ioc-transformer
```

Pass it to the Typescript compiler as `after` hook. Following is an example of using it with `ts-node`.

```ts
const { iocTransformer } = require('@adonisjs/ioc-transformer')

require('ts-node').register({
  transformers: {
    after: [iocTransformer(require('typescript/lib/typescript'), require('./.adonisrc.json'))],
  }
})
```

[gh-workflow-image]: https://img.shields.io/github/workflow/status/adonisjs/ioc-transformer/test?style=for-the-badge
[gh-workflow-url]: https://github.com/adonisjs/ioc-transformer/actions/workflows/test.yml "Github action"

[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript
[typescript-url]:  "typescript"

[npm-image]: https://img.shields.io/npm/v/@adonisjs/ioc-transformer.svg?style=for-the-badge&logo=npm
[npm-url]: https://npmjs.org/package/@adonisjs/ioc-transformer "npm"

[license-image]: https://img.shields.io/npm/l/@adonisjs/ioc-transformer?color=blueviolet&style=for-the-badge
[license-url]: LICENSE.md "license"
