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
