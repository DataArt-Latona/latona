# Project

Latona uses project JSON files to control how output artifacts are rendered.
It is project that glues together your [data model](./Model.md) and addons. With
project you control which Latona addons constitute your rendering sequence and
how they should behave.

The project object is a plain JavaScript object with these properties:

- model - refers to the json file containing the data model
- addons - array of addon references
- logger - logger settings

```json
{
  "model": "./path/to/model.json",
  "addons": [
    {
      "moduleName": "installed-node-package",
      "options": {
        // addon-specific settings
      }
    },
    {
      "moduleName": "latona-core-addon",
      "options": {
        // addon-specific settings
      }
    },
    {
      "moduleName": "./path/to/module.js",
      "options": {
        // addon-specific settings
      }
    }
  ],
  "logger": {
    "disableLogToConsole": true | false, // optional
    "runtimeLogsFilePath": "./path/to/latona_runtime.log", // optional
    "exceptionsLogsFilePath": "./path/to/latona_exceptions.log" // optional
  }
}
```

Useful links:

- See [LatonaProject](./dev/API.md#latonaproject) class for more details on what
  is expected for `model` and `addons`.
- See [addon registry](./addons/addon-registry.md) for links to addon
  documentation pages.
- See [LatonaProject.load](./dev/API.md#LatonaProject.load)
  method for the description of logger settings.
