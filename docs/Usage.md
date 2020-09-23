# Latona step by step tutorial

## MarkdownProject - document data model

We will use a limited amount of data in our tutorial as most of them are repeated.
Full code example you can find in our [examples folder](../examples/MarkdownProject).

### Prerequisites

We assume that you have already installed the latona package as described in the
[Quick Start](../README.md#install) guide.

### Initial setup

To start with latona we need to create an empty folder and bootstrap the project by creating new model and project files (see [CLI reference](./Cli.md) for the full list of options):

```
latona new model
latona new project
```

### Model file

([example](../examples/MarkdownProject/model.json))

1. Let's take a look at our `model` object (see [model docs](./Model.md) for more information). The `model` object must be described in a `.json` file. Our model (which is a bit reacher than the one you will get after calling the Latona CLI) will have all base properties - `tables`, `sourceDataSets`, `properties`, and `collections`:

```json
{
  "tables": [],
  "sourceDataSets": [],
  "properties": {},
  "collections": {}
}
```

2. Then we'll add a new table to our model:

```json
{
  "tables": [
    {
      "tableName": "DimClient",
      "tableScope": "dim",
      "keyPrefix": "client_",
      "options": {
        "addSurrogateKey": true,
        "addVersionKey": true
      },
      "fields": [
        {
          "fieldName": "client_id",
          "sqlType": "int",
          "options": {
            "isPersistent": true,
            "isNKey": true
          }
        },
        {
          "fieldName": "client_name",
          "sqlType": "nvarchar(10)",
          "options": {
            "isPublic": true,
            "isVersioned": true
          }
        },
        {
          "fieldName": "client_category",
          "sqlType": "nvarchar(10)",
          "options": {
            "isPublic": true,
            "isVersioned": true
          }
        }
      ]
    }
  ],
  "sourceDataSets": []
}
```

As you can see, this table has `tableName`, `tableScope`, `keyPrefix`, 2 `options` and 3 `fields`. Detail information about table data you can find here: [table docs](./Model.md#table).

3. Also we have some external data we want to use to generate ETL workflows using Latona. Let's add it to `sourceDataSets`:

```json
{
  "tables": [
    /* our table here */
  ],
  "sourceDataSets": [
    {
      "dataSetName": "RawOrderItemsDS",
      "query": "select * from vOrderItems",
      "schemaTable": "RawOrderItems"
    }
  ]
}
```

4. `properties` and `collections` objects also may contribute to code generation,
   it all depends on what your addon composition relies upon. Please see next section for more details on this.

```json
{
  "tables": [
    /* our table here */
  ],
  "sourceDataSets": [
    {
      /* our source data set here */
    }
  ],
  "properties": {
    "modelStatus": "sample"
  },
  "collections": {
    "businessProcesses": [
      {
        "businessProcessName": "client onboarding",
        "description": "Register client in CRM app",
        "relatedTables": ["DimClient"]
      },
      {
        "businessProcessName": "order processing",
        "description": "Process client orders",
        "relatedTables": [
          "DimClient",
          "DimOrder",
          "DimProduct",
          "FactOrderItem"
        ]
      }
    ]
  }
}
```

### Project file

([example](../examples/MarkdownProject/latona.json))

5. Let's take a look at the project file now. The Latona project has three key elements:

```json
{
  "model": "./model.json", // path to model file
  "addons": [], // list of addons alongside with their settings
  "logger": {} // logger settings
}
```

6. `model` should point to your model file, the path needs to be absolute or relative to the project file location.

7. `addons` array contains the list of "addon references", each containing `moduleName` and addon-specific options.

   The `moduleName` will be treated as follows:

   1. Names starting with `latona-core-` are reserved for [built-in "core" addons](./addons/addon-registry.md#core-addons)
   2. Names starting with `./` or `../` are considered as local custom addons and will be resolved against project file location
   3. All other module names will be resolved using common rules for `require`

   Addon's `options` are very specific to the particular addon, please refer to the corresponding documentation page for details.

   Here is how addon configuration may look like for...

   ... built-in addon...

```json
{
  "moduleName": "latona-core-autofields",
  "options": {
    "fieldTemplates": [
      {
        "tableOption": "addSurrogateKey",
        "addKeyPrefix": true,
        "fieldTemplate": {
          "fieldName": "s_key",
          "sqlType": "uniqueidentifier",
          "options": {
            "isPublic": true,
            "isSKey": true
          }
        }
      },
      {
        "tableOption": "addVersionKey",
        "addKeyPrefix": true,
        "fieldTemplate": {
          "fieldName": "v_key",
          "sqlType": "uniqueidentifier",
          "options": {
            "isPublic": true,
            "isVKey": true
          }
        }
      }
    ]
  }
}
```

...or some custom one:

```json
{
  "moduleName": "./addons/sampleMarkdown.js",
  "options": {
    "outPath": "./build"
  }
}
```

8. Finally, logging setting may be set in the project file:

   - `disableLogToConsole`: by default Latona will log all it's working progress into console. Setting this prop to `true` will prevent such behavior;
   - `runtimeLogsFilePath`: if specified, Latona will save all it's working progress into provided file;
   - `exceptionsLogsFilePath`: if specified, Latona will save all unexpected error messages into provided file;

   This property is _optional_.

```json
{
  "logger": {
    "runtimeLogsFilePath": "./logs/runtime.log",
    "exceptionsLogsFilePath": "./logs/exceptions.log",
    "disableLogToConsole": false | true
  }
}
```

### Validation and rendering

9. Now we're ready to check our project. Run this command from your project directory:

```
latona validate
```

10. ... and render our code artifacts:

```
latona render
```

## Further reading

We have other pages that discuss various Latona concepts in greater details. Find the full list [here](./README.md).
