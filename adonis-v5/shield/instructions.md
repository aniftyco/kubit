Congratulations! You have configured `@kubit/shield` package successfully. Just make sure to add the following middleware inside the `start/kernel.ts` file.

```ts
Server.middleware.register([
  () => import('@ioc:Kubit/BodyParser'),
  () => import('@ioc:Kubit/Shield')
  '...',
])
```

**The middleware must be right after the `BodyParser` middleware.**
