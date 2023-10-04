The package has been configured successfully.

The configuration stored inside `config/attachment.ts` relies on the following environment variables so we recommend
validating them.

Open the `env.ts` file and paste the following code inside the `Env.rules` object:

```ts
FOO: Env.schema.string.optional(),
```
