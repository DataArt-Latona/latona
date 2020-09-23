# latona-core-clean-folders

## Overview

The `latona-core-clean-folders` addon cleans given folders before rendering is
started.

## Options and defaults

| parameter        | type       | value                                                                                   |
| ---------------- | ---------- | --------------------------------------------------------------------------------------- |
| `foldersToClean` | `string[]` | array of strings containing the list of folders to clean (relative to project location) |

**Notes:**

- addon _will not_ fail if folder doesn't exist

## Addon reference example

```json
{
  "model": "./path/to/model.json",
  "addons": [
    {
      "moduleName": "latona-core-clean-folders",
      "options": {
        "foldersToClean": ["./some/folder", "../another/folder"]
      }
    }
  ]
}
```

## Addon API features

This addon uses following API features:

- Pre-processing tasks
