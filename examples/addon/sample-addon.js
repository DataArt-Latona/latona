/*
const path = require("path");

// addon options defaults - add more options as needed
const defaults = {
  templatePath: __dirname,
  outPath: "./output"
};
*/

// /**
//  * creates an instance of addon
//  * @param {Object} options addon options (usually specified in the project
//  *   file). See {@link module:latona/addons/latona-core-autofields} for
//  *   details.
//  * @param {function} addonCreateCb callback that returns an instance
//  *   of `LatonaAddon`
//  * @returns {LatonaAddon}
//  */
/*
const create = (options, addonCreateCb) => {
  const opt = Object.assign({}, defaults, options);

  if (!addonCreateCb || typeof addonCreateCb !== "function") {
    throw new Error(`"addonCreateCb" is expected to be a function`);
  }

  const validateOptions = o => {
    // implement options validation
  };

  validateOptions(opt);

  // create addon object with unique name and meaningful description
  const addon = addonCreateCb("MyAddon", "My addon description");

  // add addon extensions
  addon
    // model mixin - extends model object (use functions and properties)
    .addModelMixin({
      foo() {
        return "foo";
      }
    })
    // table mixin - extends table object
    .addTableMixin(
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
    )
    // filter mixin - extends field object (filters are supported -
    // see documentation)
    .addFieldMixin({
      myMethod() {
        return "myFieldValue";
      }
    })
    // sourceDataSet mixin - extends sourceDataSet object (filters are 
    // supported - see documentation)
    .addSourceDataSetMixin(
      {
        myMethod() {
          return "my data set value";
        }
      }
    )
    // modifies model object in any way
    .addModelTransformation(model => {
      // eslint-disable-next-line no-param-reassign
      model.foo = "bar";
      return model;
    })
    // adds callback to be called before processing starts
    .addPreprocessingTask(proj => {
      console.log(`project path: ${proj.getResolvedProjectPath()}`);
      console.log(`model file name: ${proj.modelFileName}`);
    })
    // adds render tasks
    // Note: relative file paths will be resolved by latona with
    // project folder as a base
    .addRenderTask({
      // template should be a part of addon package
      template: `${opt.templatePath}/template.mustache`,
      // project model will be passed to the itemBuilder
      itemsBuilder: model => {
        // array of items is expected as an output
        const items = [];

        // each item should have ...
        items.push({
          // fileName property (relative to project dir or absolute)
          fileName: `${opt.outPath}/file.html`,
          // model (whatever is expected by your template)
          model: { foo: "bar" }
        });

        return items;
      }
    });

  return addon;
};

// addon module should export the `create` function and `defaults` object
module.exports.create = create;
module.exports.defaults = defaults;
*/
