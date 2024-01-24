### Contributing.md template
Creates `.github/CONTRIBUTING.md` file. This file is shown by Github to users [creating new issues](https://help.github.com/articles/setting-guidelines-for-repository-contributors).

The content of the template is pre-defined and is not customizable. If you want custom template, then it's better to create the file by hand.

1. Template for Typescript
   The [typescript template](https://github.com/adonisjs/mrm-preset/blob/master/contributing/templates/CONTRIBUTING_TS.md) is used when `ts=true` inside the config file.
   
    ```json
    {
      "ts": true
    }
    ``` 

2. Otherwise the [default template](https://github.com/adonisjs/mrm-preset/blob/master/contributing/templates/CONTRIBUTING.md) will be used.