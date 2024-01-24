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
