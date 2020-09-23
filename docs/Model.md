# Model

Model object is a container that includes these elements:

1. [Tables list](#table)
1. [List of source data sets](#source-data-set)
1. [properties](#properties) object
1. [collections](#collections) object

**Example:**

```json
{
  "tables": [],
  "sourceDataSets": [],
  "properties": {},
  "collections": {}
}
```

## Table

Table object describes a table. This may include (the final list of metadata
properties depends on the actual composition of addons used by your Latona
project):

- `tableName`: table name;
- `tableScope`: will be used by selector methods;
- `keyPrefix`: a string that will be added to automatically added key fields;
- `isInternal`: signals that table is for internal staging purposes only;
- `options`: flags that describe table's roles.
  This may include:
  - `addSurrogateKey` - addon should add a surrogate key field
  - `addNaturalKeyhash` - adding a natural key hash field
    (i.e. field that will contain the hash of original (natural) keys)
  - `addDateFields` - - addon should add version lifetime dates (active_from
    and active_to)
  - ... any other options that might be used by templates
- `references`: an array of referenced table names;
- `fields`: the [fields](#fields) inventory;

**Note:** Please refer to addon documentation to learn which metadata drives
the rendering process for addons used by your project.

**Example:**

```json
{
  "tables": [
    {
      "tableName": "AdventureWorksDWBuildVersion",
      "tableScope": "other",
      "keyPrefix": "AdventureWorksDWBuildVersion",
      "functionSetNames": ["CommonFunctionSet"],
      "options": {
        "addSurrogateKey": true,
        "addSurrogateVersionKeyhash": true,
        "addNaturalKeyhash": true,
        "addDateFields": true
      },
      "fields": [
        {
          "fieldName": "DBVersion",
          "sqlType": "nvarchar(100)",
          "lakeType": "String",
          "options": {
            "isPersistent": true,
            "isPublic": true,
            "isVersioned": true,
            "isNullable": true
          } // <-- options
        }
      ] // <-- fields
    }
  ]
}
```

### Fields

Field object describes how we should treat fields. `field` object has at least
the following:

- field name;
- SQL Type;
- Options that will tell us how to treat the field:
  - "Is persistent" flag - save the value to staging;
  - "Is public" flag - a subset of persistent fields - value should go to the
    public area;
  - "Is natural key" flag - value is the part of a natural key;
  - "Is versioned" flag - field value should be considered during version hash calculations or change detection process;

Note that code generator itself will not do anything with values - it is up to
addon author's discretion. Addon author is also responsible for implementing
handy selectors if needed.

**Example:**

```json
{
  "fieldName": "string",
  "sqlType": "string",
  "someOtherType": "string",
  "options": {
    "isPersistent": true | false,
    "isPublic": true | false,
    "isNKey": true | false,
    "isVersioned": true | false
    // ...
  }
}
```

## Source Data Set

For some technologies, it is beneficial to be able to generate some code to
process "incoming" data points. Though we're not aiming to model source-target
transformations, source datasets are the first step to that. Source data sets
might be described with the following:

- Name;
- List of fields with their data types;
- Some extra attributes required for templates and functions;

**Examples:**

```json
{
  "sourceDataSets": [
    {
      "dataSetName": "string",
      "options": {
        "someOpt": "someValue",
        "anotherOpt": "anotherValue"
      },
      "schema": [
        {
          "fieldName": "string",
          "type": "string",
          "options": {}
        }
        // ...
      ]
    }
  ]
}
```

## properties

The `properties` object is the right place to put model-level metadata. You can
add there anything your addons need. No validation (except checking that it is
still an object) will be applied on load until some addon does that.

Latona Core addons do not use the `properties` object.

## collections

The `collections` object is the place for "secondary" data structures, that
do not define the data model directly, but rather required for implementation or
documentation purposes. This can be any of:

- list of ETL packages
- list of business processes
- list of cross-model references
- list of submodels
- anything you can imagine 8-)

Latona Core addons do not use the `collections` object, thus - no validation (well,
except checking that it is still an object).

## Useful links

- See [addon registry](./addons/addon-registry.md) for links to addon
  documentation pages.
- See [API](./dev/API.md) documentation for more details on the Latona API.
