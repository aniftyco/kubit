The package has been configured successfully. The package internally relies on the `CACHE_VIEWS` environment variables and hence we recommend recommend validating it.

Open the `env.ts` file and paste the following code inside the `Env.rules` object.

```ts
CACHE_VIEWS: Env.schema.boolean()
```

- Here we ensure that `CACHE_VIEWS` environment is always defined.
- And it is using a boolean value.
