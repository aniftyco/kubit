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
