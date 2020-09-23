/**
 * @fileoverview This module defines the `LatonaAddon` class.
 */

const { logger } = require("./utils/winstonLogger");
const {
  validateFunction,
  validateObject,
  validateStringNotEmpty
} = require("./utils/validation");
const { RenderTask } = require("./settings/render-task");

/**
 * Holds addon dependency information
 * @class
 * @property {string} addonName Addon's name
 * @property {string} reason Explains why the addon requires another addon
 */
class LatonaAddonDependency {
  /**
   * Creates an instance of the `LatonaAddonDependency` class
   * @param {string} addonName Addon's name
   * @param {string} reason Explains why the addon requires another addon
   */
  constructor(addonName, reason) {
    if (!validateStringNotEmpty(addonName)) {
      throw new Error(`"addonName" should be non-empty string`);
    }

    if (!validateStringNotEmpty(reason)) {
      throw new Error(`"reason" should be non-empty string`);
    }

    this.addonName = addonName;
    this.reason = reason;
  }
}

/**
 * Mixin filter callback -  should signal if associated mixin should be applied
 *   to the given table or field by returning `true`. Object will not be
 *   mutated if function returns `false`.
 * @callback mixinFilterCallback
 * @param {Object} obj Reference to the model object to check
 * @param {Model} obj.model Model object
 * @param {Table} [obj.table] Table object (will be passed for table and field
 *   mixins)
 * @param {Field} [obj.field] Field object (will be passed for field mixins)
 * @param {SourceDataSet} [obj.sourceDataSet] SourceDataSet object (will be
 *   passed for SourceDataSet mixins)
 * @returns {bool}
 */

/**
 * Holds details of an addon mixin object
 * @class
 * @property {Object} mixin Object to mix-in to the target model element
 * @property {mixinFilterCallback} [filter] Optional filter callback
 * @property {bool} hasFilter Flat to indicate if filter was set
 */
class LatonaMixin {
  /**
   * Creates an instance of the `LatonaMixin` class
   * @param {Object} mixin Object to mix-in to the target model element
   * @param {mixinFilterCallback} [filter=undefined] Optional filter callback
   */
  constructor(mixin, filter = undefined) {
    const { isObject } = validateObject(mixin);

    if (!isObject) {
      throw new Error(`"mixin" parameter must be specified and be an object`);
    }

    this.mixin = mixin;

    if (filter !== undefined) {
      const { isFunction } = validateFunction(filter);

      if (!isFunction) {
        throw new Error(`"filter" parameter must be a function`);
      }

      this.filter = filter;
    }
  }

  get hasFilter() {
    return this.filter !== undefined;
  }
}

/**
 * Project pre-processing callback. Pre-processing functions will be executed
 *   before rendering any code artifacts. The purpose of the function is up to
 *   addon developers and can do anything including validation, old files
 *   cleanup, etc.
 * @callback preprocessingTaskCallback
 * @param {LatonaProject} project Reference to the latona project object
 */

/**
 * Model transform callback - may implement any extra manipulation/mutation of
 * the model (ex: adding extra fields or tables, metadata enrichment, etc.)
 * @callback modelTransformCallback
 * @param {Model} model Reference to the latona model object
 * @param {LatonaProject} project Reference to the latona project object
 * @returns {Model}
 */

/**
 * Provides API for extending the Latona functionality. Latona addons should be
 * instantiated by addon modules, which can use chainable methods defined in
 * this class.
 * @class
 * @property {string} name Addon name. Can be any string.
 *   [`LatonaProject`]{@link LatonaProject} will use this property to check for
 *   dependencies.
 * @property {string} [description] Addon description. May be used to generate
 *   project documentation.
 * @property {LatonaAddonDependency[]} dependencies Array of addon names on
 *   which this addon relies. Latona project will issue warning if some
 *   dependencies are not included into the project composition.
 * @property {preprocessingTaskCallback[]} preprocessingTasks Array of
 *   [pre-processing callbacks]{@link preprocessingTask}.
 * @property {RenderTask[]} renderTasks Array of
 *   [`RenderTask`]{@link RenderTask} objects. Latona project will execute them
 *   at code generation time on a FIFO basis.
 * @property {LatonaMixin[]} tableMixins Array of table-level mixins
 *   (see {@link LatonaMixin})
 * @property {LatonaMixin[]} fieldMixins Array of field-level mixins
 *   (see {@link LatonaMixin})
 * @property {LatonaMixin[]} modelMixins Array of model-level mixins
 *   (see {@link LatonaMixin})
 * @property {LatonaMixin[]} sourceDataSetMixins Array of mixins for
 *   source data sets (see {@link LatonaMixin})
 * @property {modelTransformCallback[]} startModelTransformations
 *   Array of model transformation functions to be executed before mixins applied
 *   (see {@link modelTransformCallback})
 * @property {modelTransformCallback[]} endModelTransformations
 *   Array of model transformation functions to be executed after mixins applied
 *   (see {@link modelTransformCallback})
 */
class LatonaAddon {
  /**
   * Creates an instance of the `LatonaAddon` class
   * @param {string} name Addon name. Can be any string. `LatonaProject` will
   *   use this property to check for dependencies.
   * @param {string} [description=] Addon description. May be used to generate
   *   project documentation.
   */
  constructor(name, description = "") {
    if (!name || typeof name !== "string") {
      throw new Error('"name" should be specified and should be a string');
    }

    if (description === undefined || typeof description !== "string") {
      throw new Error('"description" should be a string');
    }

    logger.info(`Creating addon: ${name}`);

    this.name = name;
    this.description = description;
    this.dependencies = [];
    this.preprocessingTasks = [];
    this.renderTasks = [];
    this.tableMixins = [];
    this.fieldMixins = [];
    this.modelMixins = [];
    this.sourceDataSetMixins = [];
    this.startModelTransformations = [];
    this.endModelTransformations = [];
  }

