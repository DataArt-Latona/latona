# latona-core-dimensional

## Overview

The `latona-core-dimensional` addon adds essential helpers that simplify
accessing tables and fields by their roles. You may combine this addon with
other latona core addons to achieve the configuration when only "business"
fields should be managed manually.

## Options and defaults

| parameter                    | type     | default        | value                                                                                                                            |
| ---------------------------- | -------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `tableScopeValueDim`         | `string` | "dim"          | Sets which `tableScope` value signals that a table is dimension table                                                            |
| `tableScopeValueFact`        | `string` | "fact"         | Sets which `tableScope` value signals that a table is fact table                                                                 |
| `tableScopeValueRaw`         | `string` | "raw"          | Sets which `tableScope` value signals that a table hosts raw data (typically in staging area of a data warehouse)                |
| `tableScopeValueOther`       | `string` | "other"        | Sets which `tableScope` value signals that a table is auxiliary table (may be used for metadata or other special cases)          |
| `tableOptionInternal`        | `string` | "isInternal"   | Sets which table option flag signals that a table should be treated as "internal"                                                |
| `fieldOptionNaturalKey`      | `string` | "isNKey"       | Sets which field option flag signals that a field is a part of natural key                                                       |
| `fieldOptionSurrogateKey`    | `string` | "isSKey"       | Sets which field option flag signals that a field is a part of surrogate key                                                     |
| `fieldOptionVersionKey`      | `string` | "isVKey"       | Sets which field option flag signals that a field is a part of record version key                                                |
| `fieldOptionPublicField`     | `string` | "isPublic"     | Sets which field option flag signals that a field needs to be published to the user-facing ("public") area of the data warehouse |
| `fieldOptionIndexField`      | `string` | "isIndex"      | Sets which field option flag signals that a field is a part of index                                                             |
| `fieldOptionPersistentField` | `string` | "isPersistent" | Sets which field option flag signals that a field should be persisted (typically calculated fields)                              |
| `fieldOptionVersionedField`  | `string` | "isVersioned"  | Sets which field option flag signals that a field must be considered for versioning                                              |

**Notes:**

The particular use of table and field roles is up to addon the implements code
generation. This addon only implements helper methods to simplify traversing the
model (other addons may add other methods on top of ones defined by this addon).

## Added methods (via mixins)

### Field methods

| method                 | returns | description                                                                                               |
| ---------------------- | ------- | --------------------------------------------------------------------------------------------------------- |
| `.isNaturalKey()`      | `bool`  | Returns `true` if field is flagged (via `options` flag) as natural key, otherwise returns `false`.        |
| `.isSurrogateKey()`    | `bool`  | Returns `true` if field is flagged (via `options` flag) as surrogate key, otherwise returns `false`.      |
| `.isVersionKey()`      | `bool`  | Returns `true` if field is flagged (via `options` flag) as record version key, otherwise returns `false`. |
| `.isPublic()`          | `bool`  | Returns `true` if field is flagged (via `options` flag) as public, otherwise returns `false`.             |
| `.isIndexField()`      | `bool`  | Returns `true` if field is flagged (via `options` flag) as index field, otherwise returns `false`.        |
| `.isPersistentField()` | `bool`  | Returns `true` if field is flagged (via `options` flag) as persistent field, otherwise returns `false`.   |
| `.isVersionedField()`  | `bool`  | Returns `true` if field is flagged (via `options` flag) as versioned field, otherwise returns `false`.    |

### Table methods

| method                           | returns    | description                                                                                                            |
| -------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| `.isDimension()`                 | `bool`     | Returns `true` if table's `tableScope` property indicates that table's role is "dimension", otherwise returns `false`. |
| `.isFact()`                      | `bool`     | Returns `true` if table's `tableScope` property indicates that table's role is "fact", otherwise returns `false`.      |
| `.isRaw()`                       | `bool`     | Returns `true` if table's `tableScope` property indicates that table's role is "raw", otherwise returns `false`.       |
| `.isOther()`                     | `bool`     | Returns `true` if table's `tableScope` property indicates that table's role is "other", otherwise returns `false`.     |
| `.isInternal()`                  | `bool`     | Returns `true` if table is flagged (via `options` flag) as internal, otherwise returns `false`.                        |
| `.naturalKeyFields()`            | `Object[]` | Returns an array of natural key fields.                                                                                |
| `.surrogateKeyFields()`          | `Object[]` | Returns an array of surrogate key fields.                                                                              |
| `.versionKeyFields()`            | `Object[]` | Returns an array of version key fields.                                                                                |
| `.publicFields()`                | `Object[]` | Returns an array of public fields.                                                                                     |
| `.indexFields()`                 | `Object[]` | Returns an array of index fields.                                                                                      |
| `.persistentFields()`            | `Object[]` | Returns an array of persistent fields.                                                                                 |
| `.nonPersistentFields()`         | `Object[]` | Returns an array of fields that are NOT flagged as persistent.                                                         |
| `.versionedFields()`             | `Object[]` | Returns an array of fields that should be considered for record versioning.                                            |
| `.persistentUnversionedFields()` | `Object[]` | Returns an array of fields persistent fields that are NOT considered for record versioning.                            |

**Note:**

- All field selector methods return an array of "deep clone" objects (not field
  objects) where last element has `isLast` property set to `true`.

### Model methods

| method               | returns   | description                                                             |
| -------------------- | --------- | ----------------------------------------------------------------------- |
| `.publicTables()`    | `Table[]` | Returns an array of `Table` objects that are NOT flagged as internal.   |
| `.internalTables()`  | `Table[]` | Returns an array of `Table` objects that are flagged as internal.       |
| `.dimensionTables()` | `Table[]` | Returns an array of `Table` objects that have "dimension" role (scope). |
| `.factTables()`      | `Table[]` | Returns an array of `Table` objects that have "fact" role (scope).      |
| `.rawTables()`       | `Table[]` | Returns an array of `Table` objects that have "raw" role (scope).       |
| `.otherTables()`     | `Table[]` | Returns an array of `Table` objects that have "other" role (scope).     |

## Metadata dependencies

**Table-level:**

- `tableScope` - addon relies on this property to determine table's "role"
- `options` - addon uses option flags to implement "flag" methods - see options
  section for details

**Field-level:**

- `options` - addon uses option flags to implement "flag" methods - see options
  section for details

## Addon reference example

```json
{
  "model": "./path/to/model.json",
  "addons": [
    {
      "moduleName": "latona-core-dimensional",
      "options": {
        // all parameters below are optional - use only when you need to
        // override the default value
        "tableScopeValueDim": "dim",
        "tableScopeValueFact": "fact",
        "tableScopeValueRaw": "raw",
        "tableScopeValueOther": "other",
        "tableOptionInternal": "isInternal",
        "fieldOptionNaturalKey": "isNKey",
        "fieldOptionSurrogateKey": "isSKey",
        "fieldOptionVersionKey": "isVKey",
        "fieldOptionPublicField": "isPublic",
        "fieldOptionIndexField": "isIndex",
        "fieldOptionPersistentField": "isPersistent",
        "fieldOptionVersionedField": "isVersioned"
      }
    }
  ]
}
```

## Addon API features

This addon uses following API features:

- Model mixin
- Table mixin
- Field mixin
