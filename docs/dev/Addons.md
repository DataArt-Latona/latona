# Addon API

Addons are ath heart of the Latona. In fact, Latona does almost nothing by
itself and heavily relies on addons for functionality. This page describes key
addon concepts.

## Addon module

Addon modules are [NodeJS modules](https://nodejs.org/api/modules.html)
responsible for instantiating LatonaAddon class.

We expect the addon module to export:

- `create` - builder function
- `defaults` - object that outlines addon default options

See [this file](../../examples/MarkdownProject/addons/sampleMarkdown.js) for
fully functional example

### `defaults` object

The `defaults` object exposes default setting values for your addon. It is not
used anyhow by Latona Core or CLI at the moment of writing, however we plan
to add ate least some helper CLI commands to ease setting exploration for Latona
users.

### `create` function

Addon's `create` function is defined as follows:

```js
/**
 * creates an instance of addon
 * @param {Object} options addon options (usually specified in the project
 *   file).
 * @param {function} addonCreateCb callback that returns an instance
 *   of `LatonaAddon`
 * @returns {LatonaAddon}
 */
const create = (options, addonCreateCb) => {
  //...
  const opt = Object.assign({}, defaults, options);
  //...
  const addon = addonCreateCb("MyAddon", "My addon description");
  //...
  return addon;
};
```

Please note that you do not need to build dependency on the Latona Core package.
Latona Project will pass `LatonaAddon.create` static function to the
`addonCreateCb` parameter. This allows avoiding conflicts of multiple framework
instances when running a globally installed CLI.

## [LatonaAddon](./API.md#LatonaAddon) class

The `LatonaAddon` class establishes an interface between addon modules and
`LatonaProject`. This class offers four key addon features:

1. Mixins
1. Model transformation callbacks
1. Pre-processing tasks
1. Render tasks

Addon features are applied in the following order:

1. "Transformation" stage:
   1. 1st addon (in order of appearance in the project settings)
      1. "Start" model transformations
      1. Model mixins
      1. Table mixins
      1. Field mixins
      1. "End" model transformations
   1. 2nd addon
      - ...
1. "Rendering" stage
   1. Pre-render tasks
      1. 1st addon tasks (in order of appearance)
      1. 2nd addon tasks (in order of appearance)
      1. ...
   1. Render tasks
      1. 1st addon tasks (in order of appearance)
      1. 2nd addon tasks (in order of appearance)
      1. ...

### Mixins

Mixins are objects that contain properties or functions that will be copied to
any object within the model if:

- Model object is at the given level (model, table, field, or source data set)
- Filter callback return `true`

The creation of mixin may look like this:

```js
// ...

/**
 * creates an instance of addon
 * @param {Object} options addon options (usually specified in the project
 *   file). See {@link module:latona/addons/latona-core-autofields} for
 *   details.
 * @param {function} addonCreateCb callback that returns an instance
 *   of `LatonaAddon`
 * @returns {LatonaAddon}
 */
const create = (options, addonCreateCb) => {
  const opt = Object.assign({}, defaults, options);

  if (!addonCreateCb || typeof addonCreateCb !== "function") {
    throw new Error(`"addonCreateCb" is expected to be a function`);
  }
  //...

  const addon = addonCreateCb("MyAddon", "My addon description");
  addon.addTableMixin(
    // mixin object
    {
      bar() {
        return "bar";
      }
    },
    // filtering callback - optional
    obj => {
      return true;
    }
  );

  //...
  return addon;
};

// addon module should export the `create` function and `defaults` object
module.exports.create = create;
module.exports.defaults = defaults;
```

`LatonaAddon` supports three function for adding mixins:

- [.addTableMixin(mixin, [filter])](./API.md#LatonaAddon+addTableMixin)
- [.addFieldMixin(mixin, [filter])](./API.md#LatonaAddon+addFieldMixin)
- [.addModelMixin(mixin, [filter])](./API.md#LatonaAddon+addModelMixin)
- [.addFieldMixin(mixin, [filter])]()
- [.addSourceDataSetMixin(mixin, [filter])](./API.md#LatonaAddon+addSourceDataSetMixin)

**Notes:**

- Avoid using [getters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get)
  if you want to use `this.` to access object properties, use functions with no
  parameters instead

### Model transformations

Model transformations are just callback functions that get called before or
after mixins are applied (or both - depends on parameters). The transformation
call back will receive the `model` as a parameter and should return it back,
reference to the `project` will be passed as the second parameter:

```js
const create = (options, addonCreateCb) => {
  //...
  const addon = addonCreateCb("MyAddon", "My addon description");
  addon.addModelTransformation((model, project) => {
    // use `project.getResolvedProjectPath()` to get full path to the
    // project folder
    //...
    return model;
  });

  //...
  return addon;
};

// addon module should export the `create` function and `defaults` object
module.exports.create = create;
module.exports.defaults = defaults;
```

`LatonaAddon` includes this function for registering a model transformation:

- [.addModelTransformation(func, [opt])](./API.md#LatonaAddon+addModelTransformation)

### Pre-processing tasks

Pre-processing tasks are also callback-based. Unlike model transformations,
pre-processing tasks receive a reference to the `LatonaProject` as the only
parameter. The callback is free to do whatever it needs to do.

`LatonaAddon` includes this function for registering a pre-processing task:

- [.addPreprocessingTask(func)](./API.md#LatonaAddon+addPreprocessingTask)

### Render tasks

Render tasks are based on `RenderTask` objects, which include one property and
one function:

- `template` - path to the `.mustache` template file (absolute path is
  recommended)
- `.itemsBuilder(model)` - callback function compatible with the
  [renderItemsCallback](./API.md#renderItemsCallback)

```js
const create = (options, addonCreateCb) => {
  //...
  const addon = addonCreateCb("MyAddon", "My addon description");
  addon.addRenderTask({
    // template should be a part of addon package
    template: templates.table,
    // project model will be passed to the itemBuilder
    itemsBuilder: model => {
      // array of items is expected as an output
      const items = model.tables.map(t => {
        return {
          fileName: `${opt.outPath}/${t.tableName}.md`,
          model: t
        };
      });

      return items;
    }
  });

  //...
  return addon;
};

// addon module should export the `create` function and `defaults` object
module.exports.create = create;
module.exports.defaults = defaults;
```
