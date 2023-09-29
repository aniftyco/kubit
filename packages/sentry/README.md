# @kubit/sentry

> Sentry for Adonis/Kubit applications.

## Getting Started

### Install

```sh
npm i @kubit/sentry @sentry/node @sentry/profiling-node
```

### Configure

```sh
node ace configure @kubit/sentry
```

### Usage

To utilize this package, just open up `app/Exceptions/Handler.ts` and add the following:

```diff
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler';
import Logger from '@ioc:Adonis/Core/Logger';
+ import Sentry from '@ioc:Kubit/Sentry';

export default class ExceptionHandler extends HttpExceptionHandler {
  protected statusPages = {
    '403': 'errors/unauthorized',
    '404': 'errors/not-found',
    '500..599': 'errors/server-error',
  };

  constructor() {
    super(Logger);
  }

+  public async handle(error: any, ctx: HttpContextContract) {
+    Sentry.captureException(error);

+    return super.handle(error, ctx);
+  }
}
```

For additional details about Sentry's API, check the
[SDK documentation](https://docs.sentry.io/platforms/node/?platform=node).

<hr />

For more information about Kubit, [visit kubitjs.com](https://kubitjs.com)!
