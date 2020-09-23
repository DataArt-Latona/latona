/**
 * Latona core API module.
 *
 * @module latona
 */
const { LatonaAddon } = require("./src/latona-addon");
const { LatonaProject, AddonModuleReference } = require("./src/latona-project");
const { Model } = require("./src/model");
const { Table } = require("./src/table");
const { render } = require("./src/utils/template");

/**
 * Extra Latona methods that simplify some advanced code generation scenarios
 * @alias module:latona.extras
 */
const extras = {
  /**
   * Renders *.mustache template (proxy to util method)
   * @param {string} templateFile Path to *.mustache template file
   * @param {Model} model An instance of [Model]{@link Model}
   * @param {Object} partials An object of partials
   */
  renderTemplate(templateFile, model, partials = {}) {
    return render(templateFile, model, partials);
  }
};

/**
 * Latona Core addon objects
 * @alias module:latona.extras.addons
 */
extras.addons = {};

/**
 * See {@link module:latona/addons/latona-core-autofields}
 * @alias module:latona.extras.addons.autoFields
 */
extras.addons.autoFields = require("./src/addons/latona-core-autofields");
/**
 * See {@link module:latona/addons/latona-core-clean-folders}
 * @alias module:latona.extras.addons.cleanFolders
 */
extras.addons.cleanFolders = require("./src/addons/latona-core-clean-folders");
/**
 * See {@link module:latona/addons/latona-core-copy-fields}
 * @alias module:latona.extras.addons.copyFields
 */
extras.addons.copyFields = require("./src/addons/latona-core-copy-fields");
/**
 * See {@link module:latona/addons/latona-core-dimensional}
 * @alias module:latona.extras.addons.dimensional
 */
extras.addons.dimensional = require("./src/addons/latona-core-dimensional");

/**
 * File system utilities - see {@link module:latona/extras/fs}
 * @alias module:latona.extras.fs
 */
extras.fs = require("./src/utils/fs");

/**
 * Latona core classes
 * @alias module:latona.core
 */
const core = {};
/**
 * See {@link module:latona/core/model}
 * @alias module:latona.core.Model
 */
core.Model = Model;
/**
 * See {@link module:latona/core/table}
 * @alias module:latona.core.Table
 */
core.Table = Table;

module.exports = {
  extras,
  core,
  /**
   * See {@link LatonaAddon}
   */
  LatonaAddon,
  /**
   * See {@link AddonModuleReference}
   */
  AddonModuleReference,
  /**
   * See {@link LatonaProject}
   */
  LatonaProject
};