  /**
   * Creates `LatonaMixin` object and adds it to the given array
   * @param {LatonaMixin[]} arr
   * @param {Object} mixin
   * @param {mixinFilterCallback} [filter]
   * @private
   */
  static addMixinToArray(arr, mixin, filter) {
    arr.push(new LatonaMixin(mixin, filter));
  }

  /**
   * Adds addon dependency (also - see {@link LatonaAddonDependency})
   * @param {string} addonName Addon's name
   * @param {string} reason Explains why the addon requires another addon
   * @returns {LatonaAddon}
   */
  addDependency(addonName, reason) {
    this.dependencies.push(new LatonaAddonDependency(addonName, reason));
    logger.info(`added addon dependency ${this.name}->${addonName}`);
    return this;
  }

  /**
   * Adds addon pre-processing callback function, which will be executed
   *   before rendering any code artifacts. (see {@link preprocessingTaskCallback})
   * @param {preprocessingTaskCallback} func Preprocessing function
   * @returns {LatonaAddon}
   */
  addPreprocessingTask(func) {
    const { isFunction } = validateFunction(func);
    if (!isFunction) {
      throw new Error('"func" parameter must be a function');
    }

    this.preprocessingTasks.push(func);
    logger.info(
      `added pre-processing task for ${this.name} ` +
        `(now ${this.preprocessingTasks.length} task(s))`
    );

    return this;
  }

  /**
   * Adds render task to the addon
   * @param {Object} options Render task options (see {@link RenderTask})
   * @returns {LatonaAddon}
   */
  addRenderTask(options) {
    this.renderTasks.push(new RenderTask(options));
    logger.info(
      `added render task for ${this.name} ` +
        `(now ${this.renderTasks.length} task(s))`
    );
    return this;
  }

  /**
   * Adds table mixin to the addon
   * @param {Object} mixin Object to mix-in to the target model element
   * @param {mixinFilterCallback} [filter=undefined] Optional filter callback
   * @returns {LatonaAddon}
   */
  addTableMixin(mixin, filter) {
    LatonaAddon.addMixinToArray(this.tableMixins, mixin, filter);
    logger.info(
      `added table mixin for ${this.name} ` +
        `(now ${this.tableMixins.length} mixin(s))`
    );
    return this;
  }

  /**
   * Adds field mixin to the addon
   * @param {Object} mixin Object to mix-in to the target model element
   * @param {mixinFilterCallback} [filter=undefined] Optional filter callback
   * @returns {LatonaAddon}
   */
  addFieldMixin(mixin, filter) {
    LatonaAddon.addMixinToArray(this.fieldMixins, mixin, filter);
    logger.info(
      `added field mixin for ${this.name} ` +
        `(now ${this.fieldMixins.length} mixin(s))`
    );
    return this;
  }

  /**
   * Adds model mixin to the addon
   * @param {Object} mixin Object to mix-in to the target model element
   * @param {mixinFilterCallback} [filter=undefined] Optional filter callback
   * @returns {LatonaAddon}
   */
  addModelMixin(mixin, filter) {
    LatonaAddon.addMixinToArray(this.modelMixins, mixin, filter);
    logger.info(
      `added model mixin for ${this.name} ` +
        `(now ${this.modelMixins.length} mixin(s))`
    );
    return this;
  }

  /**
   * Adds source data set mixin to the addon
   * @param {Object} mixin Object to mix-in to the target model element
   * @param {mixinFilterCallback} [filter=undefined] Optional filter callback
   * @returns {LatonaAddon}
   */
  addSourceDataSetMixin(mixin, filter) {
    LatonaAddon.addMixinToArray(this.sourceDataSetMixins, mixin, filter);
    logger.info(
      `added source data set mixin for ${this.name} ` +
        `(now ${this.sourceDataSetMixins.length} mixin(s))`
    );
    return this;
  }

  /**
   * Adds model transformation callback function to the addon
   * @param {modelTransformCallback} func
   * @param {Object} [opt] options object (optional)
   * @param {boolean} [opt.runOnStart] run transformation before mixins applied
   *   (default = false)
   * @param {boolean} [opt.runOnEnd] run transformation after mixins applied
   *   (default = true)
   * @returns {LatonaAddon}
   */
  addModelTransformation(func, opt = {}) {
    const { isFunction } = validateFunction(func);
    const { runOnStart = false, runOnEnd = true } = opt;

    if (!isFunction) {
      throw new Error('"func" parameter must be a function');
    }

    if (runOnStart) {
      this.startModelTransformations.push(func);
      logger.info(
        `added  model transformation for ${this.name} - runs before mixins` +
          `(now ${this.startModelTransformations.length} transformation(s))`
      );
    }
    if (runOnEnd) {
      this.endModelTransformations.push(func);
      logger.info(
        `added model transformation for ${this.name} - runs after mixins` +
          `(now ${this.endModelTransformations.length} transformation(s))`
      );
    }

    return this;
  }

  /**
   * Creates an instance of the `LatonaAddon` class
   * @param {string} name Addon name. Can be any string. `LatonaProject` will
   *   use this property to check for dependencies.
   * @param {string} [description=] Addon description. May be used to generate
   *   project documentation.
   * @returns {LatonaAddon}
   */
  static create(name, description = "") {
    return new LatonaAddon(name, description);
  }
}

module.exports = { LatonaAddon, LatonaAddonDependency, LatonaMixin };
