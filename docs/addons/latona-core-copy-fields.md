# latona-core-copy-fields

## Overview

The `latona-core-copy-fields` addon implements simple field copy scenario for
referenced tables. The primary use case is automating the propagation of natural
and surrogate keys from referenced tables into referencing ones.

Consider the following model:

**Table: Dimension A**

| Column      | Role                | Is public? |
| ----------- | ------------------- | ---------- |
| dim_a_id    | natural key         |            |
| dim_a_key   | surrogate key       | +          |
| attribute_a | dimension attribute | +          |
| attribute_b | dimension attribute | +          |
| ...         | ...                 |            |

**Table: Dimension B**

| Column      | Role                | Is public? |
| ----------- | ------------------- | ---------- |
| dim_b_id    | natural key         |            |
| dim_b_key   | surrogate key       | +          |
| attribute_c | dimension attribute | +          |
| attribute_d | dimension attribute | +          |
| ...         | ...                 |            |

**Table: Fact**

This table references _Dimension A_ and _Dimension B_

| Column      | Role          | Is public? |
| ----------- | ------------- | ---------- |
| fact_id     | natural key   |            |
| fact_key    | surrogate key | +          |
| measure_001 | fact measure  | +          |
| measure_002 | fact measure  | +          |
| ...         | ...           |            |

The data warehouse implementation will need to have relevant fields in the
_Fact_ table to enable joining fact records with dimension records. "Staging"
area will typically need both natural and surrogate keys for re-key purposes,
"Public" area will typically need surrogate keys only.

With this addon you can achieve automatic propagation of dimension's key fields,
so that the fact table will have the following structure once addon's model
transformation task is applied (but before code rendering):

| Column      | Role          | Is public? |
| ----------- | ------------- | ---------- |
| fact_id     | natural key   |            |
| fact_key    | surrogate key | +          |
| measure_001 | fact measure  | +          |
| measure_002 | fact measure  | +          |
| dim_a_id    |               |            |
| dim_a_key   |               | +          |
| dim_b_id    |               |            |
| dim_b_key   |               | +          |
| ...         | ...           |            |

Downstream addons may now use column names and the list of referenced tables to
generate necessary join statements. Field metadata may be used to decide which
fields should be added to which physical tables.

**Note:**

This addon doesn't provide any support for renaming fields, advanced tweaking of
field metadata or any other adjustments that may be required to implement more
complex cases (role-playing dimensions, for example).

## Options and defaults

| parameter            | type               | value                                                                                              |
| -------------------- | ------------------ | -------------------------------------------------------------------------------------------------- |
| `rules`              | `CopyFieldsRule[]` | Array of [`CopyFieldsRule`](../dev/API.md#copyfieldsrule) objects, cannot be empty                 |
| `rules.tableScope`   | `string`           | The rule applies only to **referencing** tables that have this `tableScope` property               |
| `rules.fieldOptions` | `string[]`         | Only fields from referenced tables that have **all** listed field options will be copied           |
| `rules.unsetOptions` | `string[]`         | If an original field has one of listed field options, the option will be unset for the field copy. |

**Notes:**

Addon follows this logic:

- For each table we search for qualifying copy rules (based on `tableScope`
  setting (if provided), and on presence of referenced tables;
- For each qualifying table and rule we loop through referenced tables and
  search for qualifying fields (based on the field's `options` object - all
  "options" mentioned in the `fieldOptions` collection should exist and have
  non-false value)
- For each qualifying field:
  - If the referencing table's `fields` collection doesn't contain field with
    the same name, we create a copy of the qualifying field, remove options
    mentioned in the `unsetOptions` collection and add the new field into the
    target table.
  - No action is taken if the field with the same name already exists.

## Metadata dependencies

**Table-level:**

- `tableScope` - see options section for more details
- `references` array - addon traverses this array to get fields to copy

**Field-level:**

- `options` - see options section for more details

## Addon reference example

```json
{
  "model": "./path/to/model.json",
  "addons": [
    {
      "moduleName": "latona-core-copy-fields",
      "options": {
        "rules": [
          {
            "tableScope": "fact", // optional
            "fieldOptions": ["isNKey"],
            "unsetOptions": ["isNKey", "isSKey"] // optional
          },
          {
            "tableScope": "fact",
            "fieldOptions": ["isSKey"],
            "unsetOptions": ["isNKey", "isSKey"]
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
