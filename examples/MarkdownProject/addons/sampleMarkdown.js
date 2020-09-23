// load LatonaAddon class
const path = require("path");

// addon options defaults - add more options as needed
const defaults = {
  outPath: "./output"
};

const templates = {
  index: path.resolve(__dirname, "./templates/index.mustache"),
  table: path.resolve(__dirname, "./templates/table.mustache")
};

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
  if (!addonCreateCb || typeof addonCreateCb !== "function") {
    throw new Error(`"addonCreateCb" is expected to be a function`);
  }

  const opt = Object.assign({}, defaults, options);

  const validateOptions = o => {
    if (!o.outPath || typeof o.outPath !== "string") {
      throw new Error("outPath is required");
    }
  };

  validateOptions(opt);

  // create addon object with unique name and meaningful description
  const addon = addonCreateCb("sampleMarkdown", "Sample Markdown addon");

  // add addon extensions
  addon
    .addTableMixin({
      hasReferences() {
        return (
          this.references &&
          Array.isArray(this.references) &&
          this.references.length > 0
        );
      }
    })
    .addRenderTask({
      // template should be a part of addon package
      template: templates.index,
      // project model will be passed to the itemBuilder
      itemsBuilder: model => {
        // array of items is expected as an output
        const items = [];

        // each item should have ...
        items.push({
          // fileName property (relative to project dir or absolute)
          fileName: `${opt.outPath}/_index.md`,
          // model (whatever is expected by your template)
          model
        });

        return items;
      }
    })
    .addRenderTask({
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

  return addon;
};

// addon module should export the `create` function and `defaults` object
module.exports.create = create;
module.exports.defaults = defaults;
