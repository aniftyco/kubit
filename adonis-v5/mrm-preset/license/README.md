### License template

Creates `LICENSE.md` file in the root of your project. 

You can choose from one of the [available licenses](https://github.com/sapegin/mrm-tasks/tree/master/packages/mrm-task-license/templates) when running `npm run init` command or define it by hand inside `config.json` file.

```json
{
  "license": "MIT"
}
```

If not defined, will fallback to `package.json` file or `MIT`.
