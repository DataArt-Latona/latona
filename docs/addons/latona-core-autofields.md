# latona-core-autofields

## Overview

The `latona-core-autofields` addon automates creation of table fields based on
predefined naming conventions. You can use a number of metadata properties to
control which table will get auto-generated fields. The field template itself
may contain any metadata, also field name may be prefixed by table's
`keyPrefix` property.

## Options and defaults

| parameter                      | type                  | value                                                                                                         |
| ------------------------------ | --------------------- | ------------------------------------------------------------------------------------------------------------- |
| `fieldTemplates`               | `AutoFieldTemplate[]` | array of `AutoFieldTemplate`                                                                                  |
| `fieldTemplates.tableOption`   | `[string]`            | Sets which table option flag should present. Only tables that have this flag will get auto field added.       |
| `fieldTemplates.tableScope`    | `[string]`            | Sets the value of the `tableScope` property. Only tables that have the given value will get auto field added. |
| `fieldTemplates.addKeyPrefix`  | `[bool]`              | controls if table's `keyPrefix` property should be prepended to field's name                                  |
| `fieldTemplates.fieldTemplate` | `Field`               | `Field` object                                                                                                |

**Notes:**

- If both `tableOption` and `tableScope` are set - both conditions should be met
  by a table in order to qualify. If only one is set the unset condition will be
  ignored. All tables will get the field if neither `tableOption` nor `tableScope`
  is set.
- A qualifying table should have the `keyPrefix` property defined if
  `addKeyPrefix` option is set, otherwise rendering will fail.
- Rendering will fail if a field with requested name already exists in
  qualifying table.

## Metadata dependencies

**Table-level:**

- `tableScope` - see options section for more details
- `keyPrefix` - see options section for more details
- `options` array - see options section for more details

**Field-level:**

- `field.options.isAutoAdded` - will be set to `true` for each auto-generated
  field

## Addon reference example

```json
{
  "model": "./path/to/model.json",
  "addons": [
    {
      "moduleName": "latona-core-autofields",
      "options": {
        "fieldTemplates": [
          {
            "tableOption": "addDateFields", // optional
            "tableScope": "other", // optional
            "addKeyPrefix": true|false // optional, default - false
            "fieldTemplate": {
              "fieldName": "dt_from",
              "type": "date"
            }
          },
          {
            "tableOption": "addDateFields", // optional
            "tableScope": "other", // optional
            "fieldTemplate": {
              "fieldName": "dt_to",
              "type": "date"
            }
          }
        ]
      }
    }
  ]
}
```

## Addon API features

This addon uses following API features:

- Model transformations
